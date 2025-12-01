from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.models import Entry, CreateEntry
from app.database import entry_collection, file_collection
from app.databases.cassandra import cassandra_client

def serialize_mongo_obj(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, list):
        return [serialize_mongo_obj(item) for item in obj]
    if isinstance(obj, dict):
        return {k: serialize_mongo_obj(v) for k, v in obj.items()}
    return obj

router = APIRouter()

@router.post("/", response_description="Add new entry", response_model=Entry)
async def create_entry(entry: CreateEntry = Body(...)):
    # Check if user already has an entry for today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    existing_entry = await entry_collection.find_one({
        "userId": ObjectId(entry.userId),
        "date": {
            "$gte": today_start,
            "$lte": today_end
        }
    })
    
    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already created an entry today. Only one entry per day is allowed."
        )
    
    entry_dict = entry.model_dump()
    entry_dict["userId"] = ObjectId(entry_dict["userId"])
    # Handle song and files conversion if needed, but Pydantic might handle it if defined correctly
    # For now assuming song is passed as dict and files as list of strings
    
    new_entry = await entry_collection.insert_one(entry_dict)
    created_entry = await entry_collection.find_one({"_id": new_entry.inserted_id})
    
    #cassandra
    await cassandra_client.increment_entry_count(entry.userId)
    if entry_dict.get("song") and entry_dict["song"].get("_id"):
        await cassandra_client.log_song_selection(
            user_id = entry.userId,
            entry_id = str(created_entry["_id"]),
            song_id = entry_dict["song"]["_id"],
            mood = entry_dict["song"].get("mood", "unknown")
        )
        
    return created_entry

@router.patch("/{id}/add-file", response_description="Add file to entry", response_model=Entry)
async def add_file_to_entry(id: str, fileId: str = Body(..., embed=True)):
    # Validate entry exists
    entry = await entry_collection.find_one({"_id": ObjectId(id)})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Add file ID to files array
    result = await entry_collection.update_one(
        {"_id": ObjectId(id)},
        {"$push": {"files": ObjectId(fileId)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to add file to entry")
    
    # Return updated entry
    updated_entry = await entry_collection.find_one({"_id": ObjectId(id)})
    return updated_entry

@router.get("/", response_description="List all entries")
async def list_entries(userId: str = None):
    # Build aggregation pipeline to populate files
    pipeline = []
    
    # Match stage - filter by userId if provided
    if userId:
        try:
            pipeline.append({"$match": {"userId": ObjectId(userId)}})
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid userId format: {userId}"
            )
    
    # Lookup stage - populate files from file_collection
    pipeline.append({
        "$lookup": {
            "from": "files",
            "localField": "files",
            "foreignField": "_id",
            "as": "populatedFiles"
        }
    })
    
    # Execute aggregation
    entries = await entry_collection.aggregate(pipeline).to_list(1000)
    
    # Serialize and map populatedFiles to files
    serialized_entries = serialize_mongo_obj(entries)
    for entry in serialized_entries:
        if "populatedFiles" in entry:
            entry["files"] = entry["populatedFiles"]
            del entry["populatedFiles"]
            
    return serialized_entries

@router.get("/counts", response_description="Get weekly and monthly entry counts")
async def get_entry_counts(userId: str):
    pipeline = [
        {
            "$match": {
                "userId": ObjectId(userId)
            }
        },
        {
            "$addFields": {
                "year": { "$year": "$date" },
                "month": { "$month": "$date" },
                "week": { "$week": "$date" }
            }
        },
        {
            "$facet": {
                "thisWeek": [
                    {
                        "$match": {
                            "year": datetime.now().year,
                            "week": int(datetime.now().strftime("%U")) # Python's week number might differ slightly from Mongo's $week
                        }
                    },
                    { "$count": "count" }
                ],
                "thisMonth": [
                    {
                        "$match": {
                            "year": datetime.now().year,
                            "month": datetime.now().month
                        }
                    },
                    { "$count": "count" }
                ]
            }
        },
        {
            "$project": {
                "entriesThisWeek": { "$arrayElemAt": ["$thisWeek.count", 0] },
                "entriesThisMonth": { "$arrayElemAt": ["$thisMonth.count", 0] }
            }
        }
    ]
    
    result = await entry_collection.aggregate(pipeline).to_list(1)
    if result:
        return result[0]
    return {"entriesThisWeek": 0, "entriesThisMonth": 0}

@router.get("/top-songs", response_description="Get most played songs by mood")
async def get_top_songs():
    pipeline = [
        {
            "$match": {
                "song._id": { "$exists": True }
            }
        },
        {
            "$group": {
                "_id": {
                    "songId": "$song._id",
                    "mood": "$song.mood"
                },
                "count": { "$sum": 1 },
                "title": { "$first": "$song.title" },
                "artist": { "$first": "$song.artist" },
                "albumArt": { "$first": "$song.albumArt" }
            }
        },
        {
            "$sort": { "count": -1 }
        },
        {
            "$group": {
                "_id": "$_id.mood",
                "topSongs": {
                    "$push": {
                        "songId": "$_id.songId",
                        "title": "$title",
                        "artist": "$artist",
                        "albumArt": "$albumArt",
                        "playCount": "$count"
                    }
                }
            }
        },
        {
            "$project": {
                "mood": "$_id",
                "topSongs": { "$slice": ["$topSongs", 5] }
            }
        }
    ]
    
    result = await entry_collection.aggregate(pipeline).to_list(100)
    return serialize_mongo_obj(result)

@router.get("/{id}", response_description="Get a single entry", response_model=Entry)
async def show_entry(id: str):
    if (entry := await entry_collection.find_one({"_id": ObjectId(id)})) is not None:
        return entry
    raise HTTPException(status_code=404, detail=f"Entry {id} not found")

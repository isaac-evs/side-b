from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.models import Entry, CreateEntry
from app.database import entry_collection

router = APIRouter()

@router.post("/", response_description="Add new entry", response_model=Entry)
async def create_entry(entry: CreateEntry = Body(...)):
    entry_dict = entry.model_dump()
    entry_dict["userId"] = ObjectId(entry_dict["userId"])
    # Handle song and files conversion if needed, but Pydantic might handle it if defined correctly
    # For now assuming song is passed as dict and files as list of strings
    
    new_entry = await entry_collection.insert_one(entry_dict)
    created_entry = await entry_collection.find_one({"_id": new_entry.inserted_id})
    return created_entry

@router.get("/", response_description="List all entries", response_model=List[Entry])
async def list_entries(userId: str = None):
    if userId:
        entries = await entry_collection.find({"userId": ObjectId(userId)}).to_list(1000)
    else:
        entries = await entry_collection.find().to_list(1000)
    return entries

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
    return result

@router.get("/{id}", response_description="Get a single entry", response_model=Entry)
async def show_entry(id: str):
    if (entry := await entry_collection.find_one({"_id": ObjectId(id)})) is not None:
        return entry
    raise HTTPException(status_code=404, detail=f"Entry {id} not found")

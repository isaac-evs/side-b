from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from bson import ObjectId

from app.models import User, CreateUser, UpdateUser
from app.database import user_collection, entry_collection
from app.databases.cassandra import cassandra_client
from app.databases.dgraph import dgraph_client

router = APIRouter()

@router.post("/", response_description="Add new user", response_model=User)
async def create_user(user: CreateUser = Body(...)):
    user = user.model_dump()
    new_user = await user_collection.insert_one(user)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    
    # Sync user to Dgraph
    try:
        await dgraph_client.upsert_user(str(created_user["_id"]), created_user["username"])
    except Exception as e:
        print(f"Warning: Failed to sync user to Dgraph: {e}")
        
    return created_user

@router.get("/", response_description="List all users", response_model=List[User])
async def list_users():
    users = await user_collection.find().to_list(1000)
    return users

@router.get("/{id}", response_description="Get a single user", response_model=User)
async def show_user(id: str):
    if (user := await user_collection.find_one({"_id": ObjectId(id)})) is not None:
        return user
    raise HTTPException(status_code=404, detail=f"User {id} not found")

@router.put("/{id}", response_description="Update a user", response_model=User)
async def update_user(id: str, user: UpdateUser = Body(...)):
    user = {k: v for k, v in user.model_dump().items() if v is not None}
    if len(user) >= 1:
        update_result = await user_collection.update_one({"_id": ObjectId(id)}, {"$set": user})
        if update_result.modified_count == 1:
            if (updated_user := await user_collection.find_one({"_id": ObjectId(id)})) is not None:
                return updated_user
    if (existing_user := await user_collection.find_one({"_id": ObjectId(id)})) is not None:
        return existing_user
    raise HTTPException(status_code=404, detail=f"User {id} not found")

@router.get("/{id}/stats", response_description="Get user statistics")
async def get_user_stats(id: str):
    pipeline = [
        {
            "$match": {
                "userId": ObjectId(id)
            }
        },
        {
            "$group": {
                "_id": "$mood",
                "count": { "$sum": 1 },
                "entries": { "$push": "$$ROOT" }
            }
        },
        {
            "$group": {
                "_id": None,
                "totalEntries": { "$sum": "$count" },
                "moodCounts": {
                    "$push": {
                        "mood": "$_id",
                        "count": "$count"
                    }
                },
                "allEntries": { "$push": "$entries" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "totalEntries": 1,
                "moodCounts": 1,
                "totalDaysActive": {
                    "$size": {
                        "$setUnion": {
                            "$reduce": {
                                "input": "$allEntries",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": [
                                        "$$value",
                                        { "$map": {
                                            "input": "$$this",
                                            "as": "entry",
                                            "in": { "$dateToString": { "format": "%Y-%m-%d", "date": "$$entry.date" } }
                                        }}
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    ]
    
    stats = await entry_collection.aggregate(pipeline).to_list(1)
    if stats:
        return stats[0]
    return {"totalEntries": 0, "moodCounts": [], "totalDaysActive": 0}

#Cassandra. Gets monthly stats and song frequency
@router.get("/{id}/cassandra-stats", response_description="Get Cassandra statistics")
async def get_cassandra_stats(id: str, year_month: str = None):
    """Get monthly statistics from Cassandra"""
    try:
        stats = await cassandra_client.get_monthly_stats(id, year_month)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Cassandra stats: {str(e)}"
        )

@router.get("/{id}/song-frequency/{song_id}", response_description="Get song selection frequency")
async def get_song_frequency(id: str, song_id: str):
    """Get how many times a user has selected a song"""
    try:
        freq = await cassandra_client.get_song_frequency(id, song_id)
        return freq
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch song frequency: {str(e)}"
        )

router.delete("/{id}", response_description="Delete user account permanently")
async def delete_user(id: str):
    """
    Delete all Cassandra data for a user (logging, stats, attachments, etc.).
    WARNING: This is permanent and cannot be undone!
    """
    
    # Delete from Cassandra
    try:
        await cassandra_client.delete_user_all_data(id)
        
        return {
            "message": "User account permanently deleted",
            "user_id": id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete user from Cassandra: {str(e)}"
        )
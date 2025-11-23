from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from bson import ObjectId

from app.models import User, CreateUser, UpdateUser
from app.database import user_collection, entry_collection

router = APIRouter()

@router.post("/", response_description="Add new user", response_model=User)
async def create_user(user: CreateUser = Body(...)):
    user = user.model_dump()
    new_user = await user_collection.insert_one(user)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
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

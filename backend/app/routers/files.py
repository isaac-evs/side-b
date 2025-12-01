from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from bson import ObjectId

from app.models import FileModel, CreateFile
from app.database import file_collection
from app.databases.cassandra import cassandra_client

router = APIRouter()

@router.post("/", response_description="Add new file", response_model=FileModel)
async def create_file(file: CreateFile = Body(...)):
    file_dict = file.model_dump()
    file_dict["entryId"] = ObjectId(file_dict["entryId"])
    
    new_file = await file_collection.insert_one(file_dict)
    created_file = await file_collection.find_one({"_id": new_file.inserted_id})
    
    #cassandra
    await cassandra_client.log_media_attachment(
        user_id=file.userId,
        entry_id=file.entryId,
        file_id=str(created_file["_id"]),
        file_type=file.fileType,
    )
    
    return created_file

@router.get("/", response_description="List files", response_model=List[FileModel])
async def list_files(entryId: str = None):
    if entryId:
        files = await file_collection.find({"entryId": ObjectId(entryId)}).to_list(1000)
    else:
        files = await file_collection.find().to_list(1000)
    return files

@router.get("/stats", response_description="Get file statistics by type and mood")
async def get_file_stats(entryId: str):
    pipeline = [
        {
            "$match": {
                "entryId": ObjectId(entryId)
            }
        },
        {
            "$group": {
                "_id": {
                    "fileType": "$fileType",
                    "mood": "$mood"
                },
                "count": { "$sum": 1 }
            }
        },
        {
            "$group": {
                "_id": "$_id.fileType",
                "totalFiles": { "$sum": "$count" },
                "moodBreakdown": {
                    "$push": {
                        "mood": "$_id.mood",
                        "count": "$count"
                    }
                }
            }
        },
        {
            "$sort": { "totalFiles": -1 }
        }
    ]
    
    stats = await file_collection.aggregate(pipeline).to_list(100)
    return stats

@router.get("/{id}", response_description="Get a single file", response_model=FileModel)
async def show_file(id: str):
    if (file := await file_collection.find_one({"_id": ObjectId(id)})) is not None:
        return file
    raise HTTPException(status_code=404, detail=f"File {id} not found")

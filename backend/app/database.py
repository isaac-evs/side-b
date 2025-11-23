import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)

database = client.side_b_db

user_collection = database.get_collection("users")
entry_collection = database.get_collection("entries")
file_collection = database.get_collection("files")
song_collection = database.get_collection("songs")

async def create_indexes():
    # User Collection Indexes
    await user_collection.create_index("username", unique=True)
    await user_collection.create_index("email", unique=True)

    # Entries Collection Indexes
    await entry_collection.create_index([("userId", 1), ("date", 1)])
    await entry_collection.create_index("mood")
    await entry_collection.create_index("createdAt")

    # Files Collection Indexes
    await file_collection.create_index("entryId")
    await file_collection.create_index("mood")
    await file_collection.create_index("fileType")

    # Song Collection Indexes
    await song_collection.create_index("mood")
    await song_collection.create_index([("title", "text"), ("artist", "text")])

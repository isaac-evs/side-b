import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Connection String
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "side_b_db"

# Load real Deezer tracks from JSON file
with open("deezer_tracks.json", "r", encoding="utf-8") as f:
    REAL_SONGS = json.load(f)

async def seed_songs():
    print("🌱 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🗑️  Clearing existing songs...")
    await db["songs"].delete_many({})
    
    print(f"💿 Inserting {len(REAL_SONGS)} songs from Deezer API...")
    await db["songs"].insert_many(REAL_SONGS)
    
    # Print count by mood
    for mood in ["joy", "calm", "sad", "stress"]:
        count = await db["songs"].count_documents({"mood": mood})
        print(f"   - {mood}: {count} songs")
    
    print("✅ Done! Database seeded with real Deezer data.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_songs())

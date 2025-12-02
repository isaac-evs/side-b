"""
Seed MongoDB with 250 Deezer tracks that have AI-generated moods and descriptions.
"""

import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Connection String
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "side_b_db"

async def seed_songs():
    """Seed database with 250 songs"""
    
    # Check if the tracks file exists
    tracks_file = "deezer_tracks_250.json"
    if not os.path.exists(tracks_file):
        print(f"❌ Error: {tracks_file} not found!")
        print("💡 Please run 'python fetch_250_deezer_tracks.py' first")
        return
    
    # Load tracks
    print(f"📥 Loading tracks from {tracks_file}...")
    with open(tracks_file, 'r', encoding='utf-8') as f:
        SONGS = json.load(f)
    
    print(f"✅ Loaded {len(SONGS)} songs")
    
    print("🌱 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🗑️  Clearing existing songs...")
    await db["songs"].delete_many({})
    
    print(f"💿 Inserting {len(SONGS)} songs into database...")
    await db["songs"].insert_many(SONGS)
    
    # Print count by mood
    print(f"\n📊 Songs by mood:")
    for mood in ["joy", "calm", "sad", "stress"]:
        count = await db["songs"].count_documents({"mood": mood})
        print(f"   - {mood:8} {count:3} songs")
    
    # Total with previews
    with_preview = await db["songs"].count_documents({"previewUrl": {"$ne": None, "$ne": ""}})
    print(f"\n🎵 {with_preview} songs have preview URLs")
    
    print("\n✅ Done! Database seeded with 250 AI-classified songs.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_songs())

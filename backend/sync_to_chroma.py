import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "side_b_db")

async def sync_chroma():
    print("🔄 Starting ChromaDB Sync...")
    
    # Connect to MongoDB
    mongo_client = AsyncIOMotorClient(MONGO_URI)
    db = mongo_client[DB_NAME]
    entries_collection = db.entries
    
    # Connect to ChromaDB
    # We need to import the client instance from the app
    # But we need to initialize it first
    from app.databases.chromadb import chromadb_client
    
    print("[ChromaDB] INFO - Connecting to ChromaDB...")
    await chromadb_client.connect()
    await chromadb_client.initialize()
    print("[ChromaDB] INFO - Connected.")

    # Fetch all entries
    entries = await entries_collection.find({}).to_list(length=None)
    print(f"Found {len(entries)} entries to sync.")
    
    for entry in entries:
        entry_id = str(entry["_id"])
        user_id = str(entry["userId"])
        
        date = entry.get("date")
        if isinstance(date, str):
            try:
                date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            except ValueError:
                date = datetime.utcnow()
        elif not isinstance(date, datetime):
            date = datetime.utcnow()
            
        text = entry.get("text", "")
        if not text:
            continue
            
        print(f"   Syncing Entry: {entry_id} for User: {user_id}")
        
        try:
            metadata = {
                "userId": user_id,
                "date": date.isoformat(),
                "mood": entry.get("mood", "neutral")
            }
            
            song = entry.get("song")
            if song and isinstance(song, dict):
                metadata["song"] = song.get("title", "") or song.get("name", "")
                metadata["artist"] = song.get("artist", "")
                
            await chromadb_client.add_entry(
                entry_id=entry_id,
                text=text,
                metadata=metadata
            )
                
        except Exception as e:
            print(f"   ❌ Error syncing entry {entry_id}: {e}")

    # Sync Songs
    print("\n🎵 Syncing Songs...")
    songs_collection = db.songs
    songs = await songs_collection.find({}).to_list(length=None)
    print(f"Found {len(songs)} songs to sync.")

    for song in songs:
        song_id = str(song["_id"])
        title = song.get("title", "Unknown Title")
        description = song.get("description", "")
        mood = song.get("mood", "neutral")
        
        # If no description, use title + artist + mood as fallback
        if not description:
            artist = song.get("artist", "Unknown Artist")
            description = f"{title} by {artist}. A {mood} song."
            
        print(f"   Syncing Song: {title} ({mood})")
        
        try:
            metadata = {
                "title": title,
                "artist": song.get("artist", ""),
                "mood": mood,
                "album": song.get("album", "")
            }
            
            await chromadb_client.add_song(
                song_id=song_id,
                description=description,
                metadata=metadata
            )
        except Exception as e:
            print(f"   ❌ Error syncing song {song_id}: {e}")

    print("✅ Sync Complete!")
    await chromadb_client.disconnect()

if __name__ == "__main__":
    asyncio.run(sync_chroma())

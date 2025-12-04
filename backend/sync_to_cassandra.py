import asyncio
import os
import inspect
from motor.motor_asyncio import AsyncIOMotorClient
from app.databases.cassandra import cassandra_client
import app.databases.cassandra
print(f"DEBUG: Using cassandra module from {app.databases.cassandra.__file__}")
from datetime import datetime

# MongoDB Connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "side_b_db"

async def sync_cassandra():
    print("🔄 Starting Cassandra Sync...")
    
    # Connect Cassandra
    await cassandra_client.connect()
    
    # Truncate tables to avoid double counting
    print("   Truncating tables...")
    tables = ["journal_entries_by_user", "journal_entries_timeline", "user_monthly_stats", "song_selections_by_user", "song_selection_frequency"]
    for t in tables:
        try:
            await asyncio.to_thread(cassandra_client.session.execute, f"TRUNCATE {t}")
        except Exception as e:
            print(f"   Warning truncating {t}: {e}")
    
    # Connect Mongo
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    entries_collection = db["entries"]
    
    entries = await entries_collection.find({}).to_list(length=10000)
    print(f"Found {len(entries)} entries to sync.")
    
    for entry in entries:
        user_id = str(entry["userId"])
        entry_id = str(entry["_id"])
        date = entry.get("date")
        if isinstance(date, str):
            try:
                # Attempt to parse ISO format
                date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            except ValueError:
                print(f"   ⚠️ Warning: Could not parse date '{date}' for entry {entry_id}. Using current time.")
                date = datetime.utcnow()
        
        text = entry.get("text", "")
        
        print(f"   Syncing Entry: {entry_id} for User: {user_id}")
        
        try:
            # Log Journal Text (handles timeline and monthly stats)
            await cassandra_client.log_journal_text(
                user_id=user_id,
                entry_id=entry_id,
                text=text,
                created_at=date
            )
            
            # Log Song
            song = entry.get("song")
            if song and isinstance(song, dict):
                song_id = song.get("_id") or song.get("id") or song.get("songId")
                if song_id:
                    mood = song.get("mood", "unknown")
                    await cassandra_client.log_song_selection(
                        user_id=user_id,
                        entry_id=entry_id,
                        song_id=song_id,
                        mood=mood,
                        created_at=date
                    )
                
        except Exception as e:
            print(f"   ❌ Error syncing entry {entry_id}: {e}")

    print("✅ Sync Complete!")
    await cassandra_client.disconnect()

if __name__ == "__main__":
    asyncio.run(sync_cassandra())
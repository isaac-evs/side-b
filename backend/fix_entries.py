import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "side_b_db"

async def fix_entries():
    print("🔧 Starting Entry Fixer...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    entries_collection = db["entries"]
    songs_collection = db["songs"]
    
    # Fetch all entries
    entries = await entries_collection.find({}).to_list(length=1000)
    print(f"Found {len(entries)} entries to check.")
    
    updated_count = 0
    
    for entry in entries:
        if "song" in entry and entry["song"]:
            song_data = entry["song"]
            
            # Check if previewUrl is missing or empty
            if not song_data.get("previewUrl"):
                print(f"   ⚠️ Entry {entry['_id']} has song '{song_data.get('title')}' without previewUrl.")
                
                # Find matching song in songs collection
                # Try matching by Title and Artist
                matching_song = await songs_collection.find_one({
                    "title": song_data.get("title"),
                    "artist": song_data.get("artist")
                })
                
                if matching_song and matching_song.get("previewUrl"):
                    print(f"      ✅ Found match in DB with preview: {matching_song['previewUrl'][:30]}...")
                    
                    # Update the entry
                    await entries_collection.update_one(
                        {"_id": entry["_id"]},
                        {
                            "$set": {
                                "song.previewUrl": matching_song["previewUrl"],
                                "song.coverUrl": matching_song.get("coverUrl") or song_data.get("albumArt") # Also fix coverUrl if needed
                            }
                        }
                    )
                    updated_count += 1
                else:
                    print(f"      ❌ No matching song found in DB with previewUrl.")
            else:
                # print(f"   ✅ Entry {entry['_id']} already has previewUrl.")
                pass
                
    print(f"\n🎉 Finished! Updated {updated_count} entries.")
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_entries())

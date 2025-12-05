import asyncio
import os
import requests
import time
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "side_b_db"

# ---------------------------------------------------------
# 1. THE DATA (100 Songs with Moods & Descriptions)
# ---------------------------------------------------------
SONGS_DATA = [
    # --- JOY ---
    {"query": "Pharrell Williams - Happy", "mood": "joy", "description": "An infectious anthem of pure positivity."},
    {"query": "Katrina & The Waves - Walking On Sunshine", "mood": "joy", "description": "Instant energy booster that feels like summer."},
    {"query": "Mark Ronson - Uptown Funk", "mood": "joy", "description": "Funky, fresh, and impossible not to dance to."},
    {"query": "Justin Timberlake - Can't Stop the Feeling!", "mood": "joy", "description": "Sunshine in a bottle for your ears."},
    {"query": "OutKast - Hey Ya!", "mood": "joy", "description": "High-energy classic that gets everyone moving."},
    {"query": "Taylor Swift - Shake It Off", "mood": "joy", "description": "The ultimate carefree anthem for good vibes."},
    {"query": "The Beatles - Twist and Shout", "mood": "joy", "description": "Timeless rock and roll joy."},
    {"query": "Queen - Don't Stop Me Now", "mood": "joy", "description": "An explosion of energy and confidence."},
    {"query": "Earth, Wind & Fire - September", "mood": "joy", "description": "A disco classic that never fails to lift spirits."},
    {"query": "Kool & The Gang - Celebration", "mood": "joy", "description": "The soundtrack to every good time."},
    {"query": "ABBA - Dancing Queen", "mood": "joy", "description": "Pure pop perfection for the dance floor."},
    {"query": "Whitney Houston - I Wanna Dance with Somebody", "mood": "joy", "description": "80s pop euphoria at its finest."},
    {"query": "Cyndi Lauper - Girls Just Want to Have Fun", "mood": "joy", "description": "Playful, spirited, and full of life."},
    {"query": "The Beach Boys - Good Vibrations", "mood": "joy", "description": "Psychedelic sunshine pop masterpiece."},
    {"query": "Stevie Wonder - Signed, Sealed, Delivered", "mood": "joy", "description": "Soulful joy that hits the spot."},
    {"query": "Bruno Mars - 24K Magic", "mood": "joy", "description": "Glitzy, glamorous, and full of swagger."},
    {"query": "Dua Lipa - Levitating", "mood": "joy", "description": "Future nostalgia that makes you float."},
    {"query": "Lizzo - Good as Hell", "mood": "joy", "description": "Self-love anthem to boost your mood."},
    {"query": "Harry Styles - Watermelon Sugar", "mood": "joy", "description": "Sweet, summery, and effortlessly cool."},
    {"query": "BTS - Dynamite", "mood": "joy", "description": "Explosive disco-pop energy."},
    {"query": "Black Eyed Peas - I Gotta Feeling", "mood": "joy", "description": "The ultimate party starter."},
    {"query": "Daft Punk - Get Lucky", "mood": "joy", "description": "Smooth disco grooves for a good night."},
    {"query": "Avicii - Wake Me Up", "mood": "joy", "description": "Uplifting blend of folk and dance."},
    {"query": "Jason Mraz - I'm Yours", "mood": "joy", "description": "Laid-back happiness and love."},
    {"query": "Three Dog Night - Joy to the World", "mood": "joy", "description": "Classic rock joy for everyone."},

    # --- CALM ---
    {"query": "Norah Jones - Don't Know Why", "mood": "calm", "description": "Smooth jazz vocals to soothe the soul."},
    {"query": "Jack Johnson - Better Together", "mood": "calm", "description": "Acoustic warmth for a relaxing day."},
    {"query": "Ed Sheeran - Thinking Out Loud", "mood": "calm", "description": "Romantic and gentle acoustic ballad."},
    {"query": "Adele - Make You Feel My Love", "mood": "calm", "description": "A tender embrace in song form."},
    {"query": "John Legend - All of Me", "mood": "calm", "description": "Piano-driven love and serenity."},
    {"query": "Coldplay - Fix You", "mood": "calm", "description": "A slow build to emotional peace."},
    {"query": "The Beatles - Let It Be", "mood": "calm", "description": "Wisdom and comfort in a melody."},
    {"query": "Louis Armstrong - What a Wonderful World", "mood": "calm", "description": "A reminder of the beauty in life."},
    {"query": "Elton John - Your Song", "mood": "calm", "description": "Simple, sweet, and timelessly relaxing."},
    {"query": "Simon & Garfunkel - Bridge Over Troubled Water", "mood": "calm", "description": "Healing folk harmony."},
    {"query": "Fleetwood Mac - Landslide", "mood": "calm", "description": "Reflective and gentle acoustic beauty."},
    {"query": "Tracy Chapman - Fast Car", "mood": "calm", "description": "Mellow storytelling at its best."},
    {"query": "Bill Withers - Ain't No Sunshine", "mood": "calm", "description": "Smooth soul for quiet moments."},
    {"query": "Otis Redding - (Sittin' On) The Dock of the Bay", "mood": "calm", "description": "The ultimate song for doing nothing."},
    {"query": "Enya - Only Time", "mood": "calm", "description": "Ethereal sounds to drift away to."},
    {"query": "Yiruma - River Flows in You", "mood": "calm", "description": "Piano melody that flows like water."},
    {"query": "Ludovico Einaudi - Nuvole Bianche", "mood": "calm", "description": "Modern classical peace."},
    {"query": "Bon Iver - Skinny Love", "mood": "calm", "description": "Raw, acoustic intimacy."},
    {"query": "Iron & Wine - Flightless Bird, American Mouth", "mood": "calm", "description": "Soft indie folk for dreaming."},
    {"query": "Sufjan Stevens - Mystery of Love", "mood": "calm", "description": "Whisper-quiet and beautiful."},
    {"query": "Hozier - Cherry Wine", "mood": "calm", "description": "Hauntingly peaceful acoustic track."},
    {"query": "Vance Joy - Riptide", "mood": "calm", "description": "Ukulele vibes for a sunny afternoon."},
    {"query": "Ben E. King - Stand by Me", "mood": "calm", "description": "Classic soul comfort."},
    {"query": "Bob Marley - Three Little Birds", "mood": "calm", "description": "Don't worry about a thing."},
    {"query": "Israel Kamakawiwo'ole - Somewhere Over the Rainbow", "mood": "calm", "description": "Gentle ukulele magic."},
    {"query": "Men I Trust - Seven", "mood": "calm", "description": "Dreamy indie pop with smooth vocals."},
    {"query": "800 Cherries - Romantico", "mood": "calm", "description": "Romantic and soothing atmosphere."},
    {"query": "Hiroshi Yoshimura - 9", "mood": "calm", "description": "Ambient Japanese minimalism."},
    {"query": "Nujabes - Luvsic Part 2", "mood": "calm", "description": "Jazz hip-hop with peaceful vibes."},
    {"query": "Mitski - Lush", "mood": "calm", "description": "Ambient indie atmosphere."},
    {"query": "Brian Eno - Ambient 1", "mood": "calm", "description": "Pioneering ambient soundscapes."},
    {"query": "Lily Chou-Chou - Arabesque", "mood": "calm", "description": "Ethereal J-pop serenity."},
    {"query": "Antonio Carlos Jobim - Wave", "mood": "calm", "description": "Bossa nova classic tranquility."},

    # --- SAD ---
    {"query": "Adele - Someone Like You", "mood": "sad", "description": "Heartbreak poured into a piano ballad."},
    {"query": "Sam Smith - Stay With Me", "mood": "sad", "description": "Soulful longing and loneliness."},
    {"query": "Lewis Capaldi - Someone You Loved", "mood": "sad", "description": "Raw emotion and powerful vocals."},
    {"query": "Olivia Rodrigo - drivers license", "mood": "sad", "description": "Teenage heartbreak anthem."},
    {"query": "Billie Eilish - when the party's over", "mood": "sad", "description": "Quiet, haunting melancholy."},
    {"query": "Coldplay - The Scientist", "mood": "sad", "description": "Regret and love in a piano loop."},
    {"query": "R.E.M. - Everybody Hurts", "mood": "sad", "description": "A shoulder to cry on."},
    {"query": "Eric Clapton - Tears in Heaven", "mood": "sad", "description": "Deeply personal and moving grief."},
    {"query": "Johnny Cash - Hurt", "mood": "sad", "description": "A powerful reflection on life and regret."},
    {"query": "Sinead O'Connor - Nothing Compares 2 U", "mood": "sad", "description": "Raw vocal emotion."},
    {"query": "Whitney Houston - I Will Always Love You", "mood": "sad", "description": "The ultimate farewell ballad."},
    {"query": "Bruno Mars - When I Was Your Man", "mood": "sad", "description": "Piano regret at its finest."},
    {"query": "John Legend - Ordinary People", "mood": "sad", "description": "The struggles of love laid bare."},
    {"query": "James Arthur - Say You Won't Let Go", "mood": "sad", "description": "Bittersweet acoustic love."},
    {"query": "Ed Sheeran - Photograph", "mood": "sad", "description": "Nostalgic memories in song."},
    {"query": "Passenger - Let Her Go", "mood": "sad", "description": "Realizing value only after loss."},
    {"query": "The Fray - How to Save a Life", "mood": "sad", "description": "Desperation and helplessness."},
    {"query": "Snow Patrol - Chasing Cars", "mood": "sad", "description": "Lying together as the world falls apart."},
    {"query": "Green Day - Wake Me Up When September Ends", "mood": "sad", "description": "Rock ballad of loss."},
    {"query": "Evanescence - My Immortal", "mood": "sad", "description": "Gothic piano sorrow."},
    {"query": "Sarah McLachlan - Angel", "mood": "sad", "description": "Ideally sad and comforting."},
    {"query": "Jeff Buckley - Hallelujah", "mood": "sad", "description": "Hauntingly beautiful classic."},
    {"query": "Gary Jules - Mad World", "mood": "sad", "description": "A somber look at the world."},
    {"query": "Harry Styles - Falling", "mood": "sad", "description": "Vulnerable and emotional."},
    {"query": "Lorde - Liability", "mood": "sad", "description": "The loneliness of being too much."},

    # --- STRESS (High Energy / Release) ---
    {"query": "Eminem - Lose Yourself", "mood": "stress", "description": "Intense focus and determination."},
    {"query": "Linkin Park - In the End", "mood": "stress", "description": "Nu-metal angst release."},
    {"query": "Nirvana - Smells Like Teen Spirit", "mood": "stress", "description": "Grunge anthem for frustration."},
    {"query": "AC/DC - Thunderstruck", "mood": "stress", "description": "High voltage rock energy."},
    {"query": "Guns N' Roses - Welcome to the Jungle", "mood": "stress", "description": "Chaotic and wild rock."},
    {"query": "Metallica - Enter Sandman", "mood": "stress", "description": "Heavy metal power."},
    {"query": "Rage Against the Machine - Killing in the Name", "mood": "stress", "description": "Pure rebellious energy."},
    {"query": "System of a Down - Chop Suey!", "mood": "stress", "description": "Frantic, chaotic metal."},
    {"query": "The Prodigy - Firestarter", "mood": "stress", "description": "Electronic punk aggression."},
    {"query": "Skrillex - Bangarang", "mood": "stress", "description": "Dubstep chaos."},
    {"query": "The White Stripes - Seven Nation Army", "mood": "stress", "description": "Stomping rock rhythm."},
    {"query": "Survivor - Eye of the Tiger", "mood": "stress", "description": "The ultimate fight song."},
    {"query": "Kanye West - Stronger", "mood": "stress", "description": "Harder, better, faster, stronger."},
    {"query": "Jay-Z - 99 Problems", "mood": "stress", "description": "Gritty rap rock energy."},
    {"query": "Beastie Boys - Sabotage", "mood": "stress", "description": "High-speed chase music."},
    {"query": "Foo Fighters - The Pretender", "mood": "stress", "description": "Driving rock intensity."},
    {"query": "Red Hot Chili Peppers - Give It Away", "mood": "stress", "description": "Funk rock explosion."},
    {"query": "Blur - Song 2", "mood": "stress", "description": "Woo-hoo! Short sharp shock."},
    {"query": "The Killers - Mr. Brightside", "mood": "stress", "description": "Anxious energy anthem."},
    {"query": "Arctic Monkeys - Do I Wanna Know?", "mood": "stress", "description": "Heavy, stomping indie rock."},
    {"query": "Queens of the Stone Age - No One Knows", "mood": "stress", "description": "Driving desert rock."},
    {"query": "Muse - Uprising", "mood": "stress", "description": "Rebellious glam rock stomp."},
    {"query": "Imagine Dragons - Radioactive", "mood": "stress", "description": "Apocalyptic pop rock."},
    {"query": "Fall Out Boy - Sugar, We're Goin Down", "mood": "stress", "description": "Pop punk energy release."},
    {"query": "Panic! At The Disco - I Write Sins Not Tragedies", "mood": "stress", "description": "Theatrical rock drama."}
]

# ---------------------------------------------------------
# 2. FETCH AND SEED LOGIC
# ---------------------------------------------------------
async def fetch_and_seed():
    print(f"🚀 Starting Fast Seed for {len(SONGS_DATA)} songs...")
    
    final_songs = []
    
    for i, item in enumerate(SONGS_DATA):
        query = item["query"]
        print(f"[{i+1}/{len(SONGS_DATA)}] Searching Deezer for: {query}...")
        
        try:
            # Search Deezer
            response = requests.get(f"https://api.deezer.com/search?q={query}")
            data = response.json()
            
            if data and "data" in data and len(data["data"]) > 0:
                # Find the first track with a valid preview
                found_track = None
                for candidate in data["data"]:
                    if candidate.get("preview"):
                        found_track = candidate
                        break
                
                if found_track:
                    track = found_track
                    
                    # Construct Song Object
                    song_doc = {
                        "title": track["title"],
                        "artist": track["artist"]["name"],
                        "album": track["album"]["title"],
                        "coverUrl": track["album"]["cover_xl"],
                        "deezerLink": track["link"],
                        "previewUrl": track["preview"],
                        "mood": item["mood"],
                        "description": item["description"],
                        "duration": track["duration"]
                    }
                    final_songs.append(song_doc)
                    print(f"   ✅ Found with preview: {song_doc['title']} by {song_doc['artist']}")
                else:
                    print(f"   ⚠️ Found results but NO PREVIEW for: {query}")
            else:
                print(f"   ❌ No results found for {query}")
                
            # Rate limiting (Deezer is strict)
            time.sleep(0.3)
            
        except Exception as e:
            print(f"   ⚠️ Error fetching {query}: {e}")

    # ---------------------------------------------------------
    # 3. INSERT INTO MONGODB
    # ---------------------------------------------------------
    if not final_songs:
        print("❌ No songs fetched. Exiting.")
        return

    print("\n🌱 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🗑️  Clearing existing songs...")
    await db["songs"].delete_many({})
    
    print(f"💿 Inserting {len(final_songs)} songs into database...")
    result = await db["songs"].insert_many(final_songs)
    
    print("\n✅ SUCCESS! Database seeded with 100 songs.")
    
    # ---------------------------------------------------------
    # 4. SYNC TO CHROMADB IMMEDIATELY
    # ---------------------------------------------------------
    print("\n🔄 Syncing to ChromaDB...")
    from app.databases.chromadb import chromadb_client
    
    try:
        print("[ChromaDB] INFO - Connecting to ChromaDB...")
        await chromadb_client.connect()
        await chromadb_client.initialize()
        print("[ChromaDB] INFO - Connected.")
        
        # Clear existing songs collection to avoid duplicates
        try:
            chromadb_client.client.delete_collection(name="songs")
            print("✓ Deleted existing 'songs' collection.")
        except Exception as e:
            print(f"Note: Could not delete songs collection: {e}")
        
        # Reinitialize to create fresh collection
        await chromadb_client.initialize()
        
        print(f"🎵 Syncing {len(final_songs)} songs to ChromaDB...")
        
        # Get the inserted song IDs
        inserted_ids = result.inserted_ids
        songs_with_ids = await db["songs"].find({"_id": {"$in": inserted_ids}}).to_list(length=None)
        
        for song in songs_with_ids:
            song_id = str(song["_id"])
            title = song.get("title", "Unknown Title")
            description = song.get("description", "")
            mood = song.get("mood", "neutral")
            
            # If no description, use title + artist + mood as fallback
            if not description:
                artist = song.get("artist", "Unknown Artist")
                description = f"{title} by {artist}. A {mood} song."
                
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
        
        print("✅ ChromaDB sync complete!")
        await chromadb_client.disconnect()
        
    except Exception as e:
        print(f"❌ ChromaDB sync failed: {e}")
        import traceback
        traceback.print_exc()
    
    client.close()
    print("\n🎉 All done! Songs are in MongoDB and ChromaDB.")

if __name__ == "__main__":
    asyncio.run(fetch_and_seed())

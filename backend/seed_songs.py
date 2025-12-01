import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Connection String
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "side_b_db"

# Real Spotify Songs - 8 songs per mood category
# Using Wikimedia/Unsplash images for reliability instead of guessing Spotify CDN URLs
REAL_SONGS = [
    # JOY songs (8)
    {
        "title": "Happy",
        "artist": "Pharrell Williams",
        "album": "G I R L",
        "spotifyUri": "spotify:track:60nZcImufyMA1KT4e0pksA",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/2/23/Pharrell_Williams_-_G_I_R_L.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "mood": "joy",
        "description": "Impossible not to smile."
    },
    {
        "title": "Walking on Sunshine",
        "artist": "Katrina and The Waves",
        "album": "Walking on Sunshine",
        "spotifyUri": "spotify:track:05wIrZSwuaVWhcv5FfqeH0",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/a/a2/Katrina_and_the_Waves_-_Walking_on_Sunshine.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "mood": "joy",
        "description": "Pure sunshine in song form."
    },
    {
        "title": "Good as Hell",
        "artist": "Lizzo",
        "album": "Cuz I Love You",
        "spotifyUri": "spotify:track:6KgBpzTuTRPebChN0VTyzV",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/2/2b/Lizzo_-_Cuz_I_Love_You.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "mood": "joy",
        "description": "Self-love anthem."
    },
    {
        "title": "Can't Stop the Feeling!",
        "artist": "Justin Timberlake",
        "album": "Trolls",
        "spotifyUri": "spotify:track:6JV2JOEocMgcZxYSZelKcc",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/0/0c/Justin_Timberlake_-_Can%27t_Stop_the_Feeling.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "mood": "joy",
        "description": "Get up and dance!"
    },
    {
        "title": "Uptown Funk",
        "artist": "Mark Ronson ft. Bruno Mars",
        "album": "Uptown Special",
        "spotifyUri": "spotify:track:32OlwWuMpZ6b0aN2RZOeMS",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/a/a7/Mark_Ronson_-_Uptown_Special.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "mood": "joy",
        "description": "Funk you up!"
    },
    {
        "title": "Shake It Off",
        "artist": "Taylor Swift",
        "album": "1989",
        "spotifyUri": "spotify:track:0cqRj7pUJDkTCEsJkx8snD",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "mood": "joy",
        "description": "Shake off the haters."
    },
    {
        "title": "I Gotta Feeling",
        "artist": "Black Eyed Peas",
        "album": "The E.N.D.",
        "spotifyUri": "spotify:track:4VqPOruhp5EdPBeR92t6lQ",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/a/a4/The_Black_Eyed_Peas_-_The_E.N.D..png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "mood": "joy",
        "description": "Tonight's gonna be a good night."
    },
    {
        "title": "Don't Stop Me Now",
        "artist": "Queen",
        "album": "Jazz",
        "spotifyUri": "spotify:track:5T8EDUDqKcs6OSOwEsfqG7",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/0/06/Queen_Jazz.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "mood": "joy",
        "description": "Having a good time!"
    },
    
    # CALM songs (8)
    {
        "title": "Weightless",
        "artist": "Marconi Union",
        "album": "Weightless",
        "spotifyUri": "spotify:track:6kkwzB6hXLIONkEk9JciA6",
        "coverUrl": "https://images.unsplash.com/photo-1459749411177-3c2ea8156daa?w=500",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "mood": "calm",
        "description": "Scientifically proven to reduce anxiety."
    },
    {
        "title": "Clair de Lune",
        "artist": "Claude Debussy",
        "album": "Suite bergamasque",
        "spotifyUri": "spotify:track:66Gpc31FZaHeLQdN5J0c37",
        "coverUrl": "https://images.unsplash.com/photo-1520446266423-6daca23fe8c7?w=500",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        "mood": "calm",
        "description": "Moonlight in musical form."
    },
    {
        "title": "Breathe Me",
        "artist": "Sia",
        "album": "Colour the Small One",
        "spotifyUri": "spotify:track:3IufSq0Rz8p9A2m0F7VJcp",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/c/c2/Sia_-_Colour_the_Small_One.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        "mood": "calm",
        "description": "Vulnerability and peace."
    },
    {
        "title": "River Flows in You",
        "artist": "Yiruma",
        "album": "First Love",
        "spotifyUri": "spotify:track:2uxRzaNjT8M8C5R2Vp7Nma",
        "coverUrl": "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=500",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        "mood": "calm",
        "description": "Beautiful piano melody."
    },
    {
        "title": "The Night We Met",
        "artist": "Lord Huron",
        "album": "Strange Trails",
        "spotifyUri": "spotify:track:0QZ5yyl6B6utIWkxeBDxQN",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/7/76/Lord_Huron_-_Strange_Trails.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        "mood": "calm",
        "description": "Nostalgic and peaceful."
    },
    {
        "title": "Holocene",
        "artist": "Bon Iver",
        "album": "Bon Iver",
        "spotifyUri": "spotify:track:1Ku1WbP3OE7zf8hXuAHc0y",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/c/c3/Bon_Iver_-_Bon_Iver%2C_Bon_Iver.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        "mood": "calm",
        "description": "Ethereal and calming."
    },
    {
        "title": "Saturn",
        "artist": "Sleeping At Last",
        "album": "Atlas: Space",
        "spotifyUri": "spotify:track:5cgSWdlxIelg4OePZD4JCB",
        "coverUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        "mood": "calm",
        "description": "Cosmic serenity."
    },
    {
        "title": "Gymnopédie No. 1",
        "artist": "Erik Satie",
        "album": "Gymnopédies",
        "spotifyUri": "spotify:track:5XKJb8nVUEjZBTLX8k3m7Y",
        "coverUrl": "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?w=500",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        "mood": "calm",
        "description": "Timeless tranquility."
    },
    
    # SAD songs (8)
    {
        "title": "Someone Like You",
        "artist": "Adele",
        "album": "21",
        "spotifyUri": "spotify:track:4kflIGfjkRGfu3RFjw3Z72",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/1/1b/Adele_-_21.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "mood": "sad",
        "description": "A classic heartbreak anthem."
    },
    {
        "title": "Fix You",
        "artist": "Coldplay",
        "album": "X&Y",
        "spotifyUri": "spotify:track:7LVHVU3tWfcxj5aiPFEW4Q",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/2/28/Coldplay_X%26Y.svg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "mood": "sad",
        "description": "Healing through tears."
    },
    {
        "title": "Hurt",
        "artist": "Johnny Cash",
        "album": "American IV",
        "spotifyUri": "spotify:track:28cnXtME493VX9NOw9cIUh",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/6/6f/Johnny_Cash_-_American_IV_The_Man_Comes_Around.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "mood": "sad",
        "description": "Raw and emotional."
    },
    {
        "title": "Mad World",
        "artist": "Gary Jules",
        "album": "Donnie Darko OST",
        "spotifyUri": "spotify:track:3JOVTQ5h8HGFnDdp4VT3MP",
        "coverUrl": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "mood": "sad",
        "description": "Haunting and melancholic."
    },
    {
        "title": "Skinny Love",
        "artist": "Bon Iver",
        "album": "For Emma, Forever Ago",
        "spotifyUri": "spotify:track:0S5CQ8Gxm2cQ5dS1DqFqNy",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/a/a9/Bon_Iver_-_For_Emma%2C_Forever_Ago.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "mood": "sad",
        "description": "Fragile and beautiful."
    },
    {
        "title": "Everybody Hurts",
        "artist": "R.E.M.",
        "album": "Automatic for the People",
        "spotifyUri": "spotify:track:6PypGyiu0Y2lCDBN1XZEnP",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/7/7a/Automatic_for_the_people.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "mood": "sad",
        "description": "Hold on, hold on."
    },
    {
        "title": "The Sound of Silence",
        "artist": "Simon & Garfunkel",
        "album": "Sounds of Silence",
        "spotifyUri": "spotify:track:5y788ya4NvwhBznoDIcXwK",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/e/e6/Sounds_of_Silence.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "mood": "sad",
        "description": "Hello darkness, my old friend."
    },
    {
        "title": "Yesterday",
        "artist": "The Beatles",
        "album": "Help!",
        "spotifyUri": "spotify:track:3BQHpFgAp4l80e1XslIjNI",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/e/e7/Help%21_%28The_Beatles_album_-_cover_art%29.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "mood": "sad",
        "description": "All my troubles seemed so far away."
    },
    
    # STRESS songs (energetic/stress relief) (8)
    {
        "title": "Midnight City",
        "artist": "M83",
        "album": "Hurry Up, We're Dreaming",
        "spotifyUri": "spotify:track:1eyzqe2QqGZUmfcPZtrIyt",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/7/7e/M83_-_Hurry_Up%2C_We%27re_Dreaming.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "mood": "stress",
        "description": "The ultimate night drive song."
    },
    {
        "title": "Thunderstruck",
        "artist": "AC/DC",
        "album": "The Razors Edge",
        "spotifyUri": "spotify:track:57bgtoPSgt236HzfBOd8kj",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/e/e4/ACDC_-_The_Razors_Edge.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        "mood": "stress",
        "description": "Release the tension!"
    },
    {
        "title": "Eye of the Tiger",
        "artist": "Survivor",
        "album": "Eye of the Tiger",
        "spotifyUri": "spotify:track:2HHtWyy5CgaQbC7XSoOb0e",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/8/82/Eye_of_the_Tiger_-_Survivor.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        "mood": "stress",
        "description": "Rising up to the challenge."
    },
    {
        "title": "Lose Yourself",
        "artist": "Eminem",
        "album": "8 Mile",
        "spotifyUri": "spotify:track:1v7L65Lzy0j0vdpRjJewt1",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/3/35/Eminem_-_Lose_Yourself_CD_cover.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        "mood": "stress",
        "description": "One shot, one opportunity."
    },
    {
        "title": "Stronger",
        "artist": "Kanye West",
        "album": "Graduation",
        "spotifyUri": "spotify:track:0j2T0R9dR9qdJYsB7ciXhf",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        "mood": "stress",
        "description": "What doesn't kill you makes you stronger."
    },
    {
        "title": "Run the World (Girls)",
        "artist": "Beyoncé",
        "album": "4",
        "spotifyUri": "spotify:track:5L2cjz9TIHwTu2wU0cjx0p",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/c/c2/Beyonce_-_4.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        "mood": "stress",
        "description": "Empowerment anthem."
    },
    {
        "title": "Pump It",
        "artist": "Black Eyed Peas",
        "album": "Monkey Business",
        "spotifyUri": "spotify:track:2wPQbfJB7z3nUDOZfWjgaE",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/a/a5/Black_Eyed_Peas_-_Monkey_Business.png",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        "mood": "stress",
        "description": "Get your blood pumping."
    },
    {
        "title": "Enter Sandman",
        "artist": "Metallica",
        "album": "Metallica",
        "spotifyUri": "spotify:track:5sICkBXVmaCQk5aISGR3x1",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/en/2/2c/Metallica_-_Metallica_cover.jpg",
        "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        "mood": "stress",
        "description": "Heavy metal stress relief."
    },
]

async def seed_songs():
    print("🌱 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🗑️  Clearing existing songs...")
    await db["songs"].delete_many({})
    
    print(f"💿 Inserting {len(REAL_SONGS)} songs (8 per mood category)...")
    await db["songs"].insert_many(REAL_SONGS)
    
    # Print count by mood
    for mood in ["joy", "calm", "sad", "stress"]:
        count = await db["songs"].count_documents({"mood": mood})
        print(f"   - {mood}: {count} songs")
    
    print("✅ Done! Database seeded.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_songs())

"""
Fetch real track data from Deezer API and generate properly structured song entries.
Deezer provides 30s preview URLs which are required for the application.
"""

import requests
import json
import time

def search_deezer(query):
    """Search for a track on Deezer"""
    # Deezer API is public and doesn't require a token for basic search
    url = f"https://api.deezer.com/search?q={requests.utils.quote(query)}&limit=1"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"   ✗ Error searching Deezer for {query}: {e}")
        return None

def extract_track_data(track, mood=None, description=None):
    """Extract and format track data according to schema"""
    
    return {
        "title": track['title'],
        "artist": track['artist']['name'],
        "album": track['album']['title'],
        "coverUrl": track['album']['cover_xl'], # High res cover
        "spotifyUri": track['link'], # Storing Deezer link in existing field to minimize schema changes for now, or we can add a new one
        "deezerLink": track['link'],
        "previewUrl": track['preview'],
        "description": description or "",
        "mood": mood or "",
        "duration": track['duration']
    }

# Curated list of tracks to fetch (organized by mood)
TRACKS_TO_FETCH = {
    "joy": [
        ("Happy Pharrell Williams", "Impossible not to smile."),
        ("Walking on Sunshine Katrina and The Waves", "Pure sunshine in song form."),
        ("Good as Hell Lizzo", "Self-love anthem."),
        ("Can't Stop the Feeling Justin Timberlake", "Get up and dance!"),
        ("Uptown Funk Mark Ronson", "Funk you up!"),
        ("Shake It Off Taylor Swift", "Shake off the haters."),
        ("I Gotta Feeling Black Eyed Peas", "Tonight's gonna be a good night."),
        ("Don't Stop Me Now Queen", "Having a good time!"),
    ],
    "calm": [
        ("Weightless Marconi Union", "Scientifically proven to reduce anxiety."),
        ("Clair de Lune Debussy", "Moonlight in musical form."),
        ("Breathe Me Sia", "Vulnerability and peace."),
        ("River Flows in You Yiruma", "Beautiful piano melody."),
        ("The Night We Met Lord Huron", "Nostalgic and peaceful."),
        ("Holocene Bon Iver", "Ethereal and calming."),
        ("Saturn Sleeping At Last", "Cosmic serenity."),
        ("Gymnopédie No 1 Erik Satie", "Timeless tranquility."),
    ],
    "sad": [
        ("Someone Like You Adele", "A classic heartbreak anthem."),
        ("Fix You Coldplay", "Healing through tears."),
        ("Hurt Johnny Cash", "Raw and emotional."),
        ("Mad World Gary Jules", "Haunting and melancholic."),
        ("Skinny Love Bon Iver", "Fragile and beautiful."),
        ("Everybody Hurts REM", "Hold on, hold on."),
        ("The Sound of Silence Simon Garfunkel", "Hello darkness, my old friend."),
        ("Yesterday The Beatles", "All my troubles seemed so far away."),
    ],
    "stress": [
        ("Midnight City M83", "The ultimate night drive song."),
        ("Thunderstruck AC/DC", "Release the tension!"),
        ("Eye of the Tiger Survivor", "Rising up to the challenge."),
        ("Lose Yourself Eminem", "One shot, one opportunity."),
        ("Stronger Kanye West", "What doesn't kill you makes you stronger."),
        ("Run the World Girls Beyoncé", "Empowerment anthem."),
        ("Pump It Black Eyed Peas", "Get your blood pumping."),
        ("Enter Sandman Metallica", "Heavy metal stress relief."),
    ],
}

def main():
    """Fetch all tracks and generate JSON output"""
    print("🎵 Fetching tracks from Deezer API...\n")
    
    all_tracks = []
    
    for mood, tracks in TRACKS_TO_FETCH.items():
        print(f"📀 Fetching {mood.upper()} tracks...")
        
        for query, description in tracks:
            # Add a small delay to be nice to the API
            time.sleep(0.2)
            
            result = search_deezer(query)
            
            if result and 'data' in result and len(result['data']) > 0:
                track = result['data'][0]
                
                # Check if preview is available
                preview_status = "✓" if track.get('preview') else "✗"
                
                track_data = extract_track_data(track, mood=mood, description=description)
                all_tracks.append(track_data)
                print(f"   {preview_status} {track_data['title']} by {track_data['artist']}")
            else:
                print(f"   ✗ No results for: {query}")
        
        print()
    
    # Save to JSON file
    output_file = "deezer_tracks.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_tracks, f, indent=2, ensure_ascii=False)
    
    # Count tracks with previews
    with_preview = sum(1 for t in all_tracks if t.get('previewUrl'))
    
    print(f"\n✅ Fetched {len(all_tracks)} tracks!")
    print(f"🎵 {with_preview} tracks have preview URLs")
    print(f"📝 Saved to: {output_file}")
    
    # Print one example
    if all_tracks:
        print(f"\n📋 Example track data:")
        print(json.dumps(all_tracks[0], indent=2))

if __name__ == "__main__":
    main()

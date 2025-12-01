"""
Fetch real track data from Spotify API and generate properly structured song entries.
This script requires a Spotify access token and fetches live data for real tracks.
"""

import asyncio
import requests
import json
from datetime import datetime

# Spotify API Configuration
# Get your token from: https://developer.spotify.com/console/get-search-item/
# Note: This token expires, you'll need to refresh it periodically
SPOTIFY_TOKEN = "BQCni7lzyQ83yLXUPQg7lMmAVhHQf9edBmaHeZY06aARwj6KeuGFVOz0_fGMdztTbW_Rf1sYu27TKCrGAI2SGv7PDDIgQNUuOk-1bMHKutHctHDBhwoNk3eO2gC4K57EaJxQrnvntdQqTXZH6_XKaRp7h8NVADt-Hu7-0U5eLABbHvu786jTMme2lLIotD-fFkliouY2UfREsD0uTeqMWy7rdjIrm9I9t4ElplLtRPwBZdzu1x0b6Fw9U49BQRB463IsrGBi2vexPzXQYXXHs8KXogQC2swKc_o_4XOjyd5Kf6L1ZDbbDHO0ls_zLDIUYClX"

def fetch_spotify_api(endpoint, method="GET", body=None):
    """Fetch data from Spotify API"""
    url = f"https://api.spotify.com/{endpoint}"
    headers = {
        "Authorization": f"Bearer {SPOTIFY_TOKEN}",
    }
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        else:
            response = requests.post(url, headers=headers, json=body)
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            print("❌ Token expired! Get a new token from: https://developer.spotify.com/console/get-search-item/")
            print("   Click 'Get Token' with 'user-top-read' scope enabled")
        raise e

def search_track(query, limit=10):
    """Search for a track on Spotify"""
    endpoint = f"v1/search?q={requests.utils.quote(query)}&type=track&limit={limit}"
    return fetch_spotify_api(endpoint)

def get_track(track_id):
    """Get detailed track information"""
    endpoint = f"v1/tracks/{track_id}"
    return fetch_spotify_api(endpoint)

def extract_track_data(track_data, mood=None, description=None):
    """Extract and format track data according to schema"""
    track = track_data
    
    # Get the highest quality album art
    album_images = track['album']['images']
    cover_url = album_images[0]['url'] if album_images else None
    
    # Get preview URL if available
    preview_url = track.get('preview_url', None)
    
    return {
        "title": track['name'],
        "artist": ", ".join([artist['name'] for artist in track['artists']]),
        "album": track['album']['name'],
        "coverUrl": cover_url,
        "spotifyUri": track['uri'],
        "previewUrl": preview_url,
        "description": description or "",
        "mood": mood or "",
    }

# Curated list of tracks to fetch (organized by mood)
TRACKS_TO_FETCH = {
    "joy": [
        ("Happy Pharrell Williams", "Impossible not to smile."),
        ("Walking on Sunshine Katrina and The Waves", "Pure sunshine in song form."),
        ("Good as Hell Lizzo", "Self-love anthem."),
        ("Can't Stop the Feeling Justin Timberlake", "Get up and dance!"),
        ("Uptown Funk Mark Ronson Bruno Mars", "Funk you up!"),
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
    print("🎵 Fetching tracks from Spotify API...\n")
    
    all_tracks = []
    
    for mood, tracks in TRACKS_TO_FETCH.items():
        print(f"📀 Fetching {mood.upper()} tracks...")
        
        for query, description in tracks:
            try:
                # Search for the track
                search_result = search_track(query, limit=10)
                
                # Find first track with a preview URL
                track = None
                if search_result['tracks']['items']:
                    for item in search_result['tracks']['items']:
                        if item.get('preview_url'):
                            track = item
                            break
                    
                    # If no preview found, use first result anyway
                    if not track:
                        track = search_result['tracks']['items'][0]
                
                if track:
                    track_data = extract_track_data(track, mood=mood, description=description)
                    all_tracks.append(track_data)
                    preview_status = "✓" if track_data['previewUrl'] else "✗"
                    print(f"   {preview_status} {track_data['title']} by {track_data['artist']}")
                else:
                    print(f"   ✗ No results for: {query}")
                    
            except Exception as e:
                print(f"   ✗ Error fetching {query}: {e}")
                break  # Stop if we hit an error (likely expired token)
        
        print()
    
    # Save to JSON file
    output_file = "spotify_tracks.json"
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

"""
Fetch 250 tracks from Deezer API using AI-generated moods and descriptions.
This combines the LLM-generated classifications with real Deezer metadata.
"""

import requests
import json
import time
import os

def search_deezer(query):
    """Search for a track on Deezer"""
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
        "coverUrl": track['album']['cover_xl'],  # High res cover
        "spotifyUri": track['link'],  # Deezer link (keeping field name for compatibility)
        "deezerLink": track['link'],
        "previewUrl": track['preview'],
        "description": description or "",
        "mood": mood or "calm",
        "duration": track['duration']
    }

def main():
    """Fetch all tracks using AI-generated moods"""
    print("🎵 Fetching 250 tracks from Deezer API...\n")
    
    # Check if we have the generated moods file
    moods_file = "song_moods_generated.json"
    if not os.path.exists(moods_file):
        print(f"❌ Error: {moods_file} not found!")
        print("💡 Please run 'python generate_moods_with_llm.py' first")
        return
    
    # Load AI-generated moods and descriptions
    print(f"📥 Loading AI-generated moods from {moods_file}...")
    with open(moods_file, 'r', encoding='utf-8') as f:
        song_moods = json.load(f)
    
    print(f"✅ Loaded {len(song_moods)} songs with AI-generated classifications\n")
    
    all_tracks = []
    failed_queries = []
    
    print("🔍 Fetching track data from Deezer API...\n")
    
    for i, song_data in enumerate(song_moods, 1):
        query = song_data['query']
        mood = song_data['mood']
        description = song_data['description']
        
        print(f"[{i}/{len(song_moods)}] {query}")
        
        # Add a small delay to be nice to the API
        time.sleep(0.3)
        
        result = search_deezer(query)
        
        if result and 'data' in result and len(result['data']) > 0:
            track = result['data'][0]
            
            # Check if preview is available
            preview_status = "✓" if track.get('preview') else "✗"
            
            track_data = extract_track_data(track, mood=mood, description=description)
            all_tracks.append(track_data)
            
            print(f"   {preview_status} {track_data['title']} by {track_data['artist']} | Mood: {mood}")
        else:
            print(f"   ✗ No results found")
            failed_queries.append(query)
        
        # Save checkpoint every 50 songs
        if i % 50 == 0:
            checkpoint_file = f"deezer_tracks_checkpoint_{i}.json"
            with open(checkpoint_file, 'w', encoding='utf-8') as f:
                json.dump(all_tracks, f, indent=2, ensure_ascii=False)
            print(f"   💾 Checkpoint saved ({i} songs fetched)")
    
    # Save final results
    output_file = "deezer_tracks_250.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_tracks, f, indent=2, ensure_ascii=False)
    
    # Count tracks with previews
    with_preview = sum(1 for t in all_tracks if t.get('previewUrl'))
    
    # Mood distribution
    mood_counts = {}
    for track in all_tracks:
        mood = track['mood']
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"✅ Successfully fetched {len(all_tracks)}/{len(song_moods)} tracks!")
    print(f"🎵 {with_preview} tracks have preview URLs")
    print(f"📝 Saved to: {output_file}")
    
    if failed_queries:
        print(f"\n⚠️  {len(failed_queries)} queries failed:")
        for query in failed_queries[:10]:  # Show first 10
            print(f"   - {query}")
        if len(failed_queries) > 10:
            print(f"   ... and {len(failed_queries) - 10} more")
    
    print(f"\n📊 Mood Distribution:")
    for mood in sorted(mood_counts.keys()):
        count = mood_counts[mood]
        percentage = (count / len(all_tracks)) * 100
        print(f"   {mood:8} {count:3} songs ({percentage:.1f}%)")
    
    # Print example
    if all_tracks:
        print(f"\n📋 Example track:")
        print(json.dumps(all_tracks[0], indent=2))

if __name__ == "__main__":
    main()

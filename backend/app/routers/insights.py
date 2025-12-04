from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.databases.dgraph import dgraph_client

router = APIRouter()

@router.get("/{user_id}", response_description="Get user insights")
async def get_user_insights(user_id: str) -> Dict[str, Any]:
    """
    Get visual insights data for a user from the knowledge graph.
    """
    data = await dgraph_client.get_user_insights(user_id)
    
    if not data:
        # Return empty structure if no data found, rather than 404
        return {
            "username": "Unknown",
            "stats": {
                "total_entries": 0,
                "top_moods": [],
                "top_artists": [],
                "recent_activity": []
            },
            "graph_data": {
                "nodes": [],
                "links": []
            }
        }
    
    entries = data.get("created_entries", [])
    
    # Process data for frontend visualization
    
    # 1. Mood Distribution
    mood_counts = {}
    for entry in entries:
        mood = entry.get("mood", "unknown")
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    top_moods = [{"name": k, "value": v} for k, v in mood_counts.items()]
    top_moods.sort(key=lambda x: x["value"], reverse=True)
    
    # 2. Top Artists
    artist_counts = {}
    for entry in entries:
        song = entry.get("selected_song")
        if song:
            artist = song.get("artist", "Unknown")
            artist_counts[artist] = artist_counts.get(artist, 0) + 1
            
    top_artists = [{"name": k, "value": v} for k, v in artist_counts.items()]
    top_artists.sort(key=lambda x: x["value"], reverse=True)
    
    # 3. Graph Data (Songs connected by Mood)
    # We'll create a simple graph where nodes are Songs and Moods
    nodes = []
    links = []
    node_ids = set()
    
    # Add Mood Nodes
    for mood in mood_counts.keys():
        if mood not in node_ids:
            nodes.append({"id": mood, "type": "mood", "value": mood_counts[mood]})
            node_ids.add(mood)
            
    # Add Song Nodes and Links
    for entry in entries:
        song = entry.get("selected_song")
        mood = entry.get("mood")
        
        if song and mood:
            song_id = song.get("uid") or song.get("title") # Fallback
            if song_id not in node_ids:
                nodes.append({
                    "id": song_id, 
                    "type": "song", 
                    "name": song.get("title"),
                    "artist": song.get("artist"),
                    "value": 1
                })
                node_ids.add(song_id)
            
            # Link Song to Mood
            links.append({
                "source": mood,
                "target": song_id,
                "value": 1
            })

    return {
        "username": data.get("username"),
        "stats": {
            "total_entries": len(entries),
            "top_moods": top_moods,
            "top_artists": top_artists[:5], # Top 5
        },
        "graph_data": {
            "nodes": nodes,
            "links": links
        },
        "raw_entries": entries # Send raw entries for timeline if needed
    }

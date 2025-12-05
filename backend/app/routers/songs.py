from fastapi import APIRouter, Body, HTTPException, status
from typing import List, Union
from bson import ObjectId
from pydantic import BaseModel

from app.models import Song, SongModel
from app.database import song_collection
from app.services.mood_service import mood_service
from app.databases.chromadb import chromadb_client
from .entries import serialize_mongo_obj

router = APIRouter()

class RecommendationRequest(BaseModel):
    text: str

@router.post("/recommend", response_description="Recommend songs based on text", response_model=List[Union[SongModel, Song]])
async def recommend_songs(request: RecommendationRequest):
    """
    Classifies the mood of the input text using ChromaDB and returns matching songs.
    """
    mood = await mood_service.classify_mood(request.text)
    print(f"Recommendation requested for text: '{request.text[:30]}...' -> Detected Mood: {mood}")
    
    # Semantic search for songs with matching mood
    try:
        print(f"🔍 Querying ChromaDB for songs with mood={mood} and text='{request.text[:50]}...'")
        results = await chromadb_client.query_songs(
            query_text=request.text,
            mood=mood,
            n_results=8
        )
        
        print(f"📊 ChromaDB Results: {results}")
        
        song_ids = []
        if results and results['ids'] and len(results['ids']) > 0:
            song_ids = results['ids'][0]
            print(f"🎵 Found {len(song_ids)} song IDs from ChromaDB: {song_ids[:3]}...")
            
            # Print distances to see similarity scores
            if results.get('distances') and len(results['distances']) > 0:
                distances = results['distances'][0]
                print(f"📏 Similarity distances: {distances[:3]}...")
            
        if song_ids:
            # Fetch songs from MongoDB
            print(f"🔍 Converting song IDs to ObjectId format...")
            try:
                object_ids = [ObjectId(sid) for sid in song_ids]
                print(f"✅ Converted {len(object_ids)} IDs. First few: {object_ids[:3]}")
            except Exception as e:
                print(f"❌ Error converting IDs to ObjectId: {e}")
                raise
                
            query = {"_id": {"$in": object_ids}}
            print(f"🔍 MongoDB query: {query}")
            songs = await song_collection.find(query).to_list(8)
            print(f"📦 MongoDB returned {len(songs)} songs")
            
            if len(songs) == 0:
                print(f"⚠️ No songs found in MongoDB! Checking if IDs exist...")
                # Check if any song exists
                sample_song = await song_collection.find_one({})
                if sample_song:
                    print(f"✅ Sample song from DB has _id: {sample_song['_id']} (type: {type(sample_song['_id'])})")
                    print(f"❌ But we're looking for: {song_ids[0]} (type: {type(song_ids[0])})")
            
            # Sort songs based on the order returned by ChromaDB
            songs_map = {str(s["_id"]): s for s in songs}
            ordered_songs = []
            for sid in song_ids:
                if sid in songs_map:
                    ordered_songs.append(songs_map[sid])
            
            print(f"✅ Returning {len(ordered_songs)} semantically matched songs")
            
            # If we found fewer than 8 semantically similar songs, fill up with random songs of same mood
            if len(ordered_songs) < 8:
                existing_ids = {s["_id"] for s in ordered_songs}
                needed = 8 - len(ordered_songs)
                fallback_query = {
                    "mood": mood, 
                    "_id": {"$nin": list(existing_ids)}
                }
                fallback_songs = await song_collection.find(fallback_query).limit(needed).to_list(needed)
                ordered_songs.extend(fallback_songs)
                print(f"⚠️ Added {len(fallback_songs)} fallback songs to reach 8 total")
                
            return [serialize_mongo_obj(song) for song in ordered_songs]
        else:
            print("⚠️ No song IDs returned from ChromaDB, falling back to mood filter")
            
    except Exception as e:
        print(f"❌ Error in semantic search: {e}. Falling back to simple mood filter.")
        import traceback
        traceback.print_exc()
    
    # Fallback: simple mood filter
    print(f"⚠️ Using fallback: simple mood filter for mood={mood}")
    query = {"mood": mood}
    # Requirement: "top 8 song that fit the diary entry"
    songs = await song_collection.find(query).limit(8).to_list(8)
    
    return [serialize_mongo_obj(song) for song in songs]

@router.post("/", response_description="Add new song", response_model=Song)
async def create_song(song: Song = Body(...)):
    song = song.model_dump(by_alias=True)
    new_song = await song_collection.insert_one(song)
    created_song = await song_collection.find_one({"_id": new_song.inserted_id})
    return created_song

@router.get("/", response_description="List songs", response_model=List[Union[SongModel, Song]])
async def list_songs(mood: str = None, search: str = None, limit: int = 100):
    query = {}
    if mood:
        query["mood"] = mood
    
    if search:
        query["$text"] = {"$search": search}
    
    # If mood is specified, requirement says "fetch 8 songs per mood category"
    # But I'll make limit configurable, default to 8 if mood is present?
    if mood and limit == 100: # If limit wasn't explicitly changed from default
        limit = 8

    songs = await song_collection.find(query).limit(limit).to_list(limit)
    return [serialize_mongo_obj(song) for song in songs]


@router.get("/mood/{mood}", response_description="Get songs by mood", response_model=List[Union[SongModel, Song]])
async def get_songs_by_mood(mood: str, limit: int = 8):
    """Get songs filtered by mood, default 8 songs per mood category."""
    query = {"mood": mood}
    songs = await song_collection.find(query).limit(limit).to_list(limit)
    return [serialize_mongo_obj(song) for song in songs]


@router.get("/{id}", response_description="Get a single song", response_model=Song)
async def show_song(id: str):
    if (song := await song_collection.find_one({"_id": ObjectId(id)})) is not None:
        return song
    raise HTTPException(status_code=404, detail=f"Song {id} not found")

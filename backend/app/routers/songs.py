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
        results = await chromadb_client.query_songs(
            query_text=request.text,
            mood=mood,
            n_results=8
        )
        
        song_ids = []
        if results and results['ids'] and len(results['ids']) > 0:
            song_ids = results['ids'][0]
            
        if song_ids:
            # Fetch songs from MongoDB
            object_ids = [ObjectId(sid) for sid in song_ids]
            songs = await song_collection.find({"_id": {"$in": object_ids}}).to_list(8)
            
            # Sort songs based on the order returned by ChromaDB
            songs_map = {str(s["_id"]): s for s in songs}
            ordered_songs = []
            for sid in song_ids:
                if sid in songs_map:
                    ordered_songs.append(songs_map[sid])
            
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
                
            return [serialize_mongo_obj(song) for song in ordered_songs]
            
    except Exception as e:
        print(f"Error in semantic search: {e}. Falling back to simple mood filter.")
    
    # Fallback: simple mood filter
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

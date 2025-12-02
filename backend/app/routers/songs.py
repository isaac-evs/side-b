from fastapi import APIRouter, Body, HTTPException, status
from typing import List, Union
from bson import ObjectId
from pydantic import BaseModel

from app.models import Song, SongModel
from app.database import song_collection
from app.services.mood_service import mood_service
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
    
    # Reuse the logic to fetch songs by mood
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

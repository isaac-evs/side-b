from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import httpx
import os
import base64

router = APIRouter()

# You should ideally load these from environment variables
# For now, we will use placeholders. You MUST replace these or set env vars.
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "YOUR_SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "YOUR_SPOTIFY_CLIENT_SECRET")
# IMPORTANT: Must match exactly what you put in Spotify Dashboard
REDIRECT_URI = "http://127.0.0.1:5173/callback"

class TokenRequest(BaseModel):
    code: str

@router.post("/token")
async def get_spotify_token(request: TokenRequest):
    """
    Swaps the authorization code for an access token.
    """
    if CLIENT_ID == "YOUR_SPOTIFY_CLIENT_ID":
        raise HTTPException(status_code=500, detail="Spotify Client ID not configured on backend")

    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    auth_b64 = base64.b64encode(auth_string.encode()).decode()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://accounts.spotify.com/api/token",
                data={
                    "grant_type": "authorization_code",
                    "code": request.code,
                    "redirect_uri": REDIRECT_URI,
                },
                headers={
                    "Authorization": f"Basic {auth_b64}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            )
            
            if response.status_code != 200:
                print(f"Spotify Error: {response.text}")
                raise HTTPException(status_code=400, detail="Failed to get token from Spotify")
                
            return response.json()
        except httpx.RequestError as exc:
            print(f"An error occurred while requesting {exc.request.url!r}.")
            raise HTTPException(status_code=500, detail="Internal server error connecting to Spotify")

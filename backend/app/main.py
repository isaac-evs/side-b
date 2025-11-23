from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_indexes
from app.routers import users, entries, files, songs, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield

app = FastAPI(lifespan=lifespan)

# Configure CORS - Allow all localhost ports in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Side-B Backend"}

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(entries.router, prefix="/entries", tags=["entries"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(songs.router, prefix="/songs", tags=["songs"])

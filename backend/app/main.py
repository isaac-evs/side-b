from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_indexes
from app.databases.manager import db_manager
from app.databases.chromadb import chromadb_client
from app.services.mood_service import mood_service
from app.routers import users, entries, files, songs, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database indexes
    await db_manager.connect_all()
    await create_indexes()
    print("✓ Database initialized")
    # Initialize cassandra tables
    await db_manager.initialize_all()
    print("✓ Cassandra tables initialized")
    
    # Initialize ChromaDB
    await chromadb_client.connect()
    await chromadb_client.initialize()
    await mood_service.initialize_anchors()
    print("✓ ChromaDB initialized")
    
    yield
    await db_manager.disconnect_all()
    await chromadb_client.disconnect()
    # Shutdown: Clean up resources
    print("✓ Application shutdown")

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

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Backend is running"
    }

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(entries.router, prefix="/entries", tags=["entries"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(songs.router, prefix="/songs", tags=["songs"])

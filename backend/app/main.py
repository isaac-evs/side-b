from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_indexes
from app.databases.manager import db_manager
from app.routers import users, entries, files, songs, auth
from fastapi import APIRouter
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_manager.connect_all()
    await create_indexes()
    print("✓ Database initialized")
    await db_manager.initialize_all()
    print("✓ Cassandra tables initialized")
    
    yield
    await db_manager.disconnect_all()
    print("✓ Application shutdown")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Side-B Backend"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Backend is running"
    }

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(entries.router, prefix="/entries", tags=["entries"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(songs.router, prefix="/songs", tags=["songs"])

# Router de administración para limpiar Dgraph
admin_router = APIRouter()

@admin_router.post("/admin/reset-dgraph")
async def reset_dgraph_endpoint():
    await db_manager.reset_dgraph_data()
    return {"status": "OK", "message": "Dgraph data reset successfully"}

app.include_router(admin_router)

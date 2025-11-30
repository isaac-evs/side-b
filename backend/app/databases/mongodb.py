"""
MongoDB database client and collections.
Primary database for user data, entries, files, and songs.
"""
import os
from typing import Any, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from .base import DocumentDatabase


class MongoDBClient(DocumentDatabase):
    """MongoDB client implementation."""
    
    def __init__(self, connection_string: str = None):
        """
        Initialize MongoDB client.
        
        Args:
            connection_string: MongoDB connection string. If None, uses MONGO_DETAILS env var.
        """
        self.connection_string = connection_string or os.getenv(
            "MONGO_DETAILS", 
            "mongodb://localhost:27017"
        )
        self.client: Optional[AsyncIOMotorClient] = None
        self.database: Optional[AsyncIOMotorDatabase] = None
        
        # Collections
        self.user_collection: Optional[AsyncIOMotorCollection] = None
        self.entry_collection: Optional[AsyncIOMotorCollection] = None
        self.file_collection: Optional[AsyncIOMotorCollection] = None
        self.song_collection: Optional[AsyncIOMotorCollection] = None
    
    async def connect(self) -> None:
        """Establish connection to MongoDB."""
        self.client = AsyncIOMotorClient(self.connection_string)
        self.database = self.client.side_b_db
        
        # Initialize collections
        self.user_collection = self.database.get_collection("users")
        self.entry_collection = self.database.get_collection("entries")
        self.file_collection = self.database.get_collection("files")
        self.song_collection = self.database.get_collection("songs")
    
    async def disconnect(self) -> None:
        """Close connection to MongoDB."""
        if self.client:
            self.client.close()
    
    async def health_check(self) -> bool:
        """Check if MongoDB connection is healthy."""
        try:
            await self.client.admin.command('ping')
            return True
        except Exception:
            return False
    
    async def initialize(self) -> None:
        """Create indexes for MongoDB collections."""
        # User Collection Indexes
        await self.user_collection.create_index("username", unique=True)
        await self.user_collection.create_index("email", unique=True)

        # Entries Collection Indexes
        await self.entry_collection.create_index([("userId", 1), ("date", 1)])
        await self.entry_collection.create_index("mood")
        await self.entry_collection.create_index("createdAt")

        # Files Collection Indexes
        await self.file_collection.create_index("entryId")
        await self.file_collection.create_index("mood")
        await self.file_collection.create_index("fileType")

        # Song Collection Indexes
        await self.song_collection.create_index("mood")
        await self.song_collection.create_index([("title", "text"), ("artist", "text")])
    
    # DocumentDatabase interface implementation
    async def insert_one(self, collection: str, document: Dict[str, Any]) -> Any:
        """Insert a single document."""
        coll = self.database.get_collection(collection)
        return await coll.insert_one(document)
    
    async def insert_many(self, collection: str, documents: list) -> Any:
        """Insert multiple documents."""
        coll = self.database.get_collection(collection)
        return await coll.insert_many(documents)
    
    async def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find a single document."""
        coll = self.database.get_collection(collection)
        return await coll.find_one(query)
    
    async def find_many(self, collection: str, query: Dict[str, Any], limit: int = 100) -> list:
        """Find multiple documents."""
        coll = self.database.get_collection(collection)
        return await coll.find(query).to_list(limit)
    
    async def update_one(self, collection: str, query: Dict[str, Any], update: Dict[str, Any]) -> Any:
        """Update a single document."""
        coll = self.database.get_collection(collection)
        return await coll.update_one(query, update)
    
    async def delete_one(self, collection: str, query: Dict[str, Any]) -> Any:
        """Delete a single document."""
        coll = self.database.get_collection(collection)
        return await coll.delete_one(query)
    
    def get_collection(self, name: str) -> AsyncIOMotorCollection:
        """Get a collection by name."""
        return self.database.get_collection(name)


# Global MongoDB client instance
mongodb_client = MongoDBClient()


def get_mongodb_collections():
    """
    Get MongoDB collections.
    
    Returns:
        tuple: (user_collection, entry_collection, file_collection, song_collection)
    """
    return (
        mongodb_client.user_collection,
        mongodb_client.entry_collection,
        mongodb_client.file_collection,
        mongodb_client.song_collection
    )

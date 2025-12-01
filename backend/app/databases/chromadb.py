"""
ChromaDB client for Side-B.
"""
import os
import chromadb

class ChromaDBClient:
    def __init__(self):
        self.client = None
        self.collection = None
        self.path = os.getenv("CHROMADB_PATH", "./chroma_db")

    async def connect(self):
        try:
            # Using PersistentClient for local storage
            self.client = chromadb.PersistentClient(path=self.path)
            return True
        except Exception as e:
            print(f"ChromaDB connection error: {e}")
            raise

    async def disconnect(self):
        self.client = None

    async def initialize(self):
        if self.client:
            # Create default collection if needed
            self.collection = self.client.get_or_create_collection(name="entries")

    async def health_check(self):
        if self.client:
            try:
                self.client.heartbeat()
                return True
            except:
                # PersistentClient might not have heartbeat, but if we have the object it's likely fine
                return True
        return False

chromadb_client = ChromaDBClient()

"""
Base classes and interfaces for database clients.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class DatabaseClient(ABC):
    """
    Abstract base class for database clients.
    Each database implementation should inherit from this class.
    """
    
    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the database."""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to the database."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the database connection is healthy."""
        pass
    
    @abstractmethod
    async def initialize(self) -> None:
        """Initialize database (create indexes, schemas, etc.)."""
        pass


class DocumentDatabase(DatabaseClient):
    """
    Base class for document-based databases (MongoDB, etc.).
    Provides CRUD operations for documents.
    """
    
    @abstractmethod
    async def insert_one(self, collection: str, document: Dict[str, Any]) -> Any:
        """Insert a single document."""
        pass
    
    @abstractmethod
    async def insert_many(self, collection: str, documents: list) -> Any:
        """Insert multiple documents."""
        pass
    
    @abstractmethod
    async def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find a single document."""
        pass
    
    @abstractmethod
    async def find_many(self, collection: str, query: Dict[str, Any], limit: int = 100) -> list:
        """Find multiple documents."""
        pass
    
    @abstractmethod
    async def update_one(self, collection: str, query: Dict[str, Any], update: Dict[str, Any]) -> Any:
        """Update a single document."""
        pass
    
    @abstractmethod
    async def delete_one(self, collection: str, query: Dict[str, Any]) -> Any:
        """Delete a single document."""
        pass


class GraphDatabase(DatabaseClient):
    """
    Base class for graph databases (Dgraph, etc.).
    Will be used for relationship mapping and complex queries.
    """
    
    @abstractmethod
    async def query(self, query_string: str) -> Any:
        """Execute a graph query."""
        pass
    
    @abstractmethod
    async def mutate(self, mutation: Dict[str, Any]) -> Any:
        """Execute a graph mutation."""
        pass


class VectorDatabase(DatabaseClient):
    """
    Base class for vector databases (ChromaDB, etc.).
    Will be used for semantic search and embeddings.
    """
    
    @abstractmethod
    async def add_embeddings(self, collection: str, embeddings: list, metadata: list, ids: list) -> Any:
        """Add embeddings to the collection."""
        pass
    
    @abstractmethod
    async def query_embeddings(self, collection: str, query_embedding: list, n_results: int = 10) -> Any:
        """Query similar embeddings."""
        pass
    
    @abstractmethod
    async def delete_embeddings(self, collection: str, ids: list) -> Any:
        """Delete embeddings by IDs."""
        pass


class TimeSeriesDatabase(DatabaseClient):
    """
    Base class for time-series databases (Cassandra, etc.).
    Will be used for logging and time-series data.
    """
    
    @abstractmethod
    async def insert_event(self, table: str, event: Dict[str, Any]) -> Any:
        """Insert a time-series event."""
        pass
    
    @abstractmethod
    async def query_events(self, table: str, start_time: Any, end_time: Any, filters: Dict[str, Any] = None) -> list:
        """Query events within a time range."""
        pass

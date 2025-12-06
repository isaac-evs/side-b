"""
Database module for Side-B application.
"""

from .base import (
    DatabaseClient,
    DocumentDatabase,
    GraphDatabase,
    VectorDatabase,
    TimeSeriesDatabase
)
from .mongodb import mongodb_client, get_mongodb_collections
from .cassandra import cassandra_client
from .dgraph import dgraph_client
from .chromadb import chromadb_client
from .manager import db_manager, DatabaseManager

__all__ = [
    # Base classes
    "DatabaseClient",
    "DocumentDatabase",
    "GraphDatabase",
    "VectorDatabase",
    "TimeSeriesDatabase",
    
    # MongoDB (active)
    "mongodb_client",
    "get_mongodb_collections",
    
    # Future databases (placeholders)
    "cassandra_client",
    "dgraph_client",
    "chromadb_client",
    
    # Database manager
    "db_manager",
    "DatabaseManager",
]

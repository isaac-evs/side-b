"""
Database Manager - Coordinates all database systems.
Handles initialization, health checks, and lifecycle management.
"""
from typing import Dict, List
from .mongodb import mongodb_client
from .cassandra import cassandra_client
from .dgraph import dgraph_client
from .chromadb import chromadb_client


class DatabaseManager:
    """
    Manages all database connections and lifecycle.
    """
    
    def __init__(self):
        self.databases = {
            "mongodb": mongodb_client,
            "cassandra": cassandra_client,
            "dgraph": dgraph_client,
            "chromadb": chromadb_client,
        }
        
        # Track which databases are active
        self.active_databases = ["mongodb", "cassandra"]  # Only MongoDB is active initially
    
    async def connect_all(self) -> None:
        """Connect to all active databases."""
        for db_name in self.active_databases:
            db_client = self.databases.get(db_name)
            if db_client:
                try:
                    await db_client.connect()
                    print(f"✓ Connected to {db_name}")
                except Exception as e:
                    print(f"✗ Failed to connect to {db_name}: {str(e)}")
    
    async def disconnect_all(self) -> None:
        """Disconnect from all active databases."""
        for db_name in self.active_databases:
            db_client = self.databases.get(db_name)
            if db_client:
                try:
                    await db_client.disconnect()
                    print(f"✓ Disconnected from {db_name}")
                except Exception as e:
                    print(f"✗ Failed to disconnect from {db_name}: {str(e)}")
    
    async def initialize_all(self) -> None:
        """Initialize all active databases (create indexes, schemas, etc.)."""
        for db_name in self.active_databases:
            db_client = self.databases.get(db_name)
            if db_client:
                try:
                    await db_client.initialize()
                    print(f"✓ Initialized {db_name}")
                except Exception as e:
                    print(f"✗ Failed to initialize {db_name}: {str(e)}")
    
    async def health_check_all(self) -> Dict[str, bool]:
        """
        Check health of all active databases.
        
        Returns:
            Dict mapping database names to health status (True = healthy)
        """
        health_status = {}
        for db_name in self.active_databases:
            db_client = self.databases.get(db_name)
            if db_client:
                try:
                    is_healthy = await db_client.health_check()
                    health_status[db_name] = is_healthy
                except Exception:
                    health_status[db_name] = False
        return health_status
    
    def activate_database(self, db_name: str) -> None:
        """
        Activate a database for use.
        
        Args:
            db_name: Name of the database to activate (mongodb, cassandra, dgraph, chromadb)
        """
        if db_name in self.databases and db_name not in self.active_databases:
            self.active_databases.append(db_name)
            print(f"✓ Activated {db_name}")
    
    def deactivate_database(self, db_name: str) -> None:
        """
        Deactivate a database.
        
        Args:
            db_name: Name of the database to deactivate
        """
        if db_name in self.active_databases:
            self.active_databases.remove(db_name)
            print(f"✓ Deactivated {db_name}")
    
    def get_active_databases(self) -> List[str]:
        """Get list of currently active databases."""
        return self.active_databases.copy()


# Global database manager instance
db_manager = DatabaseManager()

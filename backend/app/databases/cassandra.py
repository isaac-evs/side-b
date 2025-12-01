"""
Cassandra client for Side-B logging.
Supports:
- Song selections
- Media attachments
- Monthly stats
"""

from cassandra.cluster import Cluster
from cassandra.query import SimpleStatement
from cassandra.concurrent import execute_concurrent
from cassandra import ConsistencyLevel
from datetime import datetime
import asyncio


class CassandraClient:
    def __init__(self):
        self.cluster = None
        self.session = None
        self.keyspace = "sideb"

    # CONNECTION
    async def connect(self):
        try:
            loop = asyncio.get_event_loop()

            self.cluster = Cluster(["127.0.0.1"])
            # connect() is blocking → run in thread
            self.session = await asyncio.to_thread(self.cluster.connect)

            # Create keyspace
            await asyncio.to_thread(
                self.session.execute,
                """
                CREATE KEYSPACE IF NOT EXISTS sideb
                WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
                """
            )

            self.session.set_keyspace(self.keyspace)

            # Create tables
            await self._create_schema()
            print("✓ Connected to Cassandra")
        except Exception as e:
            print(f"✗ Failed to connect to Cassandra: {e}")
            self.session = None
            self.cluster = None

    async def disconnect(self):
        if self.cluster:
            await asyncio.to_thread(self.cluster.shutdown)

    async def initialize(self):
        # Schema is created in connect(), so this is a placeholder for manager compatibility
        pass

    async def health_check(self):
        if self.session:
            try:
                await asyncio.to_thread(self.session.execute, "SELECT now() FROM system.local")
                return True
            except:
                return False
        return False

    async def _create_schema(self):
        if not self.session:
            return

        stmts = [
            """
            CREATE TABLE IF NOT EXISTS song_selections_by_user (
                user_id TEXT,
                selection_timestamp TIMESTAMP,
                entry_id TEXT,
                song_id TEXT,
                mood TEXT,
                PRIMARY KEY (user_id, selection_timestamp)
            ) WITH CLUSTERING ORDER BY (selection_timestamp DESC)
            """,
            """
            CREATE TABLE IF NOT EXISTS song_selection_frequency (
                user_id TEXT,
                song_id TEXT,
                selection_count COUNTER,
                PRIMARY KEY (user_id, song_id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS song_selection_timestamps (
                user_id TEXT,
                song_id TEXT,
                first_selected TIMESTAMP,
                last_selected TIMESTAMP,
                PRIMARY KEY (user_id, song_id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS media_attachments_log (
                user_id TEXT,
                entry_id TEXT,
                attachment_timestamp TIMEUUID,
                file_id TEXT,
                file_type TEXT,
                PRIMARY KEY ((user_id, entry_id), attachment_timestamp)
            ) WITH CLUSTERING ORDER BY (attachment_timestamp DESC)
            """,
            """
            CREATE TABLE IF NOT EXISTS user_monthly_stats (
                user_id TEXT,
                year_month TEXT,
                entries_count COUNTER,
                songs_selected_count COUNTER,
                media_attached_count COUNTER,
                PRIMARY KEY (user_id, year_month)
            ) WITH CLUSTERING ORDER BY (year_month DESC)
            """
        ]

        for stmt in stmts:
            await asyncio.to_thread(self.session.execute, stmt)

    # HELPERS
    def _year_month(self):
        return datetime.utcnow().strftime("%Y-%m")

    # WRITE OPERATIONS
    async def log_song_selection(self, user_id, entry_id, song_id, mood):
        if not self.session:
            return

        now = datetime.utcnow()
        ym = self._year_month()

        await asyncio.to_thread(
            self.session.execute,
            """
            INSERT INTO song_selections_by_user
            (user_id, selection_timestamp, entry_id, song_id, mood)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, now, entry_id, song_id, mood)
        )

        await asyncio.to_thread(
            self.session.execute,
            """
            UPDATE song_selection_frequency
            SET selection_count = selection_count + 1
            WHERE user_id = %s AND song_id = %s
            """,
            (user_id, song_id)
        )

        await asyncio.to_thread(
            self.session.execute,
            """
            INSERT INTO song_selection_timestamps
            (user_id, song_id, first_selected, last_selected)
            VALUES (%s, %s, %s, %s)
            IF NOT EXISTS
            """,
            (user_id, song_id, now, now)
        )

        await asyncio.to_thread(
            self.session.execute,
            """
            UPDATE song_selection_timestamps
            SET last_selected = %s
            WHERE user_id = %s AND song_id = %s
            """,
            (now, user_id, song_id)
        )

        await asyncio.to_thread(
            self.session.execute,
            """
            UPDATE user_monthly_stats
            SET songs_selected_count = songs_selected_count + 1
            WHERE user_id = %s AND year_month = %s
            """,
            (user_id, ym)
        )

    async def log_media_attachment(self, user_id, entry_id, file_id, file_type):
        if not self.session:
            return

        ym = self._year_month()

        await asyncio.to_thread(
            self.session.execute,
            """
            INSERT INTO media_attachments_log
            (user_id, entry_id, attachment_timestamp, file_id, file_type)
            VALUES (%s, %s, now(), %s, %s)
            """,
            (user_id, entry_id, file_id, file_type)
        )

        await asyncio.to_thread(
            self.session.execute,
            """
            UPDATE user_monthly_stats
            SET media_attached_count = media_attached_count + 1
            WHERE user_id = %s AND year_month = %s
            """,
            (user_id, ym)
        )

    async def increment_entry_count(self, user_id):
        if not self.session:
            return

        ym = self._year_month()

        await asyncio.to_thread(
            self.session.execute,
            """
            UPDATE user_monthly_stats
            SET entries_count = entries_count + 1
            WHERE user_id = %s AND year_month = %s
            """,
            (user_id, ym)
        )

    # READ OPERATIONS
    async def get_recent_song_selections(self, user_id, limit=10):
        if not self.session:
            return []

        rows = await asyncio.to_thread(
            self.session.execute,
            "SELECT * FROM song_selections_by_user WHERE user_id = %s LIMIT %s",
            (user_id, limit)
        )
        return [dict(r._asdict()) for r in rows]

    async def get_attachments_for_entry(self, user_id, entry_id):
        if not self.session:
            return []

        rows = await asyncio.to_thread(
            self.session.execute,
            "SELECT * FROM media_attachments_log WHERE user_id = %s AND entry_id = %s",
            (user_id, entry_id)
        )
        return [dict(r._asdict()) for r in rows]

    async def get_monthly_stats(self, user_id, year_month=None):
        if not self.session:
            return {
                "entries_count": 0,
                "songs_selected_count": 0,
                "media_attached_count": 0
            }

        ym = year_month or self._year_month()

        row = await asyncio.to_thread(
            self.session.execute,
            "SELECT * FROM user_monthly_stats WHERE user_id = %s AND year_month = %s",
            (user_id, ym)
        )
        row = row.one()
        return dict(row._asdict()) if row else {
            "entries_count": 0,
            "songs_selected_count": 0,
            "media_attached_count": 0
        }

    async def get_song_frequency(self, user_id, song_id):
        if not self.session:
            return {
                "selection_count": 0,
                "first_selected": None,
                "last_selected": None
            }

        freq = await asyncio.to_thread(
            self.session.execute,
            "SELECT selection_count FROM song_selection_frequency WHERE user_id = %s AND song_id = %s",
            (user_id, song_id)
        )
        freq = freq.one()

        ts = await asyncio.to_thread(
            self.session.execute,
            "SELECT first_selected, last_selected FROM song_selection_timestamps WHERE user_id = %s AND song_id = %s",
            (user_id, song_id)
        )
        ts = ts.one()

        return {
            "selection_count": freq.selection_count if freq else 0,
            "first_selected": ts.first_selected if ts else None,
            "last_selected": ts.last_selected if ts else None
        }


# Global instance
cassandra_client = CassandraClient()

"""
backend/app/databases/cassandra.py

Cassandra client for Side-B logging.
Supports:
- Journal entry logs (text)
- Song selections (timeline + counters + timestamps)
- Media attachments (timeline + media-type counters)
- Monthly stats (counters)
- Delete utilities
"""

import logging
import asyncio
from datetime import datetime
from cassandra.cluster import Cluster

logger = logging.getLogger("CassandraClient")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    fmt = logging.Formatter("[Cassandra] %(levelname)s - %(message)s")
    ch.setFormatter(fmt)
    logger.addHandler(ch)


class CassandraClient:
    def __init__(self, contact_points=None, keyspace="sideb"):
        self.cluster = None
        self.session = None
        self.contact_points = contact_points or ["127.0.0.1"]
        self.keyspace = keyspace

    # -----------------------------
    # CONNECTION
    # -----------------------------
    async def connect(self):
        logger.info("Connecting to Cassandra cluster...")
        self.cluster = Cluster(self.contact_points)
        self.session = await asyncio.to_thread(self.cluster.connect)
        await asyncio.to_thread(
            self.session.execute,
            f"""
            CREATE KEYSPACE IF NOT EXISTS {self.keyspace}
            WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
            """,
        )
        self.session.set_keyspace(self.keyspace)
        logger.info(f"Connected and keyspace set to '{self.keyspace}'")
        await self._create_schema()

    async def disconnect(self):
        if self.cluster:
            logger.info("Shutting down Cassandra cluster connection...")
            await asyncio.to_thread(self.cluster.shutdown)
            self.cluster = None
            self.session = None
            logger.info("Cassandra connection closed.")

    async def _create_schema(self):
        logger.info("Ensuring Cassandra schema...")
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
                url TEXT,
                PRIMARY KEY ((user_id, entry_id), attachment_timestamp)
            ) WITH CLUSTERING ORDER BY (attachment_timestamp DESC)
            """,
            """
            CREATE TABLE IF NOT EXISTS media_attachment_type_counts (
                user_id TEXT,
                media_type TEXT,
                count COUNTER,
                PRIMARY KEY (user_id, media_type)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS user_monthly_stats (
                user_id TEXT,
                year_month TEXT,
                entries_count COUNTER,
                songs_selected_count COUNTER,
                media_attached_count COUNTER,
                PRIMARY KEY (user_id, year_month)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS journal_entries_by_user (
                user_id TEXT,
                entry_id TEXT,
                created_at TIMESTAMP,
                text TEXT,
                PRIMARY KEY (user_id, entry_id)
            )
            """,
        ]
        for s in stmts:
            await asyncio.to_thread(self.session.execute, s)
        logger.info("Cassandra schema ensured.")

    # -----------------------------
    # Helpers
    # -----------------------------
    def _year_month(self):
        return datetime.utcnow().strftime("%Y-%m")

    # -----------------------------
    # WRITE OPERATIONS
    # -----------------------------
    async def log_journal_text(self, user_id: str, entry_id: str, text: str):
        try:
            now = datetime.utcnow()
            await asyncio.to_thread(
                self.session.execute,
                "INSERT INTO journal_entries_by_user (user_id, entry_id, created_at, text) VALUES (%s, %s, %s, %s)",
                (user_id, entry_id, now, text),
            )
            logger.info(f"Logged journal text for user={user_id}, entry={entry_id}")
            await self.increment_entry_count(user_id)
        except Exception as e:
            logger.error(f"Failed to log journal text: {e}")
            raise

    async def log_song_selection(self, user_id: str, entry_id: str, song_id: str, mood: str = None):
        try:
            now = datetime.utcnow()
            ym = self._year_month()

            await asyncio.to_thread(
                self.session.execute,
                "INSERT INTO song_selections_by_user (user_id, selection_timestamp, entry_id, song_id, mood) VALUES (%s, %s, %s, %s, %s)",
                (user_id, now, entry_id, song_id, mood),
            )
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE song_selection_frequency SET selection_count = selection_count + 1 WHERE user_id = %s AND song_id = %s",
                (user_id, song_id),
            )
            await asyncio.to_thread(
                self.session.execute,
                "INSERT INTO song_selection_timestamps (user_id, song_id, first_selected, last_selected) VALUES (%s, %s, %s, %s) IF NOT EXISTS",
                (user_id, song_id, now, now),
            )
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE song_selection_timestamps SET last_selected = %s WHERE user_id = %s AND song_id = %s",
                (now, user_id, song_id),
            )
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE user_monthly_stats SET songs_selected_count = songs_selected_count + 1 WHERE user_id = %s AND year_month = %s",
                (user_id, ym),
            )
            logger.info(f"Song selection logged for user={user_id}, song={song_id}")
        except Exception as e:
            logger.error(f"Failed to log song selection: {e}")
            raise

    async def log_media_attachment(self, user_id: str, entry_id: str, file_id: str, file_type: str, url: str = None):
        try:
            ym = self._year_month()
            await asyncio.to_thread(
                self.session.execute,
                "INSERT INTO media_attachments_log (user_id, entry_id, attachment_timestamp, file_id, file_type, url) VALUES (%s, %s, now(), %s, %s, %s)",
                (user_id, entry_id, file_id, file_type, url),
            )
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE user_monthly_stats SET media_attached_count = media_attached_count + 1 WHERE user_id = %s AND year_month = %s",
                (user_id, ym),
            )
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE media_attachment_type_counts SET count = count + 1 WHERE user_id = %s AND media_type = %s",
                (user_id, file_type),
            )
            logger.info(f"Media attachment logged for user={user_id}, entry={entry_id}, type={file_type}")
        except Exception as e:
            logger.error(f"Failed to log media attachment: {e}")
            raise

    async def increment_entry_count(self, user_id: str):
        try:
            ym = self._year_month()
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE user_monthly_stats SET entries_count = entries_count + 1 WHERE user_id = %s AND year_month = %s",
                (user_id, ym),
            )
            logger.info(f"Entry count incremented for user={user_id}, month={ym}")
        except Exception as e:
            logger.error(f"Failed to increment entry count: {e}")
            raise

    # -----------------------------
    # READ OPERATIONS
    # -----------------------------
    async def get_recent_song_selections(self, user_id: str, limit: int = 10):
        rows = await asyncio.to_thread(
            self.session.execute,
            "SELECT * FROM song_selections_by_user WHERE user_id = %s LIMIT %s",
            (user_id, limit),
        )
        return [dict(r._asdict()) for r in rows]

    async def get_attachments_for_entry(self, user_id: str, entry_id: str):
        rows = await asyncio.to_thread(
            self.session.execute,
            "SELECT * FROM media_attachments_log WHERE user_id = %s AND entry_id = %s",
            (user_id, entry_id),
        )
        return [dict(r._asdict()) for r in rows]

    async def get_monthly_stats(self, user_id: str, year_month: str = None):
        ym = year_month or self._year_month()
        row = await asyncio.to_thread(
            self.session.execute,
            "SELECT * FROM user_monthly_stats WHERE user_id = %s AND year_month = %s",
            (user_id, ym),
        )
        row = row.one()
        base = dict(row._asdict()) if row else {"entries_count": 0, "songs_selected_count": 0, "media_attached_count": 0}
        try:
            rows = await asyncio.to_thread(
                self.session.execute,
                "SELECT media_type, count FROM media_attachment_type_counts WHERE user_id = %s",
                (user_id,),
            )
            base["media_type_counts"] = {r.media_type: r.count for r in rows}
        except Exception:
            base["media_type_counts"] = {}
        return base

    async def get_song_frequency(self, user_id: str, song_id: str):
        freq = await asyncio.to_thread(
            self.session.execute,
            "SELECT selection_count FROM song_selection_frequency WHERE user_id = %s AND song_id = %s",
            (user_id, song_id),
        )
        freq = freq.one()
        ts = await asyncio.to_thread(
            self.session.execute,
            "SELECT first_selected, last_selected FROM song_selection_timestamps WHERE user_id = %s AND song_id = %s",
            (user_id, song_id),
        )
        ts = ts.one()
        return {
            "selection_count": freq.selection_count if freq else 0,
            "first_selected": ts.first_selected if ts else None,
            "last_selected": ts.last_selected if ts else None,
        }

    # -----------------------------
    # DELETE / WIPE helpers
    # -----------------------------
    async def delete_user_all_data(self, user_id: str):
        logger.warning(f"[DELETE] Removing ALL Cassandra data for user {user_id}")
        
        await asyncio.to_thread(self.session.execute, "DELETE FROM song_selections_by_user WHERE user_id = %s", (user_id,))
        
        # Counter tables need full partition key
        for row in await asyncio.to_thread(self.session.execute, "SELECT song_id FROM song_selection_frequency WHERE user_id = %s", (user_id,)):
            await asyncio.to_thread(self.session.execute, "DELETE FROM song_selection_frequency WHERE user_id = %s AND song_id = %s", (user_id, row.song_id))
        
        await asyncio.to_thread(self.session.execute, "DELETE FROM song_selection_timestamps WHERE user_id = %s", (user_id,))
        
        for row in await asyncio.to_thread(self.session.execute, "SELECT year_month FROM user_monthly_stats WHERE user_id = %s", (user_id,)):
            await asyncio.to_thread(self.session.execute, "DELETE FROM user_monthly_stats WHERE user_id = %s AND year_month = %s", (user_id, row.year_month))
        
        for row in await asyncio.to_thread(self.session.execute, "SELECT DISTINCT entry_id FROM media_attachments_log WHERE user_id = %s ALLOW FILTERING", (user_id,)):
            await asyncio.to_thread(self.session.execute, "DELETE FROM media_attachments_log WHERE user_id = %s AND entry_id = %s", (user_id, row.entry_id))
        
        for row in await asyncio.to_thread(self.session.execute, "SELECT media_type FROM media_attachment_type_counts WHERE user_id = %s", (user_id,)):
            await asyncio.to_thread(self.session.execute, "DELETE FROM media_attachment_type_counts WHERE user_id = %s AND media_type = %s", (user_id, row.media_type))
        
        await asyncio.to_thread(self.session.execute, "DELETE FROM journal_entries_by_user WHERE user_id = %s", (user_id,))
        
        logger.warning(f"[DELETE] Completed removal for user {user_id}")

    async def delete_entry_data(self, user_id: str, entry_id: str):
        logger.warning(f"[DELETE] Removing Cassandra data for entry {entry_id} (user {user_id})")
        await asyncio.to_thread(self.session.execute, "DELETE FROM media_attachments_log WHERE user_id = %s AND entry_id = %s", (user_id, entry_id))
        await asyncio.to_thread(self.session.execute, "DELETE FROM journal_entries_by_user WHERE user_id = %s AND entry_id = %s", (user_id, entry_id))
        await asyncio.to_thread(self.session.execute, "DELETE FROM song_selections_by_user WHERE user_id = %s AND entry_id = %s ALLOW FILTERING", (user_id, entry_id))
        logger.warning(f"[DELETE] Completed entry-level deletion for {entry_id}")

    async def delete_user_monthly_stats(self, user_id: str):
        logger.warning(f"[DELETE] Removing monthly stats for user {user_id}")
        for row in await asyncio.to_thread(self.session.execute, "SELECT year_month FROM user_monthly_stats WHERE user_id = %s", (user_id,)):
            await asyncio.to_thread(self.session.execute, "DELETE FROM user_monthly_stats WHERE user_id = %s AND year_month = %s", (user_id, row.year_month))
        logger.warning(f"[DELETE] Monthly stats removed for {user_id}")

    async def admin_wipe_cassandra(self):
        logger.error("⚠ ADMIN WIPE: Truncating all Cassandra application tables (development only).")
        tables = [
            "song_selections_by_user",
            "song_selection_frequency",
            "song_selection_timestamps",
            "media_attachments_log",
            "media_attachment_type_counts",
            "user_monthly_stats",
            "journal_entries_by_user",
        ]
        for t in tables:
            await asyncio.to_thread(self.session.execute, f"TRUNCATE {t}")
        logger.error("⚠ ADMIN WIPE completed.")


# Global instance
cassandra_client = CassandraClient()
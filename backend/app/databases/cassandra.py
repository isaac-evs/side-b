"""
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
from datetime import datetime, timedelta
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

    # CONNECTION
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
            """
            CREATE TABLE IF NOT EXISTS journal_entries_timeline (
                user_id TEXT,
                created_at TIMESTAMP,
                entry_id TEXT,
                PRIMARY KEY (user_id, created_at)
            ) WITH CLUSTERING ORDER BY (created_at DESC)
            """,
        ]
        for s in stmts:
            await asyncio.to_thread(self.session.execute, s)
        logger.info("Cassandra schema ensured.")

    # Helpers
    def _year_month(self, date_obj=None):
        if date_obj:
            return date_obj.strftime("%Y-%m")
        return datetime.utcnow().strftime("%Y-%m")

    # WRITE OPERATIONS
    async def log_journal_text(self, user_id: str, entry_id: str, text: str, created_at: datetime = None):
        try:
            now = created_at or datetime.utcnow()
            # Log to main table
            await asyncio.to_thread(
                self.session.execute,
                "INSERT INTO journal_entries_by_user (user_id, entry_id, created_at, text) VALUES (%s, %s, %s, %s)",
                (user_id, entry_id, now, text),
            )
            # Log to timeline
            await asyncio.to_thread(
                self.session.execute,
                "INSERT INTO journal_entries_timeline (user_id, created_at, entry_id) VALUES (%s, %s, %s)",
                (user_id, now, entry_id),
            )
            
            logger.info(f"Logged journal text for user={user_id}, entry={entry_id}")
            await self.increment_entry_count(user_id, date_obj=now)
        except Exception as e:
            logger.error(f"Failed to log journal text: {e}")
            raise

    async def increment_entry_count(self, user_id: str, date_obj: datetime = None):
        ym = self._year_month(date_obj)
        await asyncio.to_thread(
            self.session.execute,
            "UPDATE user_monthly_stats SET entries_count = entries_count + 1 WHERE user_id = %s AND year_month = %s",
            (user_id, ym),
        )

    async def log_song_selection(self, user_id: str, entry_id: str, song_id: str, mood: str = None, created_at: datetime = None):
        try:
            now = created_at or datetime.utcnow()
            # 1. Log selection event
            await asyncio.to_thread(
                self.session.execute,
                """
                INSERT INTO song_selections_by_user (user_id, selection_timestamp, entry_id, song_id, mood)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (user_id, now, entry_id, song_id, mood or "unknown"),
            )
            
            # 2. Update frequency counter
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE song_selection_frequency SET selection_count = selection_count + 1 WHERE user_id = %s AND song_id = %s",
                (user_id, song_id),
            )
            
            # 3. Update monthly stats
            ym = self._year_month(now)
            await asyncio.to_thread(
                self.session.execute,
                "UPDATE user_monthly_stats SET songs_selected_count = songs_selected_count + 1 WHERE user_id = %s AND year_month = %s",
                (user_id, ym),
            )
            
            logger.info(f"Logged song selection for user={user_id}, song={song_id}")
        except Exception as e:
            logger.error(f"Failed to log song selection: {e}")
            # Don't raise, just log error to avoid blocking main flow

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


    # READ OPERATIONS
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

    async def get_user_stats(self, user_id: str):
        """
        Fetch stats for widgets:
        - Streak (calculated from timeline)
        - Songs Logged (total count)
        - This Month (entries count)
        - This Week (calculated from timeline)
        """
        try:
            # 1. Get timeline for streak and week stats
            # Limit to last 365 entries
            rows = await asyncio.to_thread(
                self.session.execute,
                "SELECT created_at FROM journal_entries_timeline WHERE user_id = %s LIMIT 365",
                (user_id,)
            )
            dates = [r.created_at for r in rows]
            
            # Calculate Streak
            streak = 0
            this_week_count = 0
            
            if dates:
                # Sort dates descending (should be already sorted by clustering key, but ensure)
                # dates are datetime objects
                sorted_dates = sorted(dates, reverse=True)
                
                # Streak Logic
                today = datetime.utcnow().date()
                current_date = today
                
                # Check if latest entry is today or yesterday to start streak
                latest_entry_date = sorted_dates[0].date()
                
                if latest_entry_date == today:
                    streak = 1
                    check_date = today
                elif latest_entry_date == (today - timedelta(days=1)):
                    streak = 0 # Will be incremented in loop
                    check_date = today - timedelta(days=1)
                else:
                    streak = 0
                    check_date = None # Streak broken
                
                if check_date:
                    unique_dates = sorted(list(set(d.date() for d in sorted_dates)), reverse=True)
                    
                    # If first date is today, we start checking from yesterday
                    start_idx = 0
                    if unique_dates[0] == today:
                        streak = 1
                        start_idx = 1
                        check_date = today - timedelta(days=1)
                    elif unique_dates[0] == (today - timedelta(days=1)):
                        streak = 1 # Yesterday counts if today is missing? 
                        # Usually streak includes today if done, or up to yesterday.
                        # Let's say streak is consecutive days up to today.
                        # If today is missing, but yesterday exists, streak is active?
                        # Usually yes.
                        streak = 1
                        start_idx = 1
                        check_date = today - timedelta(days=2)
                    else:
                        streak = 0
                    
                    # Iterate
                    for i in range(start_idx, len(unique_dates)):
                        if unique_dates[i] == check_date:
                            streak += 1
                            check_date = check_date - timedelta(days=1)
                        else:
                            break

                # This Week Logic
                start_of_week = today - timedelta(days=today.weekday()) # Monday
                this_week_count = sum(1 for d in dates if d.date() >= start_of_week)

            # 2. Get Monthly Stats
            ym = self._year_month()
            month_row = await asyncio.to_thread(
                self.session.execute,
                "SELECT entries_count FROM user_monthly_stats WHERE user_id = %s AND year_month = %s",
                (user_id, ym)
            )
            this_month_count = month_row.one().entries_count if month_row and month_row.one() else 0
            
            # 3. Get Total Songs Logged
            song_rows = await asyncio.to_thread(
                self.session.execute,
                "SELECT selection_count FROM song_selection_frequency WHERE user_id = %s",
                (user_id,)
            )
            total_songs = sum(r.selection_count for r in song_rows)
            
            return {
                "streak": streak,
                "songs_logged": total_songs,
                "this_month": this_month_count,
                "this_week": this_week_count
            }
            
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {
                "streak": 0,
                "songs_logged": 0,
                "this_month": 0,
                "this_week": 0
            }

    # DELETE
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
        logger.error("ADMIN WIPE: Truncating all Cassandra application tables (development only).")
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
        logger.error("ADMIN WIPE completed.")


# Global instance
cassandra_client = CassandraClient()
"""
Cassandra client for Side-B logging.
Supports: Song selections, media attachments, monthly stats.
"""
from cassandra.cluster import Cluster
from datetime import datetime

_session = None

def get_session():
    global _session
    if _session:
        return _session
    
    cluster = Cluster(['127.0.0.1'])
    _session = cluster.connect()
    
    _session.execute("""
        CREATE KEYSPACE IF NOT EXISTS sideb
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    """)
    _session.set_keyspace("sideb")
    
    # Timeline
    _session.execute("""
        CREATE TABLE IF NOT EXISTS song_selections_by_user (
            user_id TEXT,
            selection_timestamp TIMESTAMP,
            entry_id TEXT,
            song_id TEXT,
            mood TEXT,
            PRIMARY KEY (user_id, selection_timestamp)
        ) WITH CLUSTERING ORDER BY (selection_timestamp DESC)
    """)
    
    # Counter
    _session.execute("""
        CREATE TABLE IF NOT EXISTS song_selection_frequency (
            user_id TEXT,
            song_id TEXT,
            selection_count COUNTER,
            PRIMARY KEY (user_id, song_id)
        )
    """)
    
    # Timestamps
    _session.execute("""
        CREATE TABLE IF NOT EXISTS song_selection_timestamps (
            user_id TEXT,
            song_id TEXT,
            first_selected TIMESTAMP,
            last_selected TIMESTAMP,
            PRIMARY KEY (user_id, song_id)
        )
    """)
    
    # Media
    _session.execute("""
        CREATE TABLE IF NOT EXISTS media_attachments_log (
            user_id TEXT,
            entry_id TEXT,
            attachment_timestamp TIMEUUID,
            file_id TEXT,
            file_type TEXT,
            PRIMARY KEY ((user_id, entry_id), attachment_timestamp)
        ) WITH CLUSTERING ORDER BY (attachment_timestamp DESC)
    """)
    
    # Monthly stats
    _session.execute("""
        CREATE TABLE IF NOT EXISTS user_monthly_stats (
            user_id TEXT,
            year_month TEXT,
            entries_count COUNTER,
            songs_selected_count COUNTER,
            media_attached_count COUNTER,
            PRIMARY KEY (user_id, year_month)
        ) WITH CLUSTERING ORDER BY (year_month DESC)
    """)
    
    return _session


# WRITES
def log_song_selection(user_id, entry_id, song_id, mood):
    s = get_session()
    now = datetime.utcnow()
    ym = now.strftime("%Y-%m")
    
    s.execute("INSERT INTO song_selections_by_user (user_id, selection_timestamp, entry_id, song_id, mood) VALUES (%s, %s, %s, %s, %s)", 
              (user_id, now, entry_id, song_id, mood))
    
    s.execute("UPDATE song_selection_frequency SET selection_count = selection_count + 1 WHERE user_id = %s AND song_id = %s", 
              (user_id, song_id))
    
    s.execute("INSERT INTO song_selection_timestamps (user_id, song_id, first_selected, last_selected) VALUES (%s, %s, %s, %s) IF NOT EXISTS", 
              (user_id, song_id, now, now))
    
    s.execute("UPDATE song_selection_timestamps SET last_selected = %s WHERE user_id = %s AND song_id = %s", 
              (now, user_id, song_id))
    
    s.execute("UPDATE user_monthly_stats SET songs_selected_count = songs_selected_count + 1 WHERE user_id = %s AND year_month = %s", 
              (user_id, ym))


def log_media_attachment(user_id, entry_id, file_id, file_type):
    s = get_session()
    ym = datetime.utcnow().strftime("%Y-%m")
    
    s.execute("INSERT INTO media_attachments_log (user_id, entry_id, attachment_timestamp, file_id, file_type) VALUES (%s, %s, now(), %s, %s)", 
              (user_id, entry_id, file_id, file_type))
    
    s.execute("UPDATE user_monthly_stats SET media_attached_count = media_attached_count + 1 WHERE user_id = %s AND year_month = %s", 
              (user_id, ym))


def increment_entry_count(user_id):
    s = get_session()
    ym = datetime.utcnow().strftime("%Y-%m")
    s.execute("UPDATE user_monthly_stats SET entries_count = entries_count + 1 WHERE user_id = %s AND year_month = %s", 
              (user_id, ym))


# READS
def get_recent_song_selections(user_id, limit=10):
    s = get_session()
    rows = s.execute("SELECT * FROM song_selections_by_user WHERE user_id = %s LIMIT %s", (user_id, limit))
    return [dict(r._asdict()) for r in rows]


def get_attachments_for_entry(user_id, entry_id):
    s = get_session()
    rows = s.execute("SELECT * FROM media_attachments_log WHERE user_id = %s AND entry_id = %s", (user_id, entry_id))
    return [dict(r._asdict()) for r in rows]


def get_monthly_stats(user_id, year_month=None):
    s = get_session()
    ym = year_month or datetime.utcnow().strftime("%Y-%m")
    
    try:
        row = s.execute("SELECT * FROM user_monthly_stats WHERE user_id = %s AND year_month = %s", (user_id, ym)).one()
        return dict(row._asdict()) if row else {"entries_count": 0, "songs_selected_count": 0, "media_attached_count": 0}
    except:
        return {"entries_count": 0, "songs_selected_count": 0, "media_attached_count": 0}


def get_song_frequency(user_id, song_id):
    s = get_session()
    
    try:
        freq = s.execute("SELECT selection_count FROM song_selection_frequency WHERE user_id = %s AND song_id = %s", (user_id, song_id)).one()
        ts = s.execute("SELECT first_selected, last_selected FROM song_selection_timestamps WHERE user_id = %s AND song_id = %s", (user_id, song_id)).one()
        
        return {
            "selection_count": freq.selection_count if freq else 0,
            "first_selected": ts.first_selected if ts else None,
            "last_selected": ts.last_selected if ts else None
        }
    except:
        return {"selection_count": 0, "first_selected": None, "last_selected": None}
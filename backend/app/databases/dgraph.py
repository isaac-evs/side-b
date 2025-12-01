import os
import json
from typing import Any, Dict, List, Optional
from datetime import datetime
import httpx
import asyncio

DGRAPH_URL = os.getenv("DGRAPH_URL", "http://localhost:8080")
DGRAPH_MUTATE = f"{DGRAPH_URL}/mutate?commitNow=true"
DGRAPH_QUERY = f"{DGRAPH_URL}/query"
DGRAPH_ALTER = f"{DGRAPH_URL}/alter"

GRAPHQL_PLUS = "application/graphql+-"
JSON_CT = "application/json"
HTTP_TIMEOUT = float(os.getenv("DGRAPH_HTTP_TIMEOUT", "10.0"))

SCHEMA = """
<album>: string @index(term) .
<album_art>: string .
<artist>: string @index(fulltext, term) .
<based_on>: string .
<belongs_to_mood>: uid @reverse .
<color_code>: string .
<completion_rate>: float .
<context>: string .
<created_at>: datetime .
<created_entries>: [uid] @reverse .
<creator>: uid @reverse .
<date>: datetime @index(day) .
<description>: string .
<duration>: int .
<entries>: [uid] @reverse .
<entry_id>: string @index(hash) .
<favorite_moods>: [string] @index(term) .
<featured_in>: [uid] @reverse .
<has_mood>: uid @reverse .
<last_played>: datetime .
<listened_to>: [uid] @reverse .
<listeners>: [uid] @reverse .
<mood>: string @index(hash, term) .
<mood_name>: string @index(hash) .
<name>: string .
<play_count>: int .
<popularity_score>: float @index(float) .
<prefers_songs>: [uid] @reverse .
<probability>: float .
<selected_song>: uid @reverse .
<similar_songs>: [uid] @reverse .
<similar_users>: [uid] @reverse .
<similarity_score>: float .
<song_a>: uid @reverse .
<song_b>: uid .
<song_id>: string @index(hash) .
<song_mood>: string @index(hash, term) .
<songs>: [uid] @reverse .
<spotify_id>: string .
<strength>: float .
<tag_name>: string @index(term) .
<tagged_with>: [uid] @reverse .
<text_length>: int .
<title>: string @index(fulltext, term) .
<total_plays>: int @index(int) .
<transition_count>: int .
<transitions_to>: [uid] @reverse .
<user_id>: string @index(hash) .
<username>: string @index(hash, term) .
<weight>: float .
"""

class DgraphClient:
    def __init__(self, base_url: str = DGRAPH_URL):
        self.base_url = base_url
        self.mutate_url = f"{base_url}/mutate?commitNow=true"
        self.query_url = f"{base_url}/query"
        self.alter_url = f"{base_url}/alter"
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=HTTP_TIMEOUT)
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def apply_schema(self):
        client = await self._get_client()
        headers = {"Content-Type": "application/schema"}
        r = await client.post(self.alter_url, content=SCHEMA.encode("utf-8"), headers=headers)
        r.raise_for_status()
        return r.text

    async def mutate(self, set_objects: List[Dict[str, Any]]) -> Dict[str, Any]:
        client = await self._get_client()
        payload = json.dumps({"set": set_objects})
        headers = {"Content-Type": JSON_CT}
        r = await client.post(self.mutate_url, content=payload, headers=headers)
        r.raise_for_status()
        return r.json()

    async def upsert_user(self, user_id: str, username: Optional[str] = None) -> Dict[str, Any]:
        user_node = {"uid": f"_:{user_id}", "user_id": user_id}
        if username:
            user_node["username"] = username
        return await self.mutate([user_node])

    async def upsert_song(self, song_payload: Dict[str, Any]) -> Dict[str, Any]:
        song_node = {"uid": f"_:{song_payload.get('song_id')}", "song_id": song_payload.get("song_id")}
        for k in ("title", "artist", "song_mood", "album", "album_art", "total_plays", "popularity_score", "spotify_id"):
            if song_payload.get(k) is not None:
                song_node[k] = song_payload[k]
        if song_payload.get("similar_songs"):
            song_node["similar_songs"] = [{"uid": f"_:{s}"} for s in song_payload["similar_songs"]]
        return await self.mutate([song_node])

    async def create_entry_from_mongo(self, entry_doc: Dict[str, Any]) -> Dict[str, Any]:
        entry_id = str(entry_doc.get("_id"))
        user_id = str(entry_doc.get("userId")) if entry_doc.get("userId") else None
        date_value = entry_doc.get("date")
        try:
            date_iso = date_value.isoformat() if date_value else None
        except:
            date_iso = str(date_value)
        text_len = len(entry_doc.get("text", ""))
        set_objs = []
        mood_name = entry_doc.get("mood") if isinstance(entry_doc.get("mood"), str) else None
        if mood_name:
            set_objs.append({"uid": f"_:{mood_name}_mood", "mood_name": mood_name})
        if user_id:
            username = entry_doc.get("username")
            u = {"uid": f"_:{user_id}", "user_id": user_id}
            if username:
                u["username"] = username
            set_objs.append(u)
        song = entry_doc.get("song")
        song_id = None
        if song and isinstance(song, dict):
            song_id = song.get("_id") or song.get("song_id") or song.get("songId")
            if not song_id:
                song_id = f"song_{abs(hash(song.get('title','')))}"
            s = {"uid": f"_:{song_id}", "song_id": str(song_id)}
            for k in ("title", "artist", "song_mood", "album", "album_art", "duration", "total_plays", "popularity_score"):
                if song.get(k) is not None:
                    key = k
                    if k == "album_art" or k == "albumArt":
                        key = "album_art"
                    if k == "mood":
                        key = "song_mood"
                    s[key] = song.get(k)
            set_objs.append(s)
        files = entry_doc.get("files") or []
        media_nodes = []
        for f in files:
            if isinstance(f, dict):
                fid = str(f.get("_id") or f.get("id", ""))
                node = {"uid": f"_:{fid}", "media_type": f.get("fileType") or f.get("file_type") or "unknown"}
                meta = f.get("metadata") or {}
                for k in ("imageUrl", "videoUrl", "websiteUrl"):
                    if meta.get(k):
                        node[k] = meta[k]
                media_nodes.append(node)
                set_objs.append(node)
            else:
                fid = f"file_{str(f)}"
                node = {"uid": f"_:{fid}", "media_type": "unknown"}
                media_nodes.append(node)
                set_objs.append(node)
        entry_node = {
            "uid": f"_:{entry_id}",
            "entry_id": entry_id,
            "date": date_iso or datetime.utcnow().isoformat(),
            "text_length": text_len,
        }
        if user_id:
            entry_node["creator"] = {"uid": f"_:{user_id}"}
        if song_id:
            entry_node["selected_song"] = {"uid": f"_:{song_id}"}
        if mood_name:
            entry_node["has_mood"] = {"uid": f"_:{mood_name}_mood"}
        if media_nodes:
            entry_node["entry_has_media"] = [{"uid": m["uid"]} for m in media_nodes]
        set_objs.append(entry_node)
        if not set_objs:
            return {"ok": False, "reason": "no valid nodes to create"}
        resp = await self.mutate(set_objs)
        return resp

    async def recommend_songs(self, mood: str, hops: int = 1, limit: int = 8) -> Dict[str, Any]:
        client = await self._get_client()
        headers = {"Content-Type": GRAPHQL_PLUS}
        if hops == 1:
            q = f"""
            {{
              songs(func: eq(song_mood, "{mood}"), first: {limit}) {{
                uid song_id title artist song_mood album album_art total_plays popularity_score
              }}
            }}
            """
        else:
            q = f"""
            {{
              root as var(func: eq(song_mood, "{mood}"))
              similar as var(func: uid(root)) {{ similar_songs }}
              all(func: uid(root, similar), first: {limit}) {{
                uid song_id title artist song_mood album album_art total_plays popularity_score
              }}
            }}
            """
        r = await client.post(self.query_url, data=q.encode("utf-8"), headers=headers)
        r.raise_for_status()
        return r.json()

    async def mood_media_patterns(self, mood: str) -> Dict[str, Any]:
        client = await self._get_client()
        headers = {"Content-Type": GRAPHQL_PLUS}
        q = f"""
        {{
          moods(func: eq(mood_name, "{mood}")) {{
            uid
            ~has_mood {{
              entry_id
              entry_has_media {{ media_type }}
              selected_song {{ song_mood }}
            }}
          }}
        }}
        """
        r = await client.post(self.query_url, data=q.encode("utf-8"), headers=headers)
        r.raise_for_status()
        data = r.json()
        media_counts = {}
        song_mood_media = {}
        for mood_block in data.get("data", {}).get("moods", []):
            for entry in mood_block.get("~has_mood", []) or []:
                for m in entry.get("entry_has_media", []) or []:
                    mt = m.get("media_type", "unknown")
                    media_counts[mt] = media_counts.get(mt, 0) + 1
                    sm = entry.get("selected_song", {}).get("song_mood")
                    if sm:
                        song_mood_media.setdefault(sm, {})
                        song_mood_media[sm][mt] = song_mood_media[sm].get(mt, 0) + 1
        return {
            "mood": mood,
            "media_counts": media_counts,
            "song_mood_media": song_mood_media,
            "raw": data
        }

dgraph_client = DgraphClient()

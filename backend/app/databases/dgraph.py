import os
import json
from typing import Any, Dict, List, Optional
from datetime import datetime
import httpx

DGRAPH_URL = os.getenv("DGRAPH_URL", "http://localhost:8080")
HTTP_TIMEOUT = float(os.getenv("DGRAPH_HTTP_TIMEOUT", "10.0"))

class DgraphClient:
    def __init__(self, base_url: str = DGRAPH_URL):
        self.base_url = base_url
        self.mutate_url = f"{base_url}/mutate?commitNow=true"
        self.query_url = f"{base_url}/query"
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=HTTP_TIMEOUT)
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def mutate(self, set_objects: List[Dict[str, Any]]) -> Dict[str, Any]:
        client = await self._get_client()
        payload = json.dumps({"set": set_objects})
        headers = {"Content-Type": "application/json"}
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
        try:
            date_iso = entry_doc["date"].isoformat()
        except:
            date_iso = str(entry_doc.get("date", datetime.utcnow().isoformat()))

        text_len = len(entry_doc.get("text", ""))
        set_objs = []

        mood_name = entry_doc.get("mood") if isinstance(entry_doc.get("mood"), str) else None
        if mood_name:
            set_objs.append({"uid": f"_:{mood_name}_mood", "mood_name": mood_name})

        if user_id:
            username = entry_doc.get("userId", {}).get("username") if isinstance(entry_doc.get("userId"), dict) else None
            user_node = {"uid": f"_:{user_id}", "user_id": user_id}
            if username:
                user_node["username"] = username
            set_objs.append(user_node)

        song = entry_doc.get("song")
        song_id = None
        if song and isinstance(song, dict):
            song_id = song.get("_id") or song.get("song_id") or song.get("id") or song.get("songId")
            if song_id is None:
                song_id = f"song_{abs(hash(song.get('title','')))}"
            song_node = {"uid": f"_:{song_id}", "song_id": str(song_id)}
            for k in ("title", "artist", "song_mood", "mood", "album", "album_art", "albumArt", "duration", "total_plays", "popularity_score"):
                if song.get(k) is not None:
                    key = k
                    if k == "albumArt":
                        key = "album_art"
                    if k == "mood":
                        key = "song_mood"
                    song_node[key] = song[k]
            set_objs.append(song_node)

        files = entry_doc.get("files", []) or []
        media_bnodes = []
        for f in files:
            if isinstance(f, dict):
                m_id = str(f.get("_id", f.get("id", "")) or "")
                node = {"uid": f"_:{m_id}", "media_type": f.get("fileType") or f.get("file_type") or "unknown"}
                meta = f.get("metadata") or {}
                if meta.get("imageUrl"): node["imageUrl"] = meta["imageUrl"]
                if meta.get("videoUrl"): node["videoUrl"] = meta["videoUrl"]
                if meta.get("websiteUrl"): node["websiteUrl"] = meta["websiteUrl"]
                media_bnodes.append(node)
                set_objs.append(node)
            else:
                mid = f"file_{str(f)}"
                node = {"uid": f"_:{mid}", "media_type": "unknown"}
                media_bnodes.append(node)
                set_objs.append(node)

        entry_node = {
            "uid": f"_:{entry_id}",
            "entry_id": entry_id,
            "date": date_iso,
            "text_length": text_len,
        }

        if user_id:
            entry_node["creator"] = {"uid": f"_:{user_id}"}

        if song_id:
            entry_node["selected_song"] = {"uid": f"_:{song_id}"}

        if mood_name:
            entry_node["has_mood"] = {"uid": f"_:{mood_name}_mood"}

        if media_bnodes:
            entry_node["entry_has_media"] = [{"uid": m["uid"]} for m in media_bnodes]

        set_objs.append(entry_node)
        if not set_objs:
            return {"ok": False}

        return await self.mutate(set_objs)

    async def recommend_songs(self, mood: str, hops: int = 1, limit: int = 8) -> Dict[str, Any]:
        client = await self._get_client()
        headers = {"Content-Type": "application/graphql+-"}
        if hops == 1:
            q = f"""
            {{
              songs(func: eq(song_mood, "{mood}"), first: {limit}) {{
                uid song_id title artist song_mood album album_art total_plays popularity_score
              }}
            }}"""
        else:
            q = f"""
            {{
              root as var(func: eq(song_mood, "{mood}"))
              similar as var(func: uid(root)) {{ similar_songs }}
              all(func: uid(root, similar), first: {limit}) {{
                uid song_id title artist song_mood album album_art total_plays popularity_score
              }}
            }}"""
        r = await client.post(self.query_url, data=q.encode(), headers=headers)
        r.raise_for_status()
        return r.json()

    async def mood_media_patterns(self, mood: str) -> Dict[str, Any]:
        client = await self._get_client()
        headers = {"Content-Type": "application/graphql+-"}
        q = f"""
        {{
          moods(func: eq(mood_name, "{mood}")) {{
            uid
            ~has_mood {{
              uid entry_id
              entry_has_media {{ uid media_type }}
              selected_song {{ song_id song_mood }}
            }}
          }}
        }}"""
        r = await client.post(self.query_url, data=q.encode(), headers=headers)
        r.raise_for_status()
        data = r.json()

        media_counts = {}
        song_mood_media = {}
        moods = data.get("data", {}).get("moods", [])

        for block in moods:
            entries = block.get("~has_mood", []) or []
            for entry in entries:
                for m in entry.get("entry_has_media", []) or []:
                    t = m.get("media_type", "unknown")
                    media_counts[t] = media_counts.get(t, 0) + 1
                    sm = entry.get("selected_song", {}).get("song_mood")
                    if sm:
                        song_mood_media.setdefault(sm, {})
                        song_mood_media[sm][t] = song_mood_media[sm].get(t, 0) + 1

        return {
            "mood": mood,
            "media_counts": media_counts,
            "song_mood_media": song_mood_media,
            "raw": data
        }

dgraph_client = DgraphClient()
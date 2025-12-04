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

    async def connect(self):
        """
        Establish connection to Dgraph (create client stub).
        """
        try:
            client = await self._get_client()
            await client.get(f"{self.base_url}/health")
            print("✓ Connected to Dgraph")
        except Exception as e:
            print(f"✗ Failed to connect to Dgraph: {e}")

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def initialize(self):
        pass

    async def health_check(self):
        try:
            client = await self._get_client()
            r = await client.get(f"{self.base_url}/health")
            return r.status_code == 200
        except:
            return False

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
        client = await self._get_client()
        
        # 1. Check if user exists
        check_query = f"""
        {{
            u(func: eq(user_id, "{user_id}")) {{
                uid
            }}
        }}
        """
        res = await client.post(self.query_url, json={"query": check_query})
        data = res.json()
        uids = data.get("data", {}).get("u", [])
        
        uid = uids[0]["uid"] if uids else "_:new"
        
        # 2. Mutate
        user_node = {
            "uid": uid,
            "user_id": user_id,
            "dgraph.type": "User"
        }
        if username:
            user_node["username"] = username
            
        mutation = {
            "set": [user_node]
        }
        
        headers = {"Content-Type": JSON_CT}
        r = await client.post(self.mutate_url, json=mutation, headers=headers)
        r.raise_for_status()
        return r.json()

    async def upsert_song(self, song_payload: Dict[str, Any]) -> Dict[str, Any]:
        song_node = {"uid": f"_:{song_payload.get('song_id')}", "song_id": song_payload.get("song_id")}
        for k in ("title", "artist", "song_mood", "album", "album_art", "total_plays", "popularity_score"):
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
        mood_name = entry_doc.get("mood") if isinstance(entry_doc.get("mood"), str) else "unknown"
        
        client = await self._get_client()
        headers = {"Content-Type": JSON_CT}

        # 1. Resolve UIDs for User, Mood, Song, Entry
        check_query_parts = [f'e(func: eq(entry_id, "{entry_id}")) {{ uid }}']
        
        if user_id:
            check_query_parts.append(f'u(func: eq(user_id, "{user_id}")) {{ uid }}')
            
        if mood_name:
            check_query_parts.append(f'm(func: eq(mood_name, "{mood_name}")) {{ uid }}')
            
        song = entry_doc.get("song")
        song_id = None
        if song and isinstance(song, dict):
            song_id = song.get("_id") or song.get("song_id") or song.get("songId")
            if song_id:
                check_query_parts.append(f's(func: eq(song_id, "{song_id}")) {{ uid }}')

        check_query = "{\n" + "\n".join(check_query_parts) + "\n}"
        res = await client.post(self.query_url, json={"query": check_query})
        data = res.json().get("data", {})
        
        # Resolve UIDs
        e_list = data.get("e", [])
        entry_uid = e_list[0].get("uid") if e_list else "_:entry"
        
        u_list = data.get("u", [])
        user_uid = u_list[0].get("uid") if u_list else "_:user"
        
        print(f"DEBUG: Entry {entry_id} -> User {user_id} resolved to UID {user_uid}")

        m_list = data.get("m", [])
        mood_uid = m_list[0].get("uid") if m_list else f"_:{mood_name}"
        
        s_list = data.get("s", [])
        song_uid = s_list[0].get("uid") if s_list else (f"_:{song_id}" if song_id else None)

        # 2. Prepare JSON objects
        mutations = []
        
        # Entry Node
        entry_node = {
            "uid": entry_uid,
            "entry_id": entry_id,
            "dgraph.type": "Entry",
            "text_length": str(text_len),
            "mood": mood_name
        }
        if date_iso:
            entry_node["date"] = date_iso
            
        # Link to User
        if user_id:
            user_node = {
                "uid": user_uid,
                "user_id": user_id,
                "dgraph.type": "User",
                "created_entries": [{"uid": entry_uid}]
            }
            if entry_doc.get("username"):
                user_node["username"] = entry_doc.get("username")
            mutations.append(user_node)
            
            # Inverse link
            entry_node["creator"] = {"uid": user_uid}
            
        # Link to Mood
        if mood_name:
            mood_node = {
                "uid": mood_uid,
                "mood_name": mood_name
            }
            mutations.append(mood_node)
            entry_node["has_mood"] = {"uid": mood_uid}
            
        # Link to Song
        if song_id:
            song_node = {
                "uid": song_uid,
                "song_id": song_id
            }
            # Add details
            for k in ("title", "artist", "album", "album_art", "duration", "total_plays", "popularity_score"):
                val = song.get(k)
                if val is not None:
                    song_node[k] = str(val)
            
            if song.get("mood"):
                song_node["song_mood"] = song.get("mood")
                
            mutations.append(song_node)
            entry_node["selected_song"] = {"uid": song_uid}

        # Handle Files
        files = entry_doc.get("files") or []
        file_nodes = []
        for i, f in enumerate(files):
            f_uid = f"_:file{i}"
            file_node = {"uid": f_uid}
            if isinstance(f, dict):
                file_node["file_id"] = str(f.get("_id") or f.get("id", ""))
                file_node["media_type"] = f.get("fileType") or f.get("file_type") or "unknown"
                meta = f.get("metadata") or {}
                for k in ("imageUrl", "videoUrl", "websiteUrl"):
                    if meta.get(k):
                        file_node[k] = meta[k]
            else:
                file_node["file_id"] = str(f)
                file_node["media_type"] = "unknown"
            
            file_nodes.append(file_node)
            
        if file_nodes:
            entry_node["entry_has_media"] = file_nodes
            
        mutations.append(entry_node)
        
        mutation = {
            "set": mutations
        }
        
        # print(f"DEBUG MUTATION: {mutation}")
        
        headers = {"Content-Type": JSON_CT}
        r = await client.post(self.mutate_url, json=mutation, headers=headers)
        r.raise_for_status()
        resp_json = r.json()
        if "errors" in resp_json:
            print(f"DGRAPH ERROR: {resp_json['errors']}")
            raise Exception(f"Dgraph Error: {resp_json['errors']}")
        return resp_json
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

    async def get_mood_counts(self) -> Dict[str, Any]:
        """
        Get the count of entries for each mood using Dgraph aggregation.
        """
        client = await self._get_client()
        headers = {"Content-Type": GRAPHQL_PLUS}
        q = """
        {
          mood_counts(func: has(mood_name)) {
            mood_name
            entry_count: count(~has_mood)
          }
        }
        """
        r = await client.post(self.query_url, data=q.encode("utf-8"), headers=headers)
        r.raise_for_status()
        return r.json()

    async def delete_file(self, file_id: str) -> Dict[str, Any]:
        """
        Delete a file/media node from Dgraph by its ID.
        """
        client = await self._get_client()
        headers = {"Content-Type": "application/json"}
        
        # First, query to find the UID of the file with this file_id
        query = f"""
        {{
          file as var(func: eq(file_id, "{file_id}"))
        }}
        """
        
        # Then delete the node
        mutation = {
            "query": query,
            "delete": {
                "uid": "uid(file)"
            }
        }
        
        try:
            r = await client.post(self.mutate_url, json=mutation, headers=headers)
            r.raise_for_status()
            result = r.json()
            return {"ok": True, "result": result}
        except Exception as e:
            print(f"Error deleting file from Dgraph: {e}")
            return {"ok": False, "error": str(e)}

    async def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """
        Fetch comprehensive insights for a user from the graph.
        """
        query = """
        query user_insights($user_id: string) {
          user(func: eq(user_id, $user_id)) {
            uid
            username
            created_entries {
              uid
              date
              mood
              text_length
              selected_song {
                uid
                title
                artist
                album
                song_mood
                genre
              }
            }
          }
        }
        """
        
        client = await self._get_client()
        try:
            response = await client.post(
                self.query_url, 
                json={"query": query, "variables": {"$user_id": user_id}}
            )
            response.raise_for_status()
            data = response.json()
            
            user_data = data.get("data", {}).get("user", [])
            if not user_data:
                return None
                
            return user_data[0]
        except Exception as e:
            print(f"Error fetching insights: {e}")
            return None

dgraph_client = DgraphClient()
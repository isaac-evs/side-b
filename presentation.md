# Side-B: AI-Powered Mood Journal & Music Companion

---

## 1. App Overview: What is Side-B?

**Context**
Journaling is a powerful tool for mental health, but often feels static. Music is deeply connected to emotion but rarely integrated with our daily reflections.

**The Solution**
**Side-B** is an intelligent digital diary that bridges this gap.
- **Write**: Users log their daily thoughts.
- **Analyze**: AI (LLM) analyzes the text to detect the underlying mood (Joy, Sad, Calm, Stress).
- **Resonate**: The app automatically recommends and plays music that matches the detected mood.
- **Track**: Comprehensive analytics on mood trends and listening habits.

---

## 2. System Architecture: A Multi-Model Approach

To deliver a rich, responsive, and analytical experience, Side-B leverages a **Polyglot Persistence** architecture.

- **Frontend**: React (Vite) + Tailwind CSS + Zustand
- **Backend**: FastAPI (Python)
- **Databases**:
    1. **MongoDB** (Document): Core application data (Users, Entries).
    2. **Cassandra** (Columnar): High-volume logs & time-series stats.
    3. **Dgraph** (Graph): Complex relationships & recommendations.
    4. **ChromaDB** (Vector): AI embeddings & semantic search.

---

## 3. Document Database: MongoDB
*Handling flexible core entities*

**Requirements Satisfaction:**
- **Relationships**: Uses `$lookup` in aggregation pipelines to join `Entries` with `Files` (images/videos), maintaining a clean separation of concerns while allowing rich data retrieval.
- **Pipelines**: Complex aggregations defined in `routers/entries.py`.
    - Uses `$facet` to calculate weekly and monthly entry counts in a single query.
    - Uses `$group` and `$sort` to determine top songs per mood.
- **Indexes**:
    - Compound Index: `(userId, date)` ensures efficient retrieval of a user's history and prevents duplicate daily entries.
    - Text Index: On Song `title` and `artist` for fast search.

---

## 4. Columnar Database: Apache Cassandra
*Handling scale, logs, and time-series data*

**Requirements Satisfaction:**
- **Tables for Queries**:
    - `song_selections_by_user`: Optimized for "Show me my listening history".
    - `user_monthly_stats`: Optimized for "Show me my activity this month".
- **Partition Keys**:
    - `user_id` is used as the Partition Key, ensuring all data for a specific user resides on the same node for fast retrieval.
- **Clustering Keys**:
    - `selection_timestamp DESC`: Data is sorted on disk by time, making "get latest 10 songs" queries incredibly fast.
- **Queries Using Primary Keys**:
    - All application queries restrict by the Partition Key (`WHERE user_id = ?`), ensuring O(1) lookup performance.

---

## 5. Graph Database: Dgraph
*Handling complex connections and recommendations*

**Requirements Satisfaction:**
- **Node Relationships**:
    - Schema defines explicit edges like `entry -> has_mood`, `entry -> selected_song`, and `song -> similar_songs`.
- **Indexes & Reverse Traversal**:
    - Directives like `@reverse` on edges (e.g., `<has_mood>: uid @reverse .`) allow the app to answer "Which entries have this mood?" just as easily as "What mood does this entry have?".
- **Aggregations**:
    - Native graph aggregations used to calculate mood distribution.
    - Example: `count(~has_mood)` efficiently counts incoming edges to determine the most frequent moods without scanning all tables.

---

## 6. Vector Database: ChromaDB
*Powering the AI features*

**Requirements Satisfaction:**
- **Embeddings connected to LLM**:
    - **Integration**: Uses `sentence-transformers` (a local LLM) to convert user diary text into high-dimensional vector embeddings.
    - **Classification**: These embeddings are compared against "Mood Anchors" (pre-seeded vectors representing Joy, Sad, Calm, Stress) using cosine similarity.
    - **Result**: The app "understands" the sentiment of the text without explicit keyword matching, enabling the "No-Click Mood Detection" feature.

---

## 7. Solution Implementation
*Robust Engineering Practices*

- **Connection to Engines**:
    - Centralized `db_manager` handles async connections, health checks, and graceful shutdowns for all 4 databases.
- **Schema Management**:
    - **Cassandra**: Auto-creates Keyspaces and Tables on startup.
    - **Dgraph**: Posts GraphQL+- schema to the alpha node on initialization.
    - **MongoDB**: Ensures indexes exist via `create_indexes()`.
- **Data Loading**:
    - `fast_seed_100.py`: Fetches real metadata from Deezer API and seeds the database.
    - `MoodService`: Seeds vector anchors for classification.

---

## 8. Client Interaction
*A Modern User Experience*

- **Visual Feedback**:
    - The UI adapts its color theme dynamically based on the AI-detected mood (Yellow for Joy, Blue for Sad, etc.).
- **Information Access**:
    - **Diary Explorer**: Users can browse past entries with infinite scroll.
    - **Dashboard**: Visualizes stats (streaks, top moods) fetched from Cassandra and Dgraph.
- **Media Integration**:
    - Custom HTML5 audio player with cross-fading and preview playback.
    - Image thumbnails for diary attachments.

---

## 9. Completeness of Design
*Full Stack Integration*

The code demonstrates a complete lifecycle:
1.  **Input**: User types text in React.
2.  **Process**: FastAPI receives text -> Embeds via Torch -> Queries ChromaDB.
3.  **Persist**:
    -   Entry -> MongoDB.
    -   Log -> Cassandra.
    -   Graph Edge -> Dgraph.
4.  **Output**: JSON response updates Client State (Zustand).

Every database is used for its specific strength, avoiding "golden hammer" anti-patterns.

---

## 10. Future Improvements
*Roadmap for Side-B*

- **Mobile App**: Porting the React frontend to React Native for on-the-go journaling.
- **Full Spotify Integration**: Upgrading from previews to full track playback via Spotify Web SDK.
- **Advanced NLP**: Long-term sentiment analysis to detect seasonal mood patterns.
- **Social Features**: Anonymous mood sharing and community playlists.

---

# 11. DEMO

*(Live demonstration of Side-B)*

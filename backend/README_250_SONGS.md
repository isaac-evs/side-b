# 🎵 AI-Powered 250 Song Database Generator

This system automatically generates a database of 250 songs with AI-classified moods and descriptions using a **local LLM running on your RTX 5070**.

## 🚀 Quick Start

### Step 1: Install Dependencies (if needed)

```bash
pip install torch transformers accelerate requests
```

### Step 2: Generate AI Classifications

This step runs a local LLM (Microsoft Phi-2) on your GPU to classify songs and generate descriptions:

```bash
python generate_moods_with_llm.py
```

**What it does:**
- Loads a 2.7B parameter LLM locally (uses ~5GB GPU memory)
- Classifies 250 songs into moods: joy, calm, sad, stress
- Generates short, catchy descriptions for each song
- Saves results to `song_moods_generated.json`
- Creates checkpoints every 25 songs
- **Time:** ~10-20 minutes depending on GPU

### Step 3: Fetch Real Track Data from Deezer

```bash
python fetch_250_deezer_tracks.py
```

**What it does:**
- Reads AI-generated moods and descriptions
- Searches Deezer API for each song
- Fetches real metadata: artist, album, cover art, preview URLs
- Combines AI classifications with real data
- Saves to `deezer_tracks_250.json`
- Creates checkpoints every 50 songs
- **Time:** ~2-3 minutes (API rate limited)

### Step 4: Seed Database

```bash
python seed_songs_250.py
```

**What it does:**
- Loads the 250 songs from JSON
- Clears existing songs in MongoDB
- Inserts all 250 songs
- Shows distribution by mood
- **Time:** ~5 seconds

## 📊 What You Get

- **250 songs** across all genres
- **AI-classified moods:**
  - `joy` - Happy, upbeat, celebratory
  - `calm` - Relaxing, peaceful, meditative
  - `sad` - Melancholic, emotional, heartbreak
  - `stress` - Energetic, intense, stress-relief
- **AI-generated descriptions** - Short, catchy one-liners
- **Real Deezer data:**
  - High-quality album art
  - 30-second preview URLs
  - Accurate artist/album info
  - Song duration

## 🎯 The Complete Pipeline

```
generate_song_list.py (hardcoded 250 songs)
         ↓
generate_moods_with_llm.py (AI classifies → song_moods_generated.json)
         ↓
fetch_250_deezer_tracks.py (Deezer API → deezer_tracks_250.json)
         ↓
seed_songs_250.py (MongoDB seeding)
```

## 🔧 Customization

### Change the LLM Model

Edit `generate_moods_with_llm.py`:

```python
# Default: Microsoft Phi-2 (2.7B, fast, good quality)
model_name = "microsoft/phi-2"

# Alternatives:
# - TinyLlama (1.1B, faster, less accurate)
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# - Mistral 7B (larger, better quality, needs more VRAM)
model_name = "mistralai/Mistral-7B-Instruct-v0.2"
```

### Add More Songs

Edit `generate_song_list.py` and add to `SONG_QUERIES`:

```python
SONG_QUERIES = [
    # ... existing songs ...
    "Your New Song Artist Name",
]
```

### Adjust Mood Classification

Edit the prompt in `generate_moods_with_llm.py` to change how the AI classifies songs.

## 🐛 Troubleshooting

### "CUDA out of memory"
- Use a smaller model: `TinyLlama/TinyLlama-1.1B-Chat-v1.0`
- Close other GPU applications
- Reduce batch processing

### "Model download is slow"
- First run downloads ~5GB model files
- Subsequent runs use cached model

### "Deezer API rate limiting"
- The script includes delays (0.3s between requests)
- If you hit limits, wait a few minutes and resume
- Checkpoints are saved automatically

## 📈 Performance

**RTX 5070 (16GB):**
- Microsoft Phi-2: ~30-40 songs/minute
- TinyLlama: ~50-60 songs/minute
- Total time: 10-20 minutes for full pipeline

## 🎨 Output Format

Each song in the database has:

```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "coverUrl": "https://...",
  "deezerLink": "https://...",
  "previewUrl": "https://...",
  "mood": "joy",
  "description": "Impossible not to smile and dance.",
  "duration": 215
}
```

## 🎯 Next Steps

1. Run the pipeline once to generate 250 songs
2. The JSON files can be reused - no need to run LLM again
3. Customize song list and regenerate as needed
4. Use the API endpoint to add individual songs later

from app.databases.chromadb import chromadb_client

MOOD_ANCHORS = {
    "joy": [
        "I feel so happy and energetic today",
        "This is the best day ever, I am full of joy",
        "Celebrating a great success, feeling wonderful",
        "Dancing and laughing with friends",
        "Pure bliss and excitement",
        "Optimistic and cheerful",
        "Having a blast"
    ],
    "sad": [
        "I am feeling very sad and lonely",
        "Heartbroken and crying",
        "Grieving the loss of someone dear",
        "Feeling depressed and hopeless",
        "A heavy heart and tears",
        "Melancholy and gloomy",
        "Missing someone badly"
    ],
    "calm": [
        "Relaxing and peaceful moment",
        "Meditating in silence",
        "A quiet evening with a book",
        "Feeling serene and tranquil",
        "Soft and gentle vibes",
        "Chilling and resting",
        "Mindfulness and breathing"
    ],
    "stress": [
        "I am so stressed and angry",
        "Frustrated with everything going wrong",
        "Feeling aggressive and intense",
        "Need to release this rage",
        "Overwhelmed and anxious",
        "Furious and annoyed",
        "High pressure and tension"
    ]
}

class MoodService:
    async def initialize_anchors(self):
        collection = chromadb_client.get_collection("moods")
        if not collection:
            print("⚠️ ChromaDB 'moods' collection not available.")
            return

        # Check if already seeded
        count = collection.count()
        if count > 0:
            print(f"✓ Mood anchors already present ({count} anchors).")
            return

        print("Seeding mood anchors into ChromaDB...")
        ids = []
        documents = []
        metadatas = []

        for mood, texts in MOOD_ANCHORS.items():
            for i, text in enumerate(texts):
                ids.append(f"{mood}_{i}")
                documents.append(text)
                metadatas.append({"mood": mood})

        try:
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            print("✓ Mood anchors seeded successfully.")
        except Exception as e:
            print(f"❌ Error seeding mood anchors: {e}")

    async def classify_mood(self, text: str) -> str:
        collection = chromadb_client.get_collection("moods")
        if not collection:
            print("⚠️ ChromaDB not available for classification, defaulting to 'joy'")
            return "joy" 

        try:
            # Query for the nearest neighbor
            results = collection.query(
                query_texts=[text],
                n_results=3 # Get top 3 to be safe, though we just take top 1
            )

            if results and results['metadatas'] and len(results['metadatas'][0]) > 0:
                # Return the mood of the closest anchor
                # results['metadatas'] is a list of lists (one per query)
                detected_mood = results['metadatas'][0][0]['mood']
                print(f"🔍 Text classified as: {detected_mood}")
                return detected_mood
            
        except Exception as e:
            print(f"❌ Error during mood classification: {e}")
        
        return "joy" # Default fallback

mood_service = MoodService()

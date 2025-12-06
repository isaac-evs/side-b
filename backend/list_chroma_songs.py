import asyncio
from app.databases.chromadb import chromadb_client

async def list_all_songs():
    print("🔍 Connecting to ChromaDB...")
    await chromadb_client.connect()
    await chromadb_client.initialize()
    
    # Get the songs collection
    songs_collection = chromadb_client.songs_collection
    
    result = songs_collection.get()
    
    print(f"\n📊 Total Songs in ChromaDB: {len(result['ids'])}\n")
    
    for i, song_id in enumerate(result['ids']):
        metadata = result['metadatas'][i]
        document = result['documents'][i]
        
        print(f"[{i+1}] ID: {song_id}")
        print(f"    Title: {metadata.get('title', 'N/A')}")
        print(f"    Artist: {metadata.get('artist', 'N/A')}")
        print(f"    Mood: {metadata.get('mood', 'N/A')}")
        print(f"    Description: {document[:80]}..." if len(document) > 80 else f"    Description: {document}")
        print()
    
    await chromadb_client.disconnect()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(list_all_songs())

import asyncio
from app.databases.chromadb import chromadb_client

async def search_songs(query: str = "happy upbeat music", n_results: int = 5):
    print(f"🔍 Searching ChromaDB for: '{query}'...\n")
    
    await chromadb_client.connect()
    await chromadb_client.initialize()
    
    # Search for songs
    results = await chromadb_client.query_songs(query, n_results=n_results)
    
    if results and results.get('documents'):
        print(f"📊 Found {len(results['documents'][0])} results:\n")
        
        for i, (doc, meta, distance) in enumerate(zip(
            results['documents'][0],
            results['metadatas'][0],
            results['distances'][0]
        )):
            print(f"[{i+1}] {meta.get('title')} - {meta.get('artist')}")
            print(f"    Mood: {meta.get('mood')}")
            print(f"    Similarity Score: {1 - distance:.4f}")
            print(f"    Description: {doc[:100]}...")
            print()
    else:
        print("No results found.")
    
    await chromadb_client.disconnect()

if __name__ == "__main__":
    import sys
    query = sys.argv[1] if len(sys.argv) > 1 else "happy upbeat music"
    asyncio.run(search_songs(query))

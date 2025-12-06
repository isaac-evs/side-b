from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
import os
from openai import AsyncOpenAI
from app.databases.chromadb import chromadb_client

router = APIRouter()

class ChatRequest(BaseModel):
    userId: str
    message: str

class ChatResponse(BaseModel):
    response: str
    context_used: list = []

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
aclient = AsyncOpenAI(api_key=api_key) if api_key else None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest = Body(...)):
    if not aclient:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    try:
        results = await chromadb_client.query_entries(request.message, n_results=5)
        
        context_texts = []
        if results and results['documents']:
            for i, doc_list in enumerate(results['documents']):
                # results['documents'] is a list of lists (one list per query)
                for j, doc in enumerate(doc_list):
                    meta = results['metadatas'][i][j]
                    # Filter by user ID
                    if meta.get('userId') == request.userId:
                        date = meta.get('date', 'Unknown Date')
                        mood = meta.get('mood', 'Unknown Mood')
                        song = meta.get('song', '')
                        artist = meta.get('artist', '')
                        
                        entry_context = f"[Date: {date}, Mood: {mood}] {doc}"
                        if song:
                            entry_context += f"\n(Song listened to: {song} by {artist})"
                        
                        context_texts.append(entry_context)

        context_str = "\n\n".join(context_texts)
        
        system_prompt = f"""You are Side-B, a personal AI journaling assistant. 
You have access to the user's past journal entries to help them reflect, remember, and gain insights.
Use the provided context to answer the user's question or engage in conversation.
Pay close attention to the songs the user has listened to in their entries. If they ask about music, use that information.
If the context doesn't contain the answer, say so, but try to be helpful based on general knowledge if appropriate, 
while reminding the user you only know what's in their journal.
Be empathetic, supportive, and insightful.

Context from past entries:
{context_str}
"""

        # 2. Call OpenAI
        response = await aclient.chat.completions.create(
            model="gpt-3.5-turbo", # Or gpt-4 if available/preferred
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        ai_message = response.choices[0].message.content
        
        return ChatResponse(
            response=ai_message,
            context_used=context_texts
        )

    except Exception as e:
        print(f"AI Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

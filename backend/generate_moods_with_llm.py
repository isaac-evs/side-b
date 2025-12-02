"""
Use a local LLM to automatically generate moods and descriptions for songs.
This script uses transformers to run a small language model locally on your RTX 5070.
"""

import json
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from generate_song_list import SONG_QUERIES

# Check if CUDA is available
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🖥️  Using device: {device}")
if device == "cuda":
    print(f"🎮 GPU: {torch.cuda.get_device_name(0)}")

def load_local_llm():
    """Load a small, efficient LLM that can run on consumer GPUs"""
    print("📥 Loading local LLM (this may take a few minutes on first run)...")
    
    # Using Microsoft's Phi-2 - great performance, small size (2.7B params)
    # Perfect for RTX 5070, runs fast and gives good results
    model_name = "microsoft/phi-2"
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,  # Use FP16 for faster inference
            device_map="auto",
            trust_remote_code=True
        )
        
        print("✅ Model loaded successfully!")
        return pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device_map="auto"
        )
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("💡 Trying a smaller model (TinyLlama)...")
        
        # Fallback to an even smaller model
        model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        return pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device_map="auto"
        )

def generate_mood_and_description(llm, song_query):
    """Generate mood category and description for a song using LLM"""
    
    prompt = f"""Classify this song into ONE mood category and write a brief description.

Song: {song_query}

Mood Categories (choose ONE):
- joy: Happy, upbeat, celebratory songs
- calm: Relaxing, peaceful, meditative songs
- sad: Melancholic, emotional, heartbreak songs
- stress: Energetic, intense, stress-relief songs

Format your response EXACTLY like this:
Mood: [category]
Description: [one short catchy sentence, max 10 words]

Example:
Mood: joy
Description: Impossible not to smile and dance.

Now classify this song:
Song: {song_query}
"""

    try:
        # Generate response
        result = llm(
            prompt,
            max_new_tokens=50,
            temperature=0.7,
            do_sample=True,
            pad_token_id=llm.tokenizer.eos_token_id
        )[0]['generated_text']
        
        # Extract mood and description from response
        response = result.split(prompt)[-1].strip()
        
        mood = "calm"  # Default
        description = "A great track."  # Default
        
        # Parse the response
        for line in response.split('\n'):
            line = line.strip()
            if line.startswith('Mood:'):
                mood_candidate = line.split(':', 1)[1].strip().lower()
                if mood_candidate in ['joy', 'calm', 'sad', 'stress']:
                    mood = mood_candidate
            elif line.startswith('Description:'):
                desc = line.split(':', 1)[1].strip()
                if desc and len(desc) < 100:  # Sanity check
                    description = desc
        
        return mood, description
        
    except Exception as e:
        print(f"   ⚠️  Error generating for {song_query}: {e}")
        # Fallback to simple heuristics
        return classify_by_heuristics(song_query)

def classify_by_heuristics(song_query):
    """Simple fallback classification based on keywords"""
    query_lower = song_query.lower()
    
    # Joy keywords
    joy_keywords = ['happy', 'dance', 'party', 'celebration', 'good', 'uptown', 'shake', 'feeling']
    # Calm keywords
    calm_keywords = ['weightless', 'breathe', 'river', 'night', 'saturn', 'ocean', 'clair']
    # Sad keywords
    sad_keywords = ['hurt', 'tears', 'someone like you', 'fix you', 'yesterday', 'sound of silence']
    # Stress keywords
    stress_keywords = ['thunder', 'lose yourself', 'stronger', 'power', 'sandman', 'eye of tiger']
    
    if any(kw in query_lower for kw in joy_keywords):
        return "joy", "Uplifting and energizing."
    elif any(kw in query_lower for kw in calm_keywords):
        return "calm", "Peaceful and relaxing."
    elif any(kw in query_lower for kw in sad_keywords):
        return "sad", "Emotional and touching."
    elif any(kw in query_lower for kw in stress_keywords):
        return "stress", "Powerful and intense."
    else:
        return "calm", "A timeless classic."

def main():
    """Generate moods and descriptions for all songs"""
    print("🎵 AI-Powered Mood & Description Generator")
    print(f"📊 Processing {len(SONG_QUERIES)} songs...\n")
    
    # Load the LLM
    llm = load_local_llm()
    
    results = []
    
    print("\n🎨 Generating moods and descriptions...\n")
    
    for i, song_query in enumerate(SONG_QUERIES, 1):
        print(f"[{i}/{len(SONG_QUERIES)}] Processing: {song_query}")
        
        mood, description = generate_mood_and_description(llm, song_query)
        
        results.append({
            "query": song_query,
            "mood": mood,
            "description": description
        })
        
        print(f"   → Mood: {mood} | Description: {description}")
        
        # Save intermediate results every 25 songs
        if i % 25 == 0:
            with open('song_moods_partial.json', 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"   💾 Saved checkpoint at {i} songs")
    
    # Save final results
    output_file = "song_moods_generated.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Print statistics
    mood_counts = {}
    for result in results:
        mood = result['mood']
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    print(f"\n✅ Generation complete!")
    print(f"📝 Saved to: {output_file}")
    print(f"\n📊 Mood Distribution:")
    for mood, count in sorted(mood_counts.items()):
        print(f"   {mood}: {count} songs")

if __name__ == "__main__":
    main()

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle, LogIn } from 'lucide-react';
import { songsAPI } from '../../../services/api';
import SpotifyPlayer from './SpotifyPlayer';

const MusicPlayer = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(0);
  const [spotifyToken, setSpotifyToken] = useState(localStorage.getItem('spotify_access_token'));
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await songsAPI.getSongs();
        setSongs(data);
        if (data.length > 0) {
          setCurrentSong(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };
    fetchSongs();
  }, []);

  // Handle Audio Preview Playback
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!spotifyToken && currentSong?.previewUrl) {
      audio.src = currentSong.previewUrl;
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Preview playback failed:", error);
                // Fallback for demo purposes
                audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
                audio.play().catch(e => console.error("Fallback failed", e));
            });
        }
      }
    } else if (!spotifyToken) {
      audio.pause();
      audio.src = '';
    }

    return () => {
      audio.pause();
    };
  }, [currentSong, spotifyToken]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!spotifyToken && audio.src) {
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.error("Preview playback failed:", e));
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, spotifyToken]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleSpotifyLogin = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID; 
    const redirectUri = "http://127.0.0.1:5173/callback";
    const scopes = "streaming user-read-email user-read-private user-modify-playback-state";
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id || s._id === currentSong?._id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const handlePrevious = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id || s._id === currentSong?._id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[prevIndex]);
  };

  if (!currentSong) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading songs...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Spotify Login Banner */}
      {!spotifyToken && (
        <div className="bg-black text-white p-2 text-xs flex justify-between items-center">
          <span>Connect Spotify for full playback</span>
          <button 
            onClick={handleSpotifyLogin}
            className="flex items-center bg-green-500 text-black px-2 py-1 rounded font-bold hover:bg-green-400 transition-colors"
          >
            <LogIn className="w-3 h-3 mr-1" /> Login
          </button>
        </div>
      )}

      {/* Album Art Area */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div 
          className="w-64 h-64 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden relative"
          style={{
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          {/* Gradient Background */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${currentSong.mood === 'joy' ? '#F6DD73' : 
                                                     currentSong.mood === 'calm' ? '#6EC9B1' : 
                                                     currentSong.mood === 'sad' ? '#5386FE' : '#FE5344'} 0%, 
                                                     ${currentSong.mood === 'joy' ? '#f5c842' : 
                                                       currentSong.mood === 'calm' ? '#4db89a' : 
                                                       currentSong.mood === 'sad' ? '#3d6edb' : '#db3228'} 100%)`
            }}
          />
          
          {/* Icon if no image */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
              {!currentSong.coverUrl && <div className="text-white text-6xl opacity-80">♪</div>}
          </div>

          {/* Image */}
          {currentSong.coverUrl && (
              <img 
                  src={currentSong.coverUrl} 
                  className="absolute inset-0 w-full h-full object-cover z-20" 
                  onError={(e) => e.target.style.display = 'none'}
                  alt={currentSong.title}
              />
          )}
        </div>
        
        {/* Spotify Player Overlay */}
        {spotifyToken && (
            <div className="absolute bottom-4 left-0 right-0 px-8">
                <SpotifyPlayer token={spotifyToken} trackUri={currentSong.spotifyUri} />
            </div>
        )}
      </div>

      {/* Song Info */}
      <div className="px-8 pb-4 text-center">
        <h2 
          className="text-xl font-bold mb-1"
          style={{
            color: '#000',
            fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
          }}
        >
          {currentSong.title}
        </h2>
        <p 
          className="text-sm mb-4"
          style={{
            color: '#666',
            fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
          }}
        >
          {currentSong.artist}
        </p>

        {/* Progress Bar (Visual Only if using Spotify) */}
        {!spotifyToken && (
            <div className="mb-4">
            <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                background: `linear-gradient(to right, #4580d4 0%, #4580d4 ${progress}%, #d0d0d0 ${progress}%, #d0d0d0 100%)`
                }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#666' }}>
                <span>0:00</span>
                <span>3:45</span>
            </div>
            </div>
        )}
      </div>

      {/* Controls (Hidden if Spotify is active, or kept for visual consistency) */}
      {!spotifyToken && (
        <div 
            className="px-8 pb-6"
            style={{
            background: 'linear-gradient(to bottom, #e0e0e0 0%, #d5d5d5 100%)',
            borderTop: '1px solid rgba(0,0,0,0.1)'
            }}
        >
            <div className="flex items-center justify-center space-x-4 py-4">
            <button 
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                style={{ color: '#333' }}
            >
                <Shuffle className="w-5 h-5" />
            </button>
            
            <button 
                onClick={handlePrevious}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                style={{ color: '#333' }}
            >
                <SkipBack className="w-6 h-6" />
            </button>
            
            <button 
                onClick={handlePlayPause}
                className="p-4 rounded-full transition-all hover:scale-105"
                style={{
                background: 'linear-gradient(to bottom, #4580d4 0%, #2e5fa8 100%)',
                border: '1px solid rgba(0,0,0,0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
            >
                {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
                ) : (
                <Play className="w-6 h-6 text-white" />
                )}
            </button>
            
            <button 
                onClick={handleNext}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                style={{ color: '#333' }}
            >
                <SkipForward className="w-6 h-6" />
            </button>
            
            <button 
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                style={{ color: '#333' }}
            >
                <Repeat className="w-5 h-5" />
            </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center space-x-3 mt-2">
            <Volume2 className="w-4 h-4" style={{ color: '#666' }} />
            <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-32 h-1 rounded-full appearance-none cursor-pointer"
                style={{
                background: `linear-gradient(to right, #4580d4 0%, #4580d4 ${volume}%, #d0d0d0 ${volume}%, #d0d0d0 100%)`
                }}
            />
            </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;

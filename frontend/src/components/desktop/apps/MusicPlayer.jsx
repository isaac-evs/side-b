import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle, Music } from 'lucide-react';
import useAppStore from '../../../store/appStore';

const MusicPlayer = () => {
  const { entries, musicState, setMusicState, playSong, pauseSong } = useAppStore();
  const { currentSong, isPlaying, volume, progress } = musicState;
  const [songs, setSongs] = useState([]);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    // Extract songs from entries
    const userSongs = entries
      .map(entry => entry.song)
      .filter(song => song !== null && song !== undefined);
    
    // Remove duplicates based on _id or id
    const uniqueSongs = Array.from(new Map(userSongs.map(song => [song._id || song.id, song])).values());
    
    setSongs(uniqueSongs);
    
    // Set initial song if none selected and songs exist
    if (uniqueSongs.length > 0 && !currentSong) {
      setMusicState({ currentSong: uniqueSongs[0] });
    }
  }, [entries]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle Song Change & Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    
    if (currentSong) {
      if (audio.src !== currentSong.previewUrl) {
        if (currentSong.previewUrl) {
            audio.src = currentSong.previewUrl;
        } else {
            audio.src = '';
        }
      }

      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback failed:", error);
            pauseSong();
          });
        }
      } else {
        audio.pause();
      }
    }
  }, [currentSong, isPlaying]);

  // Handle Progress and Auto-Next
  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      if (audio.duration) {
        setMusicState({ progress: (audio.currentTime / audio.duration) * 100 });
      }
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  });

  const handlePlayPause = () => {
    if (!currentSong) return;
    if (!currentSong.previewUrl) {
        alert("No preview available for this song.");
        return;
    }
    if (isPlaying) {
        pauseSong();
    } else {
        playSong(currentSong);
    }
  };

  const handleNext = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => (s.id || s._id) === (currentSong?.id || currentSong?._id));
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  const handlePrevious = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => (s.id || s._id) === (currentSong?.id || currentSong?._id));
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    playSong(songs[prevIndex]);
  };

  const handleSeek = (e) => {
    const newProgress = parseInt(e.target.value);
    setMusicState({ progress: newProgress });
    const audio = audioRef.current;
    if (audio.duration) {
      audio.currentTime = (newProgress / 100) * audio.duration;
    }
  };

  if (!currentSong) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No songs in your library yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header / Now Playing Info */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <div className="text-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{currentSong.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{currentSong.artist} — {currentSong.album || 'Unknown Album'}</p>
        </div>
      </div>

      {/* Album Art Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="w-64 h-64 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden relative bg-gray-200 dark:bg-gray-800"
          style={{
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
        >
          {/* Gradient Background if no image */}
          {!currentSong.coverUrl && (
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
          )}
          
          {/* Icon if no image */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
              {!currentSong.coverUrl && <Music className="w-24 h-24 text-white opacity-50" />}
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
      </div>

      {/* Controls Area */}
      <div className="px-10 pb-10">
        {/* Progress Bar */}
        <div className="mb-6 group">
            <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-gray-500 dark:accent-gray-400 hover:accent-gray-700 dark:hover:accent-white"
                style={{
                    backgroundImage: `linear-gradient(to right, #888 0%, #888 ${progress}%, transparent ${progress}%, transparent 100%)`
                }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>{Math.floor((progress / 100) * 30)}:{(Math.floor(((progress / 100) * 30) % 60)).toString().padStart(2, '0')}</span>
                <span>0:30</span>
            </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-10 mb-8">
          <button 
              onClick={handlePrevious}
              className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
              <SkipBack className="w-8 h-8 fill-current" />
          </button>
          
          <button 
              onClick={handlePlayPause}
              className="text-gray-900 dark:text-white hover:scale-105 transition-transform"
          >
              {isPlaying ? (
              <Pause className="w-12 h-12 fill-current" />
              ) : (
              <Play className="w-12 h-12 fill-current" />
              )}
          </button>
          
          <button 
              onClick={handleNext}
              className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
              <SkipForward className="w-8 h-8 fill-current" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-3">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setMusicState({ volume: parseInt(e.target.value) })}
              className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;

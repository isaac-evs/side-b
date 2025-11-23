import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle } from 'lucide-react';
import { songs } from '../../../data/mockData';

const MusicPlayer = () => {
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const handlePrevious = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[prevIndex]);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Album Art Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="w-64 h-64 rounded-lg shadow-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${currentSong.mood === 'joy' ? '#F6DD73' : 
                                                     currentSong.mood === 'calm' ? '#6EC9B1' : 
                                                     currentSong.mood === 'sad' ? '#5386FE' : '#FE5344'} 0%, 
                                                     ${currentSong.mood === 'joy' ? '#f5c842' : 
                                                       currentSong.mood === 'calm' ? '#4db89a' : 
                                                       currentSong.mood === 'sad' ? '#3d6edb' : '#db3228'} 100%)`,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          <div className="text-white text-6xl opacity-80">♪</div>
        </div>
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

        {/* Progress Bar */}
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
      </div>

      {/* Controls */}
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
    </div>
  );
};

export default MusicPlayer;

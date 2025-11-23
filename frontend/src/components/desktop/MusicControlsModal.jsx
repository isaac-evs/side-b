import React, { useState } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';

const MusicControlsModal = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(30);
  const [currentSong] = useState({
    title: 'Sunshine Rhythm',
    artist: 'The Bright Notes',
    album: 'Golden Days',
    duration: '3:45',
    currentTime: '1:23'
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%)',
          border: '1px solid rgba(0,0,0,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{
            background: 'linear-gradient(to bottom, #c8d5e5 0%, #9bb0cc 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.15)'
          }}
        >
          <h2 
            className="text-lg font-bold text-white"
            style={{
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Now Playing
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Album Art */}
          <div 
            className="w-full aspect-square rounded-lg mb-6"
            style={{
              background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B35 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          />

          {/* Song Info */}
          <div className="text-center mb-6">
            <h3 
              className="text-xl font-bold mb-1"
              style={{
                color: '#000',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              {currentSong.title}
            </h3>
            <p 
              className="text-sm"
              style={{
                color: '#666',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              {currentSong.artist}
            </p>
            <p 
              className="text-xs mt-1"
              style={{
                color: '#999',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              {currentSong.album}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div 
              className="w-full h-1.5 rounded-full mb-2 cursor-pointer"
              style={{ backgroundColor: '#d0d0d0' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const newProgress = (x / rect.width) * 100;
                setProgress(newProgress);
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(to right, #4580d4, #2e5fa8)'
                }}
              />
            </div>
            <div 
              className="flex justify-between text-xs"
              style={{
                color: '#666',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              <span>{currentSong.currentTime}</span>
              <span>{currentSong.duration}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" style={{ color: '#666' }} />
            </button>
            <button
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              title="Previous"
            >
              <SkipBack className="w-6 h-6" style={{ color: '#000' }} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(to bottom, #4580d4 0%, #2e5fa8 100%)',
                boxShadow: '0 4px 12px rgba(69, 128, 212, 0.4)'
              }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>
            <button
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              title="Next"
            >
              <SkipForward className="w-6 h-6" style={{ color: '#000' }} />
            </button>
            <button
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              title="Repeat"
            >
              <Repeat className="w-5 h-5" style={{ color: '#666' }} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5" style={{ color: '#666' }} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="flex-1"
              style={{
                height: '4px',
                borderRadius: '2px',
                background: `linear-gradient(to right, #4580d4 ${volume}%, #d0d0d0 ${volume}%)`,
                outline: 'none',
                appearance: 'none'
              }}
            />
            <span 
              className="text-xs w-8 text-right"
              style={{
                color: '#666',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              {volume}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicControlsModal;

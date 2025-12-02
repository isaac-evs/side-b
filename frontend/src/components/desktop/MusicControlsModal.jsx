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
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Minimal */}
        <div 
          className="flex items-center justify-between px-4 py-3 select-none relative"
          style={{
            backgroundColor: '#f6f6f6',
            borderBottom: '1px solid #e1e1e1',
            height: '38px'
          }}
        >
          <div className="flex items-center space-x-2 group">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full relative transition-all duration-150"
              style={{
                backgroundColor: '#ff5f56',
                border: '0.5px solid rgba(0,0,0,0.1)',
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/50">×</span>
            </button>
          </div>
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span 
              className="text-xs font-medium tracking-tight text-gray-500 uppercase"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Now Playing
            </span>
          </div>
          
          <div className="w-3"></div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white/80 backdrop-blur-xl">
          {/* Album Art */}
          <div 
            className="w-48 h-48 mx-auto rounded-lg mb-6 shadow-lg transition-transform hover:scale-105 duration-500"
            style={{
              background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B35 100%)',
              boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)'
            }}
          />

          {/* Song Info */}
          <div className="text-center mb-6">
            <h3 
              className="text-lg font-semibold mb-1 text-gray-900"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {currentSong.title}
            </h3>
            <p 
              className="text-sm text-pink-500 font-medium"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {currentSong.artist} — {currentSong.album}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 group">
            <div 
              className="w-full h-1 rounded-full mb-2 cursor-pointer bg-gray-200 overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const newProgress = (x / rect.width) * 100;
                setProgress(newProgress);
              }}
            >
              <div
                className="h-full rounded-full transition-all bg-gray-400 group-hover:bg-pink-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div 
              className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <span>{currentSong.currentTime}</span>
              <span>{currentSong.duration}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-0 transition-transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-gray-800 fill-current" />
              ) : (
                <Play className="w-10 h-10 text-gray-800 fill-current" />
              )}
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3 px-4">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicControlsModal;

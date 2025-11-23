import React, { useState } from 'react';
import { Music, List, Grid } from 'lucide-react';
import { songs } from '../../../data/mockData';

const MusicLibrary = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedMood, setSelectedMood] = useState('all');

  const moods = {
    all: { name: 'All Songs', color: '#666' },
    joy: { name: 'Joy', color: '#F6DD73' },
    calm: { name: 'Calm', color: '#6EC9B1' },
    sad: { name: 'Sad', color: '#5386FE' },
    stress: { name: 'Stress', color: '#FE5344' }
  };

  const filteredSongs = selectedMood === 'all' 
    ? songs 
    : songs.filter(song => song.mood === selectedMood);

  return (
    <div className="h-full flex" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div 
        className="w-48 border-r p-3"
        style={{
          background: 'linear-gradient(to right, #dde5ef 0%, #e8ecf3 100%)',
          borderRight: '1px solid rgba(0,0,0,0.15)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.5)'
        }}
      >
        <h3 
          className="font-semibold mb-3 flex items-center text-xs"
          style={{
            color: '#000',
            fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
          }}
        >
          <Music className="w-3.5 h-3.5 mr-1.5" />
          LIBRARY
        </h3>
        
        <div className="space-y-1">
          {Object.entries(moods).map(([key, mood]) => (
            <button
              key={key}
              onClick={() => setSelectedMood(key)}
              className="w-full text-left px-2 py-1.5 rounded text-xs transition-all flex items-center"
              style={{
                background: selectedMood === key
                  ? 'linear-gradient(to bottom, #4580d4 0%, #2e5fa8 100%)'
                  : 'transparent',
                color: selectedMood === key ? '#fff' : '#000',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                border: selectedMood === key ? '1px solid rgba(0,0,0,0.2)' : '1px solid transparent'
              }}
            >
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: key === 'all' ? '#999' : mood.color }}
              />
              {mood.name}
            </button>
          ))}
        </div>

        <div className="mt-6 pt-3 border-t border-black/10">
          <p className="text-xs mb-2" style={{ color: '#666', fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif' }}>
            {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div 
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            background: 'linear-gradient(to bottom, #e8e8e8 0%, #d5d5d5 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.15)'
          }}
        >
          <h2 
            className="text-sm font-semibold"
            style={{
              color: '#000',
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
            }}
          >
            {moods[selectedMood].name}
          </h2>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 rounded"
              style={{
                background: viewMode === 'list' ? 'rgba(0,0,0,0.1)' : 'transparent',
                color: '#333'
              }}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="p-1.5 rounded"
              style={{
                background: viewMode === 'grid' ? 'rgba(0,0,0,0.1)' : 'transparent',
                color: '#333'
              }}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'list' ? (
            <div className="space-y-1">
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center p-2 rounded hover:bg-white/60 transition-colors cursor-pointer group"
                >
                  <div className="w-8 text-xs text-center" style={{ color: '#999' }}>
                    {index + 1}
                  </div>
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center mr-3 text-white text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${song.mood === 'joy' ? '#F6DD73' : 
                                                             song.mood === 'calm' ? '#6EC9B1' : 
                                                             song.mood === 'sad' ? '#5386FE' : '#FE5344'} 0%, 
                                                             ${song.mood === 'joy' ? '#f5c842' : 
                                                               song.mood === 'calm' ? '#4db89a' : 
                                                               song.mood === 'sad' ? '#3d6edb' : '#db3228'} 100%)`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    ♪
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium truncate"
                      style={{
                        color: '#000',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    >
                      {song.title}
                    </p>
                    <p 
                      className="text-xs truncate"
                      style={{
                        color: '#666',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    >
                      {song.artist}
                    </p>
                  </div>
                  <div className="text-xs" style={{ color: '#999' }}>
                    3:45
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  className="cursor-pointer group"
                >
                  <div 
                    className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center text-white text-4xl transition-transform group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${song.mood === 'joy' ? '#F6DD73' : 
                                                             song.mood === 'calm' ? '#6EC9B1' : 
                                                             song.mood === 'sad' ? '#5386FE' : '#FE5344'} 0%, 
                                                             ${song.mood === 'joy' ? '#f5c842' : 
                                                               song.mood === 'calm' ? '#4db89a' : 
                                                               song.mood === 'sad' ? '#3d6edb' : '#db3228'} 100%)`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    ♪
                  </div>
                  <p 
                    className="text-sm font-medium truncate"
                    style={{
                      color: '#000',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    {song.title}
                  </p>
                  <p 
                    className="text-xs truncate"
                    style={{
                      color: '#666',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    {song.artist}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicLibrary;

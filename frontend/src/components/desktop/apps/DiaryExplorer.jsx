import React, { useState } from 'react';
import useAppStore from '../../../store/appStore';
import FileIcon from '../FileIcon';
import { FolderOpen, FileText, Music, Calendar } from 'lucide-react';

const DiaryExplorer = () => {
  const { entries } = useAppStore();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [excludedMoods, setExcludedMoods] = useState([]);

  const moods = {
    joy: { name: 'Joy', color: '#F6DD73', emoji: '😊' },
    calm: { name: 'Calm', color: '#6EC9B1', emoji: '😌' },
    sad: { name: 'Sad', color: '#5386FE', emoji: '😢' },
    stress: { name: 'Stress', color: '#FE5344', emoji: '😰' }
  };

  // Toggle mood exclusion
  const toggleMoodFilter = (mood) => {
    setExcludedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  // Check if a file should be visible based on excluded moods
  const isFileVisible = (mood) => {
    return !excludedMoods.includes(mood);
  };

  // Get visible files for selected entry
  const getVisibleFiles = () => {
    if (!selectedEntry) return [];
    const files = [];
    
    // feelings.txt - has the mood from the entry
    if (isFileVisible(selectedEntry.mood)) {
      files.push({
        type: 'feelings',
        name: 'feelings.txt',
        mood: selectedEntry.mood
      });
    }
    
    // song.mp3 - has the mood from the song
    if (selectedEntry.song && isFileVisible(selectedEntry.song.mood)) {
      files.push({
        type: 'song',
        name: 'song.mp3',
        mood: selectedEntry.song.mood
      });
    }
    
    return files;
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Sidebar with Aqua styling */}
      <div 
        className="w-64 border-r flex flex-col"
        style={{
          background: 'linear-gradient(to right, #dde5ef 0%, #e8ecf3 100%)',
          borderRight: '1px solid rgba(0,0,0,0.15)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.5)'
        }}
      >
        <div className="p-4">
          <h3 
            className="font-semibold mb-4 flex items-center text-sm"
            style={{
              color: '#000',
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
            }}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Diary Entries
          </h3>
        </div>
        
        {/* Scrollable entries list */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            {entries.length === 0 ? (
              <p 
                className="text-sm"
                style={{
                  color: '#666',
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                }}
              >
                No entries yet
              </p>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setSelectedEntry(entry);
                    setViewingFile(null);
                  }}
                  className="w-full text-left p-2.5 rounded transition-all"
                  style={{
                    background: selectedEntry?.id === entry.id
                      ? 'linear-gradient(to bottom, #4580d4 0%, #2e5fa8 100%)'
                      : 'transparent',
                    color: selectedEntry?.id === entry.id ? '#fff' : '#000',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                    border: selectedEntry?.id === entry.id ? '1px solid rgba(0,0,0,0.2)' : '1px solid transparent'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs flex items-center" style={{ opacity: selectedEntry?.id === entry.id ? 1 : 0.7 }}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ opacity: selectedEntry?.id === entry.id ? 0.9 : 0.7 }}>
                    {entry.text.substring(0, 30)}...
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Mood Filter Tags - Below entries */}
        <div className="p-4 border-t" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <h4 
            className="text-xs font-semibold mb-2"
            style={{
              color: '#666',
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
            }}
          >
            Tags
          </h4>
          <div className="space-y-1">
            {Object.entries(moods).map(([key, mood]) => (
              <button
                key={key}
                onClick={() => toggleMoodFilter(key)}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs transition-all"
                style={{
                  background: excludedMoods.includes(key)
                    ? 'rgba(0,0,0,0.1)'
                    : 'linear-gradient(to bottom, #fff 0%, #f0f0f0 100%)',
                  border: '1px solid rgba(0,0,0,0.15)',
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                  opacity: excludedMoods.includes(key) ? 0.4 : 1,
                  textDecoration: excludedMoods.includes(key) ? 'line-through' : 'none'
                }}
                title={excludedMoods.includes(key) ? `Show ${mood.name} files` : `Hide ${mood.name} files`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: mood.color }}
                />
                <span style={{ color: '#000' }}>{mood.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Icons View */}
        {selectedEntry && !viewingFile && (
          <div 
            className="flex-1 relative overflow-hidden"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            {/* Header Bar */}
            <div 
              className="absolute top-0 left-0 right-0 p-4 border-b"
              style={{
                background: 'linear-gradient(to bottom, #e8e8e8 0%, #f5f5f5 100%)',
                borderBottom: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <h2 
                className="text-lg font-bold"
                style={{
                  color: '#000',
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                }}
              >
                {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
            </div>

            {/* Files Container */}
            <div className="absolute top-20 left-0 right-0 bottom-0 overflow-auto">
              {getVisibleFiles().length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p 
                    className="text-sm"
                    style={{
                      color: '#666',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    All files are filtered out by tags
                  </p>
                </div>
              ) : (
                <>
                  {getVisibleFiles().map((file, index) => (
                    <FileIcon
                      key={file.type}
                      icon={
                        file.type === 'feelings' ? (
                          <FileText className="w-8 h-8 text-blue-500" />
                        ) : (
                          <Music className="w-8 h-8 text-pink-500" />
                        )
                      }
                      title={file.name}
                      subtitle={
                        file.type === 'feelings' 
                          ? `${selectedEntry.text.length} chars`
                          : selectedEntry.song.artist
                      }
                      position={{ x: 20 + (index * 140), y: 20 }}
                      moodColor={moods[file.mood]?.color}
                      onDoubleClick={() => setViewingFile(file.type)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* File Viewer */}
        {viewingFile && (
          <div className="flex-1 p-6 bg-white dark:bg-gray-900 overflow-y-auto">
            <button
              onClick={() => setViewingFile(null)}
              className="mb-4 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to files
            </button>

            {viewingFile === 'feelings' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    feelings.txt
                  </h3>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: moods[selectedEntry.mood]?.color,
                      color: '#000'
                    }}
                  >
                    {moods[selectedEntry.mood]?.name}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedEntry.text}
                </p>
              </div>
            )}

            {viewingFile === 'song' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                  song.mp3
                </h3>
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="mb-4">
                    <Music className="w-16 h-16 mb-4" />
                    <h4 className="text-2xl font-bold mb-2">{selectedEntry.song.title}</h4>
                    <p className="text-lg opacity-90">{selectedEntry.song.artist}</p>
                  </div>
                  <div className="mt-6">
                    <div className="w-full h-2 bg-white/30 rounded-full mb-2">
                      <div className="w-0 h-full bg-white rounded-full" />
                    </div>
                    <div className="flex justify-between text-sm opacity-75">
                      <span>0:00</span>
                      <span>3:45</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedEntry && (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select an entry to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryExplorer;

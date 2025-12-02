import React, { useState } from 'react';
import useAppStore from '../../../store/appStore';
import { Rnd } from 'react-rnd';
import { FolderOpen, FileText, Music, Calendar, Image as ImageIcon, BookOpen, Film, Youtube } from 'lucide-react';
import txtIcon from '../../../assets/txt.png';

const FileThumbnail = ({ file, fallbackIcon, songData }) => {
  const [error, setError] = useState(false);
  
  const hasImage = (file.type === 'image' || file.type === 'gif') && file.metadata?.imageUrl;
  const hasSongCover = file.type === 'song' && songData?.coverUrl;
  
  if (hasSongCover && !error) {
    return (
      <img 
        src={songData.coverUrl} 
        alt={file.name}
        className="w-20 object-contain"
        onError={() => setError(true)}
        draggable={false}
      />
    );
  }
  
  if (hasImage && !error) {
    return (
      <img 
        src={file.metadata.imageUrl} 
        alt={file.name}
        className="w-16 object-contain"
        onError={() => setError(true)}
        draggable={false}
      />
    );
  }
  
  return fallbackIcon;
};

const SimpleFileIcon = ({ icon, title, subtitle, onDoubleClick, position, moodColor }) => {
  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: 120,
        height: 'auto'
      }}
      enableResizing={false}
      bounds="parent"
      dragHandleClassName="file-icon-handle"
    >
      <div
        onDoubleClick={onDoubleClick}
        className="file-icon-handle cursor-pointer select-none group flex flex-col items-center"
        style={{ width: '120px' }}
      >
        <div className="flex flex-col items-center space-y-1">
          {/* Icon Container */}
          <div className="relative transition-transform active:scale-95">
            <div className="flex items-center justify-center">
              {icon}
            </div>
            
            {/* Mood color indicator */}
            {moodColor && (
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ 
                  backgroundColor: moodColor,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              />
            )}
          </div>
          
          {/* Title */}
          <div 
            className="text-center px-1 w-full"
            style={{
              maxWidth: '100px'
            }}
          >
            <div 
              className="text-xs font-medium text-white truncate leading-tight group-hover:bg-[#0061D5] group-hover:rounded px-1.5 py-0.5 inline-block"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div 
                className="text-[10px] text-white/80 truncate mt-0.5"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </Rnd>
  );
};

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
    
    // Add uploaded files from the entry
    if (selectedEntry.files && Array.isArray(selectedEntry.files)) {
      selectedEntry.files.forEach(file => {
        if (isFileVisible(file.mood || selectedEntry.mood)) {
          files.push({
            ...file,
            name: file.fileName || file.name,
            type: file.fileType || file.type,
            mood: file.mood || selectedEntry.mood
          });
        }
      });
    }
    
    return files;
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'feelings': return <img src={txtIcon} alt="text file" className="w-16 object-contain" draggable={false} />;
      case 'song': return <Music className="w-16 h-16 text-pink-500" />;
      case 'image': 
      case 'gif': return <ImageIcon className="w-16 h-16 text-purple-500" />;
      case 'book': return <BookOpen className="w-16 h-16 text-amber-600" />;
      case 'movie': return <Film className="w-16 h-16 text-red-500" />;
      case 'video': return <Youtube className="w-16 h-16 text-red-600" />;
      default: return <FileText className="w-16 h-16 text-gray-500" />;
    }
  };

  const getFileSubtitle = (file) => {
    if (file.type === 'feelings') return `${selectedEntry.text.length} chars`;
    if (file.type === 'song') return selectedEntry.song.artist;
    if (file.type === 'book') return file.metadata?.author || 'Book';
    if (file.type === 'image' || file.type === 'gif') return file.metadata?.extension || 'Image';
    return file.type;
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 text-sm">
      {/* Sidebar with Catalina styling */}
      <div 
        className="w-48 flex flex-col"
        style={{
          backgroundColor: 'rgba(240, 240, 240, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="p-3 pt-4">
          <h3 
            className="text-xs font-semibold text-gray-500 mb-2 px-2"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            Favorites
          </h3>
          <div className="space-y-0.5">
             <div className="flex items-center px-2 py-1 rounded bg-gray-300/50 text-gray-800">
                <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
                <span>All Entries</span>
             </div>
          </div>
        </div>
        
        {/* Scrollable entries list */}
        <div className="flex-1 overflow-y-auto px-2">
          <h3 
            className="text-xs font-semibold text-gray-500 mb-2 px-2 mt-2"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            Entries
          </h3>
          <div className="space-y-0.5">
            {entries.length === 0 ? (
              <p className="text-xs text-gray-500 px-2">No entries yet</p>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setSelectedEntry(entry);
                    setViewingFile(null);
                  }}
                  className={`w-full text-left px-2 py-1 rounded flex items-center space-x-2 transition-colors ${
                    selectedEntry?.id === entry.id 
                      ? 'text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className={`truncate text-xs ${selectedEntry?.id === entry.id ? 'font-bold' : 'font-medium'}`}>
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Mood Filter Tags - Below entries */}
        <div className="p-3 pb-6">
          <h4 
            className="text-xs font-semibold text-gray-500 mb-2 px-2"
          >
            Tags
          </h4>
          <div className="space-y-0.5">
            {Object.entries(moods).map(([key, mood]) => (
              <button
                key={key}
                onClick={() => toggleMoodFilter(key)}
                className="w-full flex items-center space-x-2 px-2 py-1 rounded text-xs transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                style={{
                  opacity: excludedMoods.includes(key) ? 0.5 : 1,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: mood.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Finder Toolbar */}
        <div className="h-12 flex items-center px-4 bg-[#f6f6f6] dark:bg-[#2a2a2a]">
            <div className="flex space-x-4">
                <div className="flex space-x-1">
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    {selectedEntry ? new Date(selectedEntry.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Diary Explorer'}
                </div>
            </div>
        </div>

        {/* File Icons View */}
        {selectedEntry && !viewingFile && (
          <div className="flex-1 relative overflow-auto p-4">
            {getVisibleFiles().length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400">No items</p>
              </div>
            ) : (
              <div className="w-full h-full relative min-h-[500px]">
                  {getVisibleFiles().map((file, index) => {
                    // Calculate grid-like initial positions
                    const col = index % 4;
                    const row = Math.floor(index / 4);
                    
                    return (
                      <SimpleFileIcon
                        key={`${file.type}-${index}`}
                        icon={
                            <FileThumbnail 
                            file={file} 
                            fallbackIcon={getFileIcon(file.type)}
                            songData={file.type === 'song' ? selectedEntry.song : null}
                            />
                        }
                        title={file.name}
                        subtitle={getFileSubtitle(file)}
                        position={{ x: 20 + (col * 130), y: 20 + (row * 130) }}
                        moodColor={moods[file.mood]?.color}
                        onDoubleClick={() => setViewingFile(file.type === 'feelings' || file.type === 'song' ? file.type : file)}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* File Viewer */}
        {viewingFile && (
          <div className="flex-1 p-6 bg-white dark:bg-gray-900 overflow-y-auto">
            <button
              onClick={() => setViewingFile(null)}
              className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Back
            </button>

            {viewingFile === 'feelings' && (
              <div className="max-w-2xl mx-auto bg-white shadow-sm p-8 min-h-[400px]">
                <div className="flex items-center justify-between mb-6 pb-4">
                  <h3 className="text-xl font-serif font-bold text-gray-900">
                    {new Date(selectedEntry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
                    style={{
                      backgroundColor: moods[selectedEntry.mood]?.color + '40',
                      color: '#000'
                    }}
                  >
                    {moods[selectedEntry.mood]?.name}
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed font-serif text-lg whitespace-pre-wrap">
                  {selectedEntry.text}
                </p>
              </div>
            )}

            {viewingFile === 'song' && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-64 h-64 bg-gray-100 rounded-lg shadow-lg mb-6 flex items-center justify-center overflow-hidden">
                    {selectedEntry.song.coverUrl ? (
                        <img src={selectedEntry.song.coverUrl} alt="Album Art" className="w-full h-full object-cover" />
                    ) : (
                        <Music className="w-24 h-24 text-gray-300" />
                    )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedEntry.song.title}
                </h3>
                <p className="text-lg text-gray-500 mb-8">{selectedEntry.song.artist}</p>
                
                {/* Simple Player UI */}
                <div className="w-96 bg-gray-100 dark:bg-gray-800 rounded-full p-2 flex items-center space-x-4">
                    <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                    <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-black"></div>
                    </div>
                    <span className="text-xs text-gray-500 pr-3">1:23</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedEntry && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Select an entry to view files</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryExplorer;

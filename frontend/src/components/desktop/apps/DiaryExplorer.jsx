import React, { useState } from 'react';
import useAppStore from '../../../store/appStore';
import { useDesktop } from '../../../contexts/DesktopContext';
import { Rnd } from 'react-rnd';
import { FolderOpen, FileText, Music, Calendar, Image as ImageIcon, BookOpen, Film, Youtube } from 'lucide-react';
import txtIcon from '../../../assets/txt.png';
import webIcon from '../../../assets/web.png';

const FileThumbnail = ({ file, fallbackIcon, songData }) => {
  const [error, setError] = useState(false);
  
  const hasImage = (file.type === 'image' || file.type === 'gif' || file.type === 'movie' || file.type === 'video') && file.metadata?.imageUrl;
  const hasSongCover = file.type === 'song' && songData?.coverUrl;
  const hasBookCover = file.type === 'book' && (file.metadata?.coverUrl || file.metadata?.imageUrl);
  
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
  
  if (hasBookCover && !error) {
    return (
      <img 
        src={file.metadata.coverUrl || file.metadata.imageUrl} 
        alt={file.name}
        className="w-16 object-contain"
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

const SimpleFileIcon = ({ icon, title, subtitle, onDoubleClick, onContextMenu, position, moodColor }) => {
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
        onContextMenu={onContextMenu}
        className="file-icon-handle cursor-pointer select-none group flex flex-col items-center"
        style={{ width: '120px' }}
      >
        <div className="flex flex-col items-center space-y-1">
          {/* Icon Container */}
          <div className="transition-transform active:scale-95">
            <div className="flex items-center justify-center">
              {icon}
            </div>
          </div>
          
          {/* Title with mood dot */}
          <div 
            className="text-center px-1 w-full flex items-center justify-center gap-1.5"
            style={{
              maxWidth: '100px'
            }}
          >
            {/* Mood color indicator - now on the left of text */}
            {moodColor && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: moodColor,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div 
                className="text-xs font-medium text-black truncate leading-tight px-1.5 py-0.5"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                {title}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Rnd>
  );
};

const DiaryExplorer = () => {
  const { entries, moveFileToTrash } = useAppStore();
  const { openWindow } = useDesktop();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [excludedMoods, setExcludedMoods] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);

  // Close context menu when clicking anywhere
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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
    
    // Add uploaded files from the entry (filter out deleted ones)
    if (selectedEntry.files && Array.isArray(selectedEntry.files)) {
      selectedEntry.files.forEach(file => {
        // Skip files marked as deleted
        if (file.deleted) return;
        
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
      case 'feelings': 
      case 'text':
        return <img src={txtIcon} alt="text file" className="w-16 object-contain" draggable={false} />;
      case 'song': return <Music className="w-16 h-16 text-pink-500" />;
      case 'image': 
      case 'gif': 
      case 'book': 
      case 'movie': 
      case 'video': 
        return <img src={webIcon} alt="web link" className="w-16 object-contain" draggable={false} />;
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

  const handleDeleteFile = (fileIndex, fileType, file) => {
    if (fileType === 'feelings' || fileType === 'song') {
      alert('Cannot delete feelings.txt or song.mp3');
      return;
    }
    
    if (window.confirm('Move this file to trash?')) {
      // Find the actual index in the entry's files array
      // We need to find which uploaded file this corresponds to
      const uploadedFileIndex = selectedEntry.files.findIndex(f => 
        f._id === file._id || 
        (f.fileName === file.fileName && f.fileType === file.fileType)
      );
      
      if (uploadedFileIndex !== -1) {
        moveFileToTrash(selectedEntry.id || selectedEntry._id, uploadedFileIndex, file);
      }
      setContextMenu(null);
    }
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
        {selectedEntry && (
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
                    
                    // Get the display name with extension for uploaded files
                    let displayName = file.name;
                    if (file.metadata?.extension && file.type !== 'feelings' && file.type !== 'song') {
                      displayName = `${file.name}.${file.metadata.extension}`;
                    }
                    
                    // Handle double click
                    const handleDoubleClick = () => {
                      if (file.type === 'song') {
                        openWindow('music-player');
                      } else {
                        // Open file viewer window for all other file types
                        openWindow(`file-viewer-${file.type}-${index}`, {
                          title: displayName,
                          file: file,
                          entry: selectedEntry,
                          moods: moods,
                          size: { width: 800, height: 600 }
                        });
                      }
                    };

                    // Handle right click for context menu
                    const handleContextMenu = (e) => {
                      e.preventDefault();
                      
                      // Get the position relative to the scrollable container
                      const container = e.currentTarget.closest('.flex-1.relative.overflow-auto');
                      const containerRect = container?.getBoundingClientRect();
                      
                      let menuX = e.clientX;
                      let menuY = e.clientY;
                      
                      if (containerRect) {
                        menuX = e.clientX - containerRect.left + container.scrollLeft;
                        menuY = e.clientY - containerRect.top + container.scrollTop;
                      }
                      
                      setContextMenu({
                        x: menuX,
                        y: menuY,
                        fileIndex: index,
                        fileType: file.type,
                        fileName: displayName,
                        file: file
                      });
                    };
                    
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
                        title={displayName}
                        subtitle={getFileSubtitle(file)}
                        position={{ x: 20 + (col * 130), y: 20 + (row * 130) }}
                        moodColor={moods[file.mood]?.color}
                        onDoubleClick={handleDoubleClick}
                        onContextMenu={handleContextMenu}
                      />
                    );
                  })}
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            minWidth: '160px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {contextMenu.fileName}
          </div>
          <button
            onClick={() => handleDeleteFile(contextMenu.fileIndex, contextMenu.fileType, contextMenu.file)}
            disabled={contextMenu.fileType === 'feelings' || contextMenu.fileType === 'song'}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              contextMenu.fileType === 'feelings' || contextMenu.fileType === 'song'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            Move to Trash
          </button>
        </div>
      )}
    </div>
  );
};

export default DiaryExplorer;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDesktop } from '../../contexts/DesktopContext';
import SearchModal from './SearchModal';
import AddFileModal from './AddFileModal';
import MusicControlsModal from './MusicControlsModal';
import HelpModal from './HelpModal';
import Insights from './apps/Insights';
import { 
  FolderOpen, 
  Music, 
  Library, 
  User, 
  Settings, 
  Trash2,
  Menu,
  Moon,
  Sun,
  Activity,
  Bot,
  Monitor
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import { filesAPI, entriesAPI } from '../../services/api';

const DesktopShell = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { openWindow, windows, minimizeWindow, closeWindow } = useDesktop();
  const { theme, toggleTheme, entries } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);
  const [musicControlsOpen, setMusicControlsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  
  const iconColor = user?.settings?.iconColor;

  // Check if any window is maximized
  const hasMaximizedWindow = Object.values(windows).some(w => w.isOpen && w.isMaximized);

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleForceQuit = () => {
    // Close all open windows
    Object.keys(windows).forEach(appId => {
      if (windows[appId]?.isOpen) {
        closeWindow(appId);
      }
    });
    setAppleMenuOpen(false);
  };

  const handleShutdown = () => {
    // Navigate to landing page first, then logout to avoid ProtectedRoute redirecting to /auth
    navigate('/');
    setTimeout(() => {
      logout();
    }, 100);
  };

  const handleAddFile = async (file) => {
    console.log('File added:', file);
    
    // Get today's entry automatically
    const { entries, addFileToEntry, fetchEntries } = useAppStore.getState();
    
    // Refresh entries first to ensure we have the latest data
    const userId = user?.id || user?._id; // Backend returns 'id', not '_id'
    if (userId) {
      await fetchEntries(userId);
    }
    
    // Get updated entries after fetch
    const updatedEntries = useAppStore.getState().entries;
    
    // Find today's entry - use local timezone, not UTC
    const today = new Date();
    // Get local date string (not UTC)
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todayEntry = updatedEntries.find(entry => {
      const entryDate = new Date(entry.date);
      // Get local date string from entry (not UTC)
      const entryDateString = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
      
      console.log('Comparing:', {
        todayDateString,
        entryDateString,
        match: entryDateString === todayDateString
      });
      
      return entryDateString === todayDateString;
    });
    
    console.log('Today\'s entry:', todayEntry);
    console.log('All entries:', updatedEntries);
    console.log('User ID:', userId);
    
    if (todayEntry) {
      try {
        // Use _id field from MongoDB
        const entryId = todayEntry._id || todayEntry.id;
        
        // Create file in the database (Backend now automatically links it to the entry)
        const createdFile = await filesAPI.createFile({
          entryId: entryId,
          fileName: file.fileName || file.name,
          fileType: file.type,
          mood: file.mood || todayEntry.mood,
          metadata: {
            imageUrl: file.imageUrl || file.metadata?.imageUrl || '',
            extension: file.extension || file.metadata?.extension || '',
            author: file.author || file.metadata?.author || '',
            bookUrl: file.bookUrl || file.metadata?.bookUrl || '',
            coverUrl: file.coverUrl || file.metadata?.coverUrl || '',
            videoUrl: file.videoUrl || file.youtubeUrl || file.metadata?.videoUrl || '',
            youtubeUrl: file.youtubeUrl || file.metadata?.youtubeUrl || '',
            websiteUrl: file.websiteUrl || file.metadata?.websiteUrl || '',
            content: file.content || file.metadata?.content || ''
          }
        });
        
        // Update local state
        addFileToEntry(entryId, file);
        
        // Refresh entries to get the updated data from backend
        if (userId) {
          await fetchEntries(userId);
        }
        
        alert('File added successfully!');
      } catch (error) {
        console.error('Error adding file:', error);
        alert('Failed to add file. Please try again.');
      }
    } else {
      alert('No entry found for today. Please create a diary entry first before adding files.');
    }
  };

  const apps = [
    { id: 'diary-explorer', name: 'Diary', icon: <FolderOpen className="w-6 h-6" />, color: 'text-blue-500' },
    { id: 'insights', name: 'Insights', icon: <Activity className="w-6 h-6" />, color: 'text-indigo-500' },
    { id: 'ai-assistant', name: 'Side-B AI', icon: <Bot className="w-6 h-6" />, color: 'text-purple-600' },
    { id: 'music-player', name: 'Player', icon: <Music className="w-6 h-6" />, color: 'text-purple-500' },
    { id: 'music-library', name: 'Library', icon: <Library className="w-6 h-6" />, color: 'text-pink-500' },
    { id: 'profile', name: 'Profile', icon: <User className="w-6 h-6" />, color: 'text-green-500' },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-6 h-6" />, color: 'text-gray-500' },
    { id: 'trash', name: 'Trash', icon: <Trash2 className="w-6 h-6" />, color: 'text-red-500' }
  ];

  const handleMenuClick = (item) => {
    if (item === 'Search') {
      setSearchModalOpen(true);
    } else if (item === 'File') {
      setAddFileModalOpen(true);
    } else if (item === 'Play') {
      setMusicControlsOpen(true);
    } else if (item === 'Help') {
      setHelpModalOpen(true);
    }
  };

  const menuItems = ['File', 'Play', 'Search', 'Help'];

  return (
    <>
      {/* Catalina Menu Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-4 text-sm"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(25px)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.1)',
          color: theme === 'dark' ? '#ffffff' : '#000000'
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Apple Menu Icon */}
          <div className="relative">
            <button 
              onClick={() => setAppleMenuOpen(!appleMenuOpen)}
              className={`flex items-center justify-center hover:bg-white/20 rounded transition-colors ${appleMenuOpen ? 'bg-white/20' : ''}`}
            >
              <Menu className="w-4 h-4 fill-current" />
            </button>
            
            {/* Apple Menu Dropdown */}
            {appleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setAppleMenuOpen(false)}
                />
                <div 
                  className="absolute top-full left-0 mt-1 w-56 rounded-lg overflow-hidden z-50 py-1"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(25px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                >
                  <button
                    onClick={() => {
                      openWindow('profile', 'Profile', <User className="w-4 h-4" />);
                      setAppleMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-1 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    About This Mac
                  </button>
                  <div className="h-px bg-gray-400/20 my-1 mx-3" />
                  <button
                    onClick={() => {
                      openWindow('settings', 'Settings', <Settings className="w-4 h-4" />);
                      setAppleMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-1 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    System Preferences...
                  </button>
                  <div className="h-px bg-gray-400/20 my-1 mx-3" />
                  <button
                    onClick={handleForceQuit}
                    className="w-full text-left px-4 py-1 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    Force Quit...
                  </button>
                  <div className="h-px bg-gray-400/20 my-1 mx-3" />
                  <button
                    onClick={handleShutdown}
                    className="w-full text-left px-4 py-1 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    Shut Down...
                  </button>
                </div>
              </>
            )}
          </div>
          
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => handleMenuClick(item)}
              className="text-sm font-medium hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {item}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="hover:bg-white/20 p-1 rounded">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <span 
            className="text-sm font-medium"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Catalina Dock */}
      <div className={`fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        hasMaximizedWindow ? 'translate-y-32 opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        <div 
          className="px-2 py-2 flex items-end space-x-2"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            height: '68px'
          }}
        >
          {apps.map((app) => {
            const isOpen = windows[app.id]?.isOpen;
            const isMinimized = windows[app.id]?.isMinimized;
            
            return (
              <div key={app.id} className="relative group flex flex-col items-center justify-end h-full">
                <button
                  onClick={() => {
                    if (isOpen && !isMinimized) {
                      minimizeWindow(app.id);
                    } else {
                      openWindow(app.id, app.name, app.icon);
                    }
                  }}
                  className="transition-all duration-200 hover:scale-110 active:scale-95 transform-gpu mb-1"
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                    borderRadius: '12px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  aria-label={app.name}
                >
                  <span 
                    className={!iconColor ? app.color : ''} 
                    style={iconColor ? { color: iconColor } : {}}
                  >
                    {app.icon}
                  </span>
                </button>
                
                {/* Dot indicator for open apps */}
                <div 
                  className={`w-1 h-1 rounded-full bg-black dark:bg-white transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Tooltip */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-xs"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: theme === 'dark' ? '#fff' : '#000',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  {app.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        entries={entries}
      />

      {/* Add File Modal */}
      <AddFileModal
        isOpen={addFileModalOpen}
        onClose={() => setAddFileModalOpen(false)}
        onAddFile={handleAddFile}
        currentDate={(() => {
          const now = new Date();
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        })()}
      />

      {/* Music Controls Modal */}
      <MusicControlsModal
        isOpen={musicControlsOpen}
        onClose={() => setMusicControlsOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </>
  );
};

export default DesktopShell;

import React, { useState } from 'react';
import { useDesktop } from '../../contexts/DesktopContext';
import SearchModal from './SearchModal';
import AddFileModal from './AddFileModal';
import MusicControlsModal from './MusicControlsModal';
import HelpModal from './HelpModal';
import { 
  FolderOpen, 
  Music, 
  Library, 
  User, 
  Settings, 
  Trash2,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import useAppStore from '../../store/appStore';

const DesktopShell = () => {
  const { openWindow, windows, minimizeWindow, closeWindow } = useDesktop();
  const { theme, toggleTheme, user, updateUser, entries } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);
  const [musicControlsOpen, setMusicControlsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

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
    // Navigate to landing page
    window.location.href = '/';
  };

  const handleAddFile = (file) => {
    console.log('File added:', file);
    // This would be handled by the backend in a real app
    // For now, just log it
  };

  const apps = [
    { id: 'diary-explorer', name: 'Diary', icon: <FolderOpen className="w-6 h-6" />, color: 'text-blue-500' },
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
      {/* Aqua Menu Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-8 z-50 flex items-center justify-between px-3"
        style={{
          background: 'linear-gradient(to bottom, rgba(200, 213, 229, 0.95) 0%, rgba(155, 176, 204, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Apple Menu Icon */}
          <div className="relative">
            <button 
              onClick={() => setAppleMenuOpen(!appleMenuOpen)}
              className="flex items-center justify-center hover:bg-white/20 p-1 rounded transition-colors"
              style={{
                color: '#000'
              }}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Apple Menu Dropdown */}
            {appleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setAppleMenuOpen(false)}
                />
                <div 
                  className="absolute top-full left-0 mt-1 w-48 rounded-lg overflow-hidden z-50"
                  style={{
                    background: 'linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%)',
                    border: '1px solid rgba(0,0,0,0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(40px)'
                  }}
                >
                  <button
                    onClick={() => {
                      openWindow('profile', 'Profile', <User className="w-4 h-4" />);
                      setAppleMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                    style={{
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                      color: '#000'
                    }}
                  >
                    About This Mac
                  </button>
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '2px 0' }} />
                  <button
                    onClick={() => {
                      openWindow('settings', 'Settings', <Settings className="w-4 h-4" />);
                      setAppleMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                    style={{
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                      color: '#000'
                    }}
                  >
                    System Preferences...
                  </button>
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '2px 0' }} />
                  <button
                    onClick={handleForceQuit}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                    style={{
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                      color: '#000'
                    }}
                  >
                    Force Quit...
                  </button>
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '2px 0' }} />
                  <button
                    onClick={handleShutdown}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-500 hover:text-white transition-colors"
                    style={{
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                      color: '#000'
                    }}
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
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                color: '#000',
                textShadow: '0 1px 0 rgba(255,255,255,0.5)'
              }}
            >
              {item}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <span 
            className="text-sm font-medium"
            style={{
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
              color: '#000',
              textShadow: '0 1px 0 rgba(255,255,255,0.5)'
            }}
          >
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Aqua Dock */}
      <div className={`fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        hasMaximizedWindow ? 'translate-y-32 opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        <div 
          className="relative px-4 py-3"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.1) 100%)',
            backdropFilter: 'blur(40px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          {/* Brushed metal texture overlay */}
          <div 
            className="absolute inset-0 rounded-[20px] opacity-30 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)',
            }}
          ></div>
          
          <div className="flex items-end space-x-1 relative">
            {apps.map((app) => {
              const isOpen = windows[app.id]?.isOpen;
              const isMinimized = windows[app.id]?.isMinimized;
              
              return (
                <div key={app.id} className="relative group flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (isOpen && !isMinimized) {
                        minimizeWindow(app.id);
                      } else {
                        openWindow(app.id, app.name, app.icon);
                      }
                    }}
                    className="p-3 transition-all duration-200 hover:scale-110 transform-gpu"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
                      borderRadius: '8px',
                      width: '56px',
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label={app.name}
                  >
                    <span className={app.color}>{app.icon}</span>
                  </button>
                  
                  {/* Small arrow indicator for open apps */}
                  {isOpen && (
                    <div 
                      className="absolute -bottom-2 w-1 h-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 0 4px rgba(255,255,255,0.8)'
                      }}
                    />
                  )}
                  
                  {/* Tooltip */}
                  <div 
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-xs font-medium"
                    style={{
                      background: 'rgba(255, 251, 230, 0.95)',
                      color: '#000',
                      border: '1px solid rgba(0,0,0,0.2)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    {app.name}
                  </div>
                </div>
              );
            })}
          </div>
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
        currentDate={new Date().toISOString().split('T')[0]}
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

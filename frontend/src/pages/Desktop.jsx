import React, { useEffect } from 'react';
import { DesktopProvider, useDesktop } from '../contexts/DesktopContext';
import DesktopShell from '../components/desktop/DesktopShell';
import Window from '../components/desktop/Window';
import DesktopIcon from '../components/desktop/DesktopIcon';
import DiaryExplorer from '../components/desktop/apps/DiaryExplorer';
import MusicPlayer from '../components/desktop/apps/MusicPlayer';
import MusicLibrary from '../components/desktop/apps/MusicLibrary';
import Profile from '../components/desktop/apps/Profile';
import Settings from '../components/desktop/apps/Settings';
import Trash from '../components/desktop/apps/Trash';
import FileViewer from '../components/desktop/apps/FileViewer';
import Insights from '../components/desktop/apps/Insights';
import AIAssistant from '../components/desktop/apps/AIAssistant';
import { FolderOpen, Music, Library, User, Settings as SettingsIcon, Trash2, Flame, Calendar, TrendingUp, FileText, Activity, Bot } from 'lucide-react';
import useAppStore from '../store/appStore';

const DesktopContent = () => {
  const { openWindow, maximizeWindow, windows } = useDesktop();
  const { entries, stats } = useAppStore();

  // Auto-open Diary Explorer in fullscreen on mount
  useEffect(() => {
    // Open window already maximized
    openWindow('diary-explorer', {
      isMaximized: true
    });
  }, []); // Empty dependency array - only run once on mount

  const handleStatIconClick = (stat) => {
    // Could open a detailed stats window in the future
    alert(`${stat.title}: ${stat.value}`);
  };

  return (
    <>
      {/* Desktop Icons - Stats */}
      <DesktopIcon
        icon={<Flame className="w-8 h-8" style={{ color: '#ff6b35' }} />}
        title={`${stats?.streak || 0} Days`}
        description="Current Streak"
        position={{ x: 20, y: 20 }}
        onDoubleClick={() => handleStatIconClick({ title: 'Streak', value: stats?.streak || 0 })}
      />
      <DesktopIcon
        icon={<Music className="w-8 h-8" style={{ color: '#4580d4' }} />}
        title={`${stats?.songs_logged || 0} Songs`}
        description="Total Logged"
        position={{ x: 20, y: 140 }}
        onDoubleClick={() => handleStatIconClick({ title: 'Songs Logged', value: stats?.songs_logged || 0 })}
      />
      <DesktopIcon
        icon={<Calendar className="w-8 h-8" style={{ color: '#6EC9B1' }} />}
        title={`${stats?.this_week || 0} Entries`}
        description="This Week"
        position={{ x: 20, y: 260 }}
        onDoubleClick={() => handleStatIconClick({ title: 'This Week', value: stats?.this_week || 0 })}
      />
      <DesktopIcon
        icon={<TrendingUp className="w-8 h-8" style={{ color: '#F6DD73' }} />}
        title={`${stats?.this_month || 0} Entries`}
        description="This Month"
        position={{ x: 20, y: 380 }}
        onDoubleClick={() => handleStatIconClick({ title: 'This Month', value: stats?.this_month || 0 })}
      />

      {/* AI Assistant Icon */}
      <DesktopIcon
        icon={<Bot className="w-8 h-8" style={{ color: '#8b5cf6' }} />}
        title="Side-B AI"
        description="Assistant"
        position={{ x: 120, y: 20 }}
        onDoubleClick={() => openWindow('ai-assistant')}
      />

      {/* Diary Explorer Window */}
      <Window
        appId="diary-explorer"
        title="Diary Explorer"
        icon={<FolderOpen className="w-4 h-4" />}
        minWidth={600}
        minHeight={400}
      >
        <DiaryExplorer />
      </Window>

      {/* Insights Window */}
      <Window
        appId="insights"
        title="Insights"
        icon={<Activity className="w-4 h-4" />}
        minWidth={800}
        minHeight={600}
      >
        <Insights />
      </Window>

      {/* AI Assistant Window */}
      <Window
        appId="ai-assistant"
        title="Side-B Assistant"
        icon={<Bot className="w-4 h-4" />}
        minWidth={400}
        minHeight={600}
      >
        <AIAssistant />
      </Window>

      {/* Music Player Window */}
      <Window
        appId="music-player"
        title="Music Player"
        icon={<Music className="w-4 h-4" />}
        minWidth={400}
        minHeight={500}
      >
        <MusicPlayer />
      </Window>

      {/* Music Library Window */}
      <Window
        appId="music-library"
        title="Music Library"
        icon={<Library className="w-4 h-4" />}
        minWidth={600}
        minHeight={400}
      >
        <MusicLibrary />
      </Window>

      {/* Profile Window */}
      <Window
        appId="profile"
        title="Profile"
        icon={<User className="w-4 h-4" />}
        minWidth={400}
        minHeight={500}
      >
        <Profile />
      </Window>

      {/* Settings Window */}
      <Window
        appId="settings"
        title="Settings"
        icon={<SettingsIcon className="w-4 h-4" />}
        minWidth={500}
        minHeight={500}
      >
        <Settings />
      </Window>

      {/* Trash Window */}
      <Window
        appId="trash"
        title="Trash"
        icon={<Trash2 className="w-4 h-4" />}
        minWidth={500}
        minHeight={400}
      >
        <Trash />
      </Window>

      {/* Dynamic File Viewer Windows */}
      {Object.entries(windows).map(([appId, window]) => {
        if (appId.startsWith('file-viewer-')) {
          return (
            <Window
              key={appId}
              appId={appId}
              title={window.title || 'File Viewer'}
              icon={<FileText className="w-4 h-4" />}
              minWidth={400}
              minHeight={400}
            >
              <FileViewer 
                file={window.file} 
                entry={window.entry}
                moods={window.moods}
              />
            </Window>
          );
        }
        return null;
      })}
    </>
  );
};

const Desktop = () => {
  return (
    <DesktopProvider>
      <div className="h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 overflow-hidden relative">
        {/* Aqua texture overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)',
          backgroundSize: '100% 2px'
        }}></div>
        
        {/* Desktop Shell (MenuBar + Dock) */}
        <DesktopShell />

        {/* Windows Container */}
        <div className="absolute top-8 bottom-0 left-0 right-0">
          <DesktopContent />
        </div>
      </div>
    </DesktopProvider>
  );
};

export default Desktop;

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
import { FolderOpen, Music, Library, User, Settings as SettingsIcon, Trash2, Flame, Calendar, TrendingUp } from 'lucide-react';
import useAppStore from '../store/appStore';

const DesktopContent = () => {
  const { openWindow, maximizeWindow, windows } = useDesktop();
  const { entries } = useAppStore();

  // Auto-open Diary Explorer in fullscreen on mount
  useEffect(() => {
    // Open window already maximized
    openWindow('diary-explorer', {
      isMaximized: true
    });
  }, []); // Empty dependency array - only run once on mount

  // Calculate stats for desktop icons
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      entryDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      if (entryDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const calculateThisWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return entries.filter(entry => new Date(entry.date) >= startOfWeek).length;
  };

  const calculateThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return entries.filter(entry => new Date(entry.date) >= startOfMonth).length;
  };

  const handleStatIconClick = (stat) => {
    // Could open a detailed stats window in the future
    alert(`${stat.title}: ${stat.value}`);
  };

  return (
    <>
      {/* Desktop Icons - Stats */}
      <DesktopIcon
        icon={<Flame className="w-8 h-8" style={{ color: '#ff6b35' }} />}
        title={`${calculateStreak()} Days`}
        description="Current Streak"
        position={{ x: 20, y: 20 }}
        onDoubleClick={() => handleStatIconClick({ title: 'Streak', value: calculateStreak() })}
      />
      <DesktopIcon
        icon={<Music className="w-8 h-8" style={{ color: '#4580d4' }} />}
        title={`${entries.length} Songs`}
        description="Total Logged"
        position={{ x: 20, y: 140 }}
        onDoubleClick={() => handleStatIconClick({ title: 'Songs Logged', value: entries.length })}
      />
      <DesktopIcon
        icon={<Calendar className="w-8 h-8" style={{ color: '#6EC9B1' }} />}
        title={`${calculateThisWeek()} Entries`}
        description="This Week"
        position={{ x: 20, y: 260 }}
        onDoubleClick={() => handleStatIconClick({ title: 'This Week', value: calculateThisWeek() })}
      />
      <DesktopIcon
        icon={<TrendingUp className="w-8 h-8" style={{ color: '#F6DD73' }} />}
        title={`${calculateThisMonth()} Entries`}
        description="This Month"
        position={{ x: 20, y: 380 }}
        onDoubleClick={() => handleStatIconClick({ title: 'This Month', value: calculateThisMonth() })}
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

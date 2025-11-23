import React, { createContext, useContext, useState, useCallback } from 'react';

const DesktopContext = createContext();

export const useDesktop = () => {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error('useDesktop must be used within DesktopProvider');
  }
  return context;
};

export const DesktopProvider = ({ children }) => {
  const [windows, setWindows] = useState({});
  const [focusedWindow, setFocusedWindow] = useState(null);
  const [wallpaper, setWallpaper] = useState('default');

  // Window management
  const openWindow = useCallback((appId, initialProps = {}) => {
    setWindows(prev => ({
      ...prev,
      [appId]: {
        id: appId,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: initialProps.position || { x: 100 + Object.keys(prev).length * 30, y: 50 + Object.keys(prev).length * 30 },
        size: initialProps.size || { width: 800, height: 600 },
        zIndex: Math.max(...Object.values(prev).map(w => w.zIndex || 0), 0) + 1,
        ...initialProps
      }
    }));
    setFocusedWindow(appId);
  }, []);

  const closeWindow = useCallback((appId) => {
    setWindows(prev => {
      const newWindows = { ...prev };
      delete newWindows[appId];
      return newWindows;
    });
    if (focusedWindow === appId) {
      setFocusedWindow(null);
    }
  }, [focusedWindow]);

  const minimizeWindow = useCallback((appId) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { 
        ...prev[appId], 
        isMinimized: true,
        isMaximized: false  // Reset maximize state when minimizing
      }
    }));
  }, []);

  const maximizeWindow = useCallback((appId) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { 
        ...prev[appId], 
        isMaximized: !prev[appId].isMaximized 
      }
    }));
  }, []);

  const focusWindow = useCallback((appId) => {
    setWindows(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMinimized: false,
        zIndex: Math.max(...Object.values(prev).map(w => w.zIndex || 0), 0) + 1
      }
    }));
    setFocusedWindow(appId);
  }, []);

  const updateWindowPosition = useCallback((appId, position) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], position }
    }));
  }, []);

  const updateWindowSize = useCallback((appId, size) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], size }
    }));
  }, []);

  const value = {
    windows,
    focusedWindow,
    wallpaper,
    setWallpaper,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize
  };

  return (
    <DesktopContext.Provider value={value}>
      {children}
    </DesktopContext.Provider>
  );
};

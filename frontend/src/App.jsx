import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store/appStore';

// Pages
import LandingPage from './pages/LandingPage';
import DiaryInputPage from './pages/DiaryInputPage';
import SongSelectorPage from './pages/SongSelectorPage';
import Desktop from './pages/Desktop';

function App() {
  const { theme } = useAppStore();

  // Apply theme to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/diary-input" element={<DiaryInputPage />} />
          <Route path="/song-selector" element={<SongSelectorPage />} />
          <Route path="/desktop" element={<Desktop />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

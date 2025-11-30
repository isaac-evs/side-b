import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import useAppStore from './store/appStore';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DiaryInputPage from './pages/DiaryInputPage';
import SongSelectorPage from './pages/SongSelectorPage';
import Desktop from './pages/Desktop';

// Protected Route Component - only for Desktop
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-2xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

function AppContent() {
  const { theme } = useAppStore();
  const { user, isAuthenticated } = useAuth();

  // Apply theme to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch entries when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('Fetching entries for user:', user.id);
      const { fetchEntries } = useAppStore.getState();
      fetchEntries(user.id);
    } else if (isAuthenticated && !user?.id) {
      console.error('User is authenticated but user.id is missing:', user);
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Routes>
        {/* Public routes - accessible without auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/diary-input" element={<DiaryInputPage />} />
        <Route path="/song-selector" element={<SongSelectorPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected route - requires authentication */}
        <Route 
          path="/desktop" 
          element={
            <ProtectedRoute>
              <Desktop />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { ThemeToggle } from '../components/shared';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, login } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        navigate('/diary-input');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const handleLogin = () => {
    login('journaler');
    navigate('/diary-input');
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 font-sans">
      {/* Main Landing Section */}
      <div className="h-screen flex flex-col items-center justify-center px-4 relative" style={{ paddingBottom: '15vh' }}>
        {/* Brand Name */}
        <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-mea-culpa text-gray-800 dark:text-white mb-8" style={{ fontFamily: '"Mea Culpa", cursive' }}>
          SIDE-B
        </h1>

        {/* Motto in Glassmorphism Button */}
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 text-gray-800 dark:text-white rounded-full px-8 py-3 font-light text-lg tracking-wide shadow-lg">
          Your day, one Song
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-20 animate-bounce">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Second Section - makes page scrollable */}
      <div className="h-screen flex items-center justify-center">
        <div className="text-center opacity-0">
          {/* Hidden spacer to enable scrolling */}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-8 right-8 flex items-center space-x-6">
        {/* Social Link */}
        <a
          href="#"
          className="p-2 hover:scale-110 transition-all"
          aria-label="Social"
        >
          <svg
            className="w-12 h-12 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
          </svg>
        </a>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="p-2 hover:scale-110 transition-all"
          aria-label="Login"
        >
          <svg
            className="w-12 h-12 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </button>

        {/* Theme Toggle */}
        <div className="hover:scale-110 transition-all">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

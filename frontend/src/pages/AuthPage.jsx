import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useAppStore from '../store/appStore';
import blueShape from '../assets/blue.svg';
import pinkShape from '../assets/pink.svg';
import greenShape from '../assets/green.svg';
import yellowShape from '../assets/yellow.svg';
import orangeShape from '../assets/orange.svg';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { currentEntry, addEntry, resetCurrentEntry } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginData);
    setLoading(false);

    if (result.success) {
      // Check if there's a pending entry to save
      if (currentEntry.text && currentEntry.mood && currentEntry.song) {
        try {
          await addEntry(currentEntry, result.user.id);
          resetCurrentEntry();
          navigate('/desktop');
        } catch (error) {
          console.error('Error saving entry after login:', error);
          navigate('/desktop');
        }
      } else {
        // No pending entry, go to desktop
        navigate('/desktop');
      }
    } else {
      setError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      // Check if there's a pending entry to save
      if (currentEntry.text && currentEntry.mood && currentEntry.song) {
        try {
          await addEntry(currentEntry, result.user.id);
          resetCurrentEntry();
          navigate('/desktop');
        } catch (error) {
          console.error('Error saving entry after registration:', error);
          navigate('/desktop');
        }
      } else {
        // No pending entry, go to desktop
        navigate('/desktop');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 relative overflow-hidden flex items-center justify-center p-4">
      {/* Floating Background Shapes - Framer Motion Animations */}
      {/* Blue - top right area */}
      <motion.img 
        src={blueShape} 
        alt="" 
        className="absolute opacity-80" 
        style={{ 
          top: '-200px',
          right: '-50px',
          width: '650px', 
          height: '650px',
        }}
        animate={{
          x: [0, -150, -300, -150, 0],
          y: [0, 150, 0, -150, 0],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Pink - bottom left area */}
      <motion.img 
        src={pinkShape} 
        alt="" 
        className="absolute opacity-70" 
        style={{ 
          bottom: '-150px',
          left: '20px',
          width: '800px', 
          height: '800px',
        }}
        animate={{
          x: [0, 150, 300, 150, 0],
          y: [0, -100, 0, 100, 0],
          rotate: [0, -90, -180, -270, -360],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Green - upper left */}
      <motion.img 
        src={greenShape} 
        alt="" 
        className="absolute opacity-75" 
        style={{ 
          top: '-450px',
          left: '-200px',
          width: '900px', 
          height: '900px',
        }}
        animate={{
          x: [0, 100, 200, 100, 0],
          y: [0, 150, 300, 150, 0],
          rotate: [0, 60, 120, 180, 240, 300, 360],
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Yellow - lower right */}
      <motion.img 
        src={yellowShape} 
        alt="" 
        className="absolute opacity-80" 
        style={{ 
          bottom: '0px',
          right: '100px',
          width: '520px', 
          height: '520px',
        }}
        animate={{
          x: [0, -120, -240, -120, 0],
          y: [0, -80, -160, -80, 0],
          rotate: [0, -45, -90, -135, -180],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Orange - center-ish */}
      <motion.img 
        src={orangeShape} 
        alt="" 
        className="absolute opacity-60" 
        style={{ 
          top: '150px',
          left: '-100px',
          width: '320px', 
          height: '320px',
        }}
        animate={{
          x: [0, 180, 360, 180, 0],
          y: [0, 50, 100, 50, 0],
          rotate: [0, 180, 360, 180, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <h1 className="text-6xl font-mea-culpa text-center text-gray-800 dark:text-white mb-8" style={{ fontFamily: '"Mea Culpa", cursive' }}>
          SIDE-B
        </h1>

        {/* Auth Card */}
        <div className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-xl p-8">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-white/20 backdrop-blur-md p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 transition-all ${
                isLogin
                  ? 'bg-white/40 shadow-sm text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 transition-all ${
                !isLogin
                  ? 'bg-white/40 shadow-sm text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/10'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/30 backdrop-blur-md text-gray-800 dark:text-white placeholder-gray-500 outline-none focus:bg-white/40 transition-all rounded-none"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/30 backdrop-blur-md text-gray-800 dark:text-white placeholder-gray-500 outline-none focus:bg-white/40 transition-all rounded-none"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white/40 backdrop-blur-md text-gray-900 rounded-none font-medium hover:bg-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/30 backdrop-blur-md text-gray-800 dark:text-white placeholder-gray-500 outline-none focus:bg-white/40 transition-all rounded-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/30 backdrop-blur-md text-gray-800 dark:text-white placeholder-gray-500 outline-none focus:bg-white/40 transition-all rounded-none"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/30 backdrop-blur-md text-gray-800 dark:text-white placeholder-gray-500 outline-none focus:bg-white/40 transition-all rounded-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/30 backdrop-blur-md text-gray-800 dark:text-white placeholder-gray-500 outline-none focus:bg-white/40 transition-all rounded-none"
                  placeholder="Choose a password"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white/40 backdrop-blur-md text-gray-900 rounded-none font-medium hover:bg-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Footer */}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

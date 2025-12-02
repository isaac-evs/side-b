import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useAppStore from '../store/appStore';
import { MoodButton } from '../components/shared';
import { moodOptions } from '../data/mockData';
import blueShape from '../assets/blue.svg';
import pinkShape from '../assets/pink.svg';
import greenShape from '../assets/green.svg';
import yellowShape from '../assets/yellow.svg';
import orangeShape from '../assets/orange.svg';

const DiaryInputPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setEntryText, setEntryMood, currentEntry, entries, fetchEntries } = useAppStore();
  const [text, setText] = useState(currentEntry.text || '');
  const [selectedMood, setSelectedMood] = useState(currentEntry.mood || null);
  const [checking, setChecking] = useState(true);

  const MAX_CHARS = 500;

  // Check if user already has an entry today
  useEffect(() => {
    const checkTodayEntry = async () => {
      if (isAuthenticated && user) {
        // Ensure entries are loaded
        if (entries.length === 0) {
          await fetchEntries(user.id);
        }
        
        // Check if there's an entry from today
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = entries.find(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate === today;
        });

        if (todayEntry) {
          // User already created an entry today, redirect to desktop
          alert('You have already created an entry today! Check it out in the desktop.');
          navigate('/desktop');
          return;
        }
      }
      setChecking(false);
    };

    checkTodayEntry();
  }, [isAuthenticated, user, entries, fetchEntries, navigate]);

  const handleSubmit = () => {
    if (!text.trim() || !selectedMood) {
      alert('Please write your feelings and select a mood!');
      return;
    }

    // Save the entry to state
    setEntryText(text);
    setEntryMood(selectedMood);
    
    // Navigate to song selector regardless of auth status
    navigate('/song-selector');
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleTextChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setText(e.target.value);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Show loading while checking for today's entry
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-2xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 p-8 relative overflow-hidden">
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

      {/* Back Arrow - Top Center */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-8 left-1/2 transform -translate-x-1/2 p-3 hover:scale-110 transition-all z-50"
        aria-label="Go back"
      >
        <svg className="w-10 h-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Current Date - Top Right */}
      <div className="fixed top-8 right-8 text-black-700 dark:text-gray-300 text-4xl z-50 tracking-widest opacity-80">
        {getCurrentDate()}
      </div>

      <div className="max-w-4xl mx-auto pt-24 space-y-8 relative z-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-6xl text-gray-800 dark:text-white" 
            style={{ 
              fontFamily: '"MedievalSharp", cursive',
              WebkitTextStroke: '5px white',
              paintOrder: 'stroke fill'
            }}
          >
            How are you feeling?
          </h1>
        </div>

        {/* Text Area - Glassmorphism */}
        <div className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.3)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Write your thoughts..."
            className="w-full h-96 p-8 pb-20 text-lg bg-transparent text-black placeholder-gray-500 outline-none resize-none"
          />
          {/* Character Counter */}
          <div className="absolute bottom-4 left-6 text-sm text-gray-600 font-medium">
            {text.length}/{MAX_CHARS}
          </div>
          
          {/* Submit Button - Inside text box bottom right */}
          <button
            onClick={handleSubmit}
            className="absolute bottom-4 right-6 p-4 bg-white/30 backdrop-blur-md border border-white/60 hover:bg-white/20 shadow-lg transition-all duration-300 hover:scale-105"
            aria-label="Submit entry"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

        {/* Mood Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
            Select Your Mood
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moodOptions.map((mood) => {
              const moodColors = {
                joy: '#F6DD73',
                calm: '#6EC9B1',
                sad: '#5386FE',
                stress: '#FE5344'
              };
              return (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`
                    px-6 py-4 border-2 transition-all duration-300
                    ${selectedMood === mood.value 
                      ? 'border-gray-800 dark:border-white scale-105' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-500'
                    }
                    bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: moodColors[mood.value] }}
                    ></div>
                    <span className="text-lg font-medium text-black dark:text-white">
                      {mood.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryInputPage;

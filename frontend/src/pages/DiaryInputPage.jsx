import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { MoodButton } from '../components/shared';
import { moodOptions } from '../data/mockData';

const DiaryInputPage = () => {
  const navigate = useNavigate();
  const { setEntryText, setEntryMood, currentEntry } = useAppStore();
  const [text, setText] = useState(currentEntry.text || '');
  const [selectedMood, setSelectedMood] = useState(currentEntry.mood || null);

  const MAX_CHARS = 500;

  const handleSubmit = () => {
    if (!text.trim() || !selectedMood) {
      alert('Please write your feelings and select a mood!');
      return;
    }

    setEntryText(text);
    setEntryMood(selectedMood);
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
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 p-8">
      {/* Back Arrow - Top Center */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-8 left-1/2 transform -translate-x-1/2 p-3 hover:scale-110 transition-all z-10"
        aria-label="Go back"
      >
        <svg className="w-10 h-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Current Date - Top Right */}
      <div className="fixed top-8 right-8 text-gray-700 dark:text-gray-300 text-lg font-medium z-10">
        {getCurrentDate()}
      </div>

      <div className="max-w-4xl mx-auto pt-24 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl text-gray-800 dark:text-white" style={{ fontFamily: '"MedievalSharp", cursive' }}>
            How are you feeling?
          </h1>
        </div>

        {/* Text Area - Glassmorphism */}
        <div className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/60 dark:border-gray-700/60 shadow-2xl">
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
            className="absolute bottom-4 right-6 p-4 bg-white/50 backdrop-blur-md border border-white/60 hover:bg-white/70 shadow-lg transition-all duration-300 hover:scale-105"
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

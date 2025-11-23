import React from 'react';

export const SongCard = ({ song, onSelect, isSelected }) => {
  return (
    <div
      onClick={() => onSelect(song)}
      className={`
        cursor-pointer rounded-lg overflow-hidden shadow-lg transition-all duration-300 
        hover:scale-105 hover:shadow-2xl
        ${isSelected ? 'ring-4 ring-blue-500 scale-105' : ''}
        bg-white dark:bg-gray-800
      `}
    >
      <img
        src={song.albumArt}
        alt={song.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 truncate">
          {song.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {song.artist}
        </p>
        <div className="mt-2">
          <span
            className={`
              inline-block px-2 py-1 text-xs rounded-full
              ${song.mood === 'joy' ? 'bg-mood-joy text-gray-800' : ''}
              ${song.mood === 'calm' ? 'bg-mood-calm text-white' : ''}
              ${song.mood === 'sad' ? 'bg-mood-sad text-white' : ''}
              ${song.mood === 'stress' ? 'bg-mood-stress text-white' : ''}
            `}
          >
            {song.mood}
          </span>
        </div>
      </div>
    </div>
  );
};

export const FileIcon = ({ file, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'text':
        return '📄';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      default:
        return '📁';
    }
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <div className="flex flex-col items-center space-y-2">
        <span className="text-4xl">{getIcon(file.type)}</span>
        <span className="text-sm text-gray-700 dark:text-gray-300 text-center break-all">
          {file.name}
        </span>
      </div>
    </div>
  );
};

export const MoodButton = ({ mood, isSelected, onClick }) => {
  const getMoodColor = (moodValue) => {
    switch (moodValue) {
      case 'joy':
        return 'bg-mood-joy hover:bg-yellow-400';
      case 'calm':
        return 'bg-mood-calm hover:bg-green-500';
      case 'sad':
        return 'bg-mood-sad hover:bg-blue-500';
      case 'stress':
        return 'bg-mood-stress hover:bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300
        ${getMoodColor(mood.value)}
        ${isSelected ? 'ring-4 ring-offset-2 ring-gray-800 dark:ring-white scale-110' : 'scale-100'}
        hover:scale-105 shadow-lg
        text-white
      `}
    >
      <span className="text-2xl mr-2">{mood.emoji}</span>
      {mood.label}
    </button>
  );
};

export const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-4 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ) : (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

export const IconButton = ({ icon, onClick, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};

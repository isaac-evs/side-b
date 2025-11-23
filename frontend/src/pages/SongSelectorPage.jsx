import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { getSongsByMood } from '../data/mockData';

// Icon Components
const QuaverIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);

const MinusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const VolumeSpeakerIcon = ({ volume, className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.54 8.46C16.4774 9.39764 17.0042 10.6695 17.0042 11.995C17.0042 13.3205 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: volume >= 0.3 ? 1 : 0.2 }} />
    <path d="M19.07 4.93C20.9446 6.80547 21.9979 9.34807 21.9979 11.995C21.9979 14.6419 20.9446 17.1845 19.07 19.06" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: volume >= 0.7 ? 1 : 0.2 }} />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ShuffleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="20" x2="21" y2="3"></line>
    <polyline points="21 16 21 21 16 21"></polyline>
    <line x1="15" y1="15" x2="21" y2="21"></line>
    <line x1="4" y1="4" x2="9" y2="9"></line>
  </svg>
);

const SongSelectorPage = () => {
  const navigate = useNavigate();
  const { currentEntry, setEntrySong, addEntry, resetCurrentEntry } = useAppStore();
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedSong, setSelectedSong] = useState(null);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (!currentEntry.mood) {
      navigate('/diary-input');
      return;
    }

    // Get all songs based on the selected mood
    const moodSongs = getSongsByMood(currentEntry.mood);
    setSongs(moodSongs);
  }, [currentEntry.mood, navigate]);

  const handleShuffle = () => {
    // Shuffle the current songs array
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setSongs(shuffled);
    // Stop current playback when shuffling
    setIsPlaying(false);
    setCurrentSongIndex(null);
  };

  useEffect(() => {
    // Since we're not loading actual audio files, we just track the playing state
    // In a real app, this would handle actual audio playback
    // const audio = audioRef.current;
    // if (isPlaying && currentSongIndex !== null) {
    //   audio.play().catch((error) => {
    //     if (error.name !== 'AbortError') {
    //       console.error('Audio playback error:', error);
    //     }
    //   });
    // } else {
    //   audio.pause();
    // }
  }, [isPlaying, currentSongIndex]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleSongEnd = () => playNextSong();
    audio.addEventListener("ended", handleSongEnd);
    return () => audio.removeEventListener("ended", handleSongEnd);
  }, [currentSongIndex, songs.length]);

  const playSong = (index) => {
    const song = songs[index];
    if (!song) return;
    
    // Since we don't have actual audio URLs, we'll just simulate playback
    // In a real app, you would load the actual audio file here
    setCurrentSongIndex(index);
    setIsPlaying(true);
    
    // Don't actually try to load audio since we don't have real audio files
    // audioRef.current.src = song.albumArt; // This was causing the error
  };

  const pauseSong = () => setIsPlaying(false);

  const playNextSong = () => {
    if (songs.length === 0) return;
    const nextIndex = (currentSongIndex + 1) % songs.length;
    playSong(nextIndex);
  };

  const handleSongClick = (index) => {
    if (index === currentSongIndex) {
      isPlaying ? pauseSong() : playSong(index);
    } else {
      playSong(index);
    }
  };

  const handleVolumeChange = (direction) => {
    setVolume((v) => Math.max(0, Math.min(1, v + (direction === "up" ? 0.1 : -0.1))));
  };

  const handleSelectSong = (song, index) => {
    setSelectedSong(song);
    handleSongClick(index);
  };

  const handleSubmit = async () => {
    if (!selectedSong) {
      alert('Please select a song by clicking on it!');
      return;
    }

    try {
      // Stop audio playback before navigating
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
      setCurrentSongIndex(null);

      // Create the entry with all required data
      const entryData = {
        text: currentEntry.text,
        mood: currentEntry.mood,
        song: selectedSong,
      };

      console.log('Creating entry:', entryData); // Debug log

      // Add entry to store
      addEntry(entryData);
      
      // Navigate to desktop FIRST, then reset
      navigate('/desktop', { replace: true });
      
      // Reset after a small delay to allow navigation
      setTimeout(() => {
        resetCurrentEntry();
      }, 100);

    } catch (error) {
      console.error('Error creating entry:', error);
      alert('There was an error creating your entry. Please try again.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const currentSongName = currentSongIndex !== null ? songs[currentSongIndex]?.title : "";

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'joy': return '#FFD93D';
      case 'calm': return '#6BCB77';
      case 'sad': return '#4D96FF';
      case 'stress': return '#FF6B6B';
      default: return '#e8f0e7';
    }
  };

  const bgColor = getMoodColor(currentEntry.mood);

  return (
    <div 
      className="min-h-screen p-4 relative transition-colors duration-500"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: `linear-gradient(135deg, ${bgColor}dd 0%, ${bgColor}99 100%)`
      }}
    >
      {/* Header with current song and volume controls */}
      <header className="fixed top-6 left-6 z-10 flex items-center w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-3xl shadow-lg">
        <QuaverIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3 flex-shrink-0" />
        <h1 className="text-xl font-bold truncate pr-4 text-gray-800 dark:text-white">
          {currentSongName || "Pick a song"}
        </h1>
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={handleShuffle}
            className="p-2 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors"
            title="Shuffle songs"
          >
            <ShuffleIcon className="w-5 h-5 text-white" />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
          <button
            onClick={() => handleVolumeChange("down")}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <MinusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <VolumeSpeakerIcon volume={volume} className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <button
            onClick={() => handleVolumeChange("up")}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Main content - song grid */}
      <div className="flex items-center justify-center w-full min-h-screen pt-24 pb-24">
        <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-5xl">
          {songs.map((song, index) => (
            <div
              key={song.id}
              onClick={() => handleSelectSong(song, index)}
              className="relative w-full aspect-square cursor-pointer group"
            >
              <div
                className={`relative w-full h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden transition-all duration-300 transform group-hover:scale-105 ${
                  currentSongIndex === index && isPlaying 
                    ? "ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50 scale-105" 
                    : selectedSong?.id === song.id
                    ? "ring-4 ring-green-500"
                    : ""
                }`}
              >
                <img
                  src={song.albumArt}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Selected indicator */}
                {selectedSong?.id === song.id && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Playing indicator */}
                {currentSongIndex === index && isPlaying && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="flex space-x-1">
                      <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Song info tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div className="font-bold">{song.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{song.artist}</div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white dark:border-t-gray-800"></div>
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Footer with action buttons */}
      <footer className="fixed bottom-6 right-6 z-10 flex flex-row space-x-4">
        <button
          onClick={() => navigate('/diary-input')}
          className="flex items-center space-x-2 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors shadow-lg"
        >
          <span className="font-bold text-sm text-gray-800 dark:text-white">← Back</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedSong}
          className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all shadow-lg ${
            selectedSong
              ? "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          <CheckIcon className="w-5 h-5" />
          <span className="font-bold text-sm">Confirm Selection</span>
        </button>
      </footer>
    </div>
  );
};

export default SongSelectorPage;

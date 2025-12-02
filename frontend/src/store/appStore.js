import { create } from 'zustand';
import { entriesAPI } from '../services/api';

const useAppStore = create((set, get) => ({
  // Theme
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  // Current entry being created
  currentEntry: {
    text: '',
    mood: null,
    song: null,
    date: null,
  },
  setEntryText: (text) => set((state) => ({ 
    currentEntry: { ...state.currentEntry, text } 
  })),
  setEntryMood: (mood) => set((state) => ({ 
    currentEntry: { ...state.currentEntry, mood } 
  })),
  setEntrySong: (song) => set((state) => ({ 
    currentEntry: { ...state.currentEntry, song } 
  })),
  resetCurrentEntry: () => set({ 
    currentEntry: { text: '', mood: null, song: null, date: null } 
  }),

  // Diary entries
  entries: [],
  entriesLoading: false,
  entriesError: null,
  
  // Fetch entries from API
  fetchEntries: async (userId) => {
    set({ entriesLoading: true, entriesError: null });
    try {
      const entries = await entriesAPI.getAllEntries(userId);
      set({ entries, entriesLoading: false });
    } catch (error) {
      set({ entriesError: error.message, entriesLoading: false });
      console.error('Failed to fetch entries:', error);
    }
  },

  // Add entry via API
  addEntry: async (entry, userId) => {
    try {
      const entryData = {
        userId,
        date: new Date().toISOString(),
        text: entry.text,
        mood: entry.mood,
        song: entry.song ? {
          _id: entry.song.id || entry.song._id,
          title: entry.song.title,
          artist: entry.song.artist,
          album: entry.song.album || '',
          mood: entry.song.mood,
          coverUrl: entry.song.coverUrl || entry.song.albumArt || '',
          previewUrl: entry.song.previewUrl || '',
          spotifyUri: entry.song.spotifyUri || '',
          duration: entry.song.duration || 180, // Default 3 minutes if not provided
          createdAt: entry.song.createdAt || new Date().toISOString(),
        } : null,
        files: [],
      };
      
      const newEntry = await entriesAPI.createEntry(entryData);
      set((state) => ({ entries: [newEntry, ...state.entries] }));
      return newEntry;
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error;
    }
  },

  // Delete entry via API
  deleteEntry: async (entryId) => {
    try {
      await entriesAPI.deleteEntry(entryId);
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== entryId),
      }));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  },

  // Add file to entry (local state, would need API call to persist)
  addFileToEntry: (entryId, file) => set((state) => ({
    entries: state.entries.map((entry) =>
      (entry.id === entryId || entry._id === entryId)
        ? { ...entry, files: [...(entry.files || []), file] }
        : entry
    ),
  })),

  // Selected entry in explorer
  selectedEntryId: null,
  setSelectedEntry: (id) => set({ selectedEntryId: id }),

  // Stats (calculated from entries)
  getStats: () => {
    const entries = get().entries;
    const totalEntries = entries.length;
    const totalFiles = entries.reduce((acc, entry) => acc + (entry.files?.length || 0), 0);
    
    // Calculate streak
    let currentStreak = 0;
    if (entries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sortedDates = [...new Set(entries.map(e => new Date(e.date).toISOString().split('T')[0]))].sort().reverse();
      
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
    }

    const totalDaysActive = new Set(entries.map(e => new Date(e.date).toISOString().split('T')[0])).size;

    return {
      currentStreak,
      totalDaysActive,
      totalEntries,
      totalFiles,
    };
  },
}));

export default useAppStore;

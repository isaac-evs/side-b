import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // User
      user: null,
      isLoggedIn: false,
      login: (username) => set({ user: { username }, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
      updateUser: (updates) => set((state) => ({ 
        user: { ...state.user, ...updates } 
      })),

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
      addEntry: (entry) => set((state) => {
        const newEntry = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          text: entry.text,
          mood: entry.mood,
          song: entry.song,
          files: [],
        };
        return { entries: [newEntry, ...state.entries] };
      }),
      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      })),
      addFileToEntry: (entryId, file) => set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === entryId
            ? { ...entry, files: [...entry.files, file] }
            : entry
        ),
      })),

      // Selected entry in explorer
      selectedEntryId: null,
      setSelectedEntry: (id) => set({ selectedEntryId: id }),

      // Stats
      getStats: () => {
        const entries = get().entries;
        const totalEntries = entries.length;
        const totalFiles = entries.reduce((acc, entry) => acc + (entry.files?.length || 0), 0);
        
        // Calculate streak
        let currentStreak = 0;
        if (entries.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
          
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

        const totalDaysActive = new Set(entries.map(e => e.date)).size;

        return {
          currentStreak,
          totalDaysActive,
          totalEntries,
          totalFiles,
        };
      },
    }),
    {
      name: 'side-b-storage',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        entries: state.entries,
      }),
    }
  )
);

export default useAppStore;

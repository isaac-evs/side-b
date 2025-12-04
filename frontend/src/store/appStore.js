import { create } from 'zustand';
import { entriesAPI, filesAPI, usersAPI } from '../services/api';

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

  // Trash items
  trashedFiles: [],
  
  // Stats
  stats: {
    streak: 0,
    songs_logged: 0,
    this_month: 0,
    this_week: 0
  },
  statsLoading: false,
  
  fetchStats: async (userId) => {
    set({ statsLoading: true });
    try {
      const stats = await usersAPI.getUserStats(userId);
      set({ stats, statsLoading: false });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      set({ statsLoading: false });
    }
  },

  // Fetch entries from API
  fetchEntries: async (userId) => {
    set({ entriesLoading: true, entriesError: null });
    try {
      // Fetch stats in parallel
      get().fetchStats(userId);
      
      const entries = await entriesAPI.getAllEntries(userId);
      
      // Rebuild trash from entries with deleted files
      const trashedFiles = [];
      entries.forEach(entry => {
        if (entry.files && Array.isArray(entry.files)) {
          entry.files.forEach((file, index) => {
            // Check if file is an object (not just an ID) and has deleted flag
            if (file && typeof file === 'object' && file.deleted) {
              console.log('Found deleted file:', file);
              trashedFiles.push({
                id: `trash-${entry._id || entry.id}-${index}`,
                fileId: file._id,
                entryId: entry._id || entry.id,
                fileName: file.fileName || file.name,
                fileType: file.fileType || file.type,
                metadata: file.metadata,
                mood: file.mood,
                deletedAt: file.deletedAt || new Date().toISOString(),
                originalIndex: index,
              });
            }
          });
        }
      });
      
      console.log('Rebuilt trash with', trashedFiles.length, 'items');
      set({ entries, trashedFiles, entriesLoading: false });
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
      
      // Refresh stats
      get().fetchStats(userId);
      
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

  // Delete file from entry
  deleteFileFromEntry: (entryId, fileIndex) => set((state) => ({
    entries: state.entries.map((entry) => {
      if (entry.id === entryId || entry._id === entryId) {
        const newFiles = [...(entry.files || [])];
        newFiles.splice(fileIndex, 1);
        return { ...entry, files: newFiles };
      }
      return entry;
    }),
  })),

  // Move file to trash
  moveFileToTrash: async (entryId, fileIndex, file) => {
    const state = get();
    const entry = state.entries.find(e => (e.id === entryId || e._id === entryId));
    if (!entry) return;

    const deletedAt = new Date().toISOString();
    const trashedItem = {
      id: `trash-${Date.now()}-${fileIndex}`,
      fileId: file._id,
      entryId: entryId,
      fileName: file.fileName || file.name,
      fileType: file.fileType || file.type,
      metadata: file.metadata,
      mood: file.mood,
      deletedAt: deletedAt,
      originalIndex: fileIndex,
    };

    // Mark file as deleted in the entry (don't remove it)
    const newFiles = [...(entry.files || [])];
    if (newFiles[fileIndex]) {
      newFiles[fileIndex] = { ...newFiles[fileIndex], deleted: true, deletedAt: deletedAt };
    }

    try {
      // Update entry in backend with deleted flag
      await entriesAPI.updateEntry(entry._id || entry.id, {
        ...entry,
        files: newFiles
      });

      // Update local state
      set((state) => ({
        entries: state.entries.map((e) => {
          if (e.id === entryId || e._id === entryId) {
            return { ...e, files: newFiles };
          }
          return e;
        }),
        trashedFiles: [...state.trashedFiles, trashedItem],
      }));
    } catch (error) {
      console.error('Failed to move file to trash:', error);
      alert('Failed to move file to trash: ' + error.message);
    }
  },

  // Restore file from trash
  restoreFileFromTrash: async (trashItemId) => {
    const state = get();
    const trashedItem = state.trashedFiles.find(item => item.id === trashItemId);
    if (!trashedItem) return;

    const entry = state.entries.find(e => (e.id === trashedItem.entryId || e._id === trashedItem.entryId));
    if (!entry) return;

    // Restore file by removing the deleted flag
    const newFiles = [...(entry.files || [])];
    if (newFiles[trashedItem.originalIndex]) {
      const { deleted, ...fileWithoutDeletedFlag } = newFiles[trashedItem.originalIndex];
      newFiles[trashedItem.originalIndex] = fileWithoutDeletedFlag;
    }

    try {
      // Update entry in backend
      await entriesAPI.updateEntry(entry._id || entry.id, {
        ...entry,
        files: newFiles
      });

      // Update local state
      set((state) => ({
        entries: state.entries.map((e) => {
          if (e.id === trashedItem.entryId || e._id === trashedItem.entryId) {
            return { ...e, files: newFiles };
          }
          return e;
        }),
        trashedFiles: state.trashedFiles.filter(item => item.id !== trashItemId),
      }));
    } catch (error) {
      console.error('Failed to restore file:', error);
      alert('Failed to restore file: ' + error.message);
    }
  },

  // Permanently delete file from trash (from all databases)
  permanentlyDeleteFile: async (trashItemId) => {
    const state = get();
    const trashedItem = state.trashedFiles.find(item => item.id === trashItemId);
    if (!trashedItem) {
      set((state) => ({
        trashedFiles: state.trashedFiles.filter(item => item.id !== trashItemId),
      }));
      return;
    }

    try {
      // Delete from all databases via API (only if fileId exists)
      if (trashedItem.fileId) {
        try {
          await filesAPI.deleteFile(trashedItem.fileId);
        } catch (error) {
          // If file doesn't exist in database (404), that's ok, continue with cleanup
          if (error.response?.status !== 404) {
            throw error;
          }
          console.log('File already deleted from database, cleaning up locally');
        }
      }
      
      // Remove the file object from the entry's files array
      const entry = state.entries.find(e => (e.id === trashedItem.entryId || e._id === trashedItem.entryId));
      if (entry) {
        const newFiles = [...(entry.files || [])];
        // Remove the file at the original index
        newFiles.splice(trashedItem.originalIndex, 1);
        
        // Update entry in backend
        await entriesAPI.updateEntry(entry._id || entry.id, {
          ...entry,
          files: newFiles
        });
        
        // Update local state
        set((state) => ({
          entries: state.entries.map((e) => {
            if (e.id === trashedItem.entryId || e._id === trashedItem.entryId) {
              return { ...e, files: newFiles };
            }
            return e;
          }),
          trashedFiles: state.trashedFiles.filter(item => item.id !== trashItemId),
        }));
      } else {
        // Entry not found, just remove from trash
        set((state) => ({
          trashedFiles: state.trashedFiles.filter(item => item.id !== trashItemId),
        }));
      }
    } catch (error) {
      console.error('Failed to permanently delete file:', error);
      throw error;
    }
  },

  // Empty entire trash
  emptyTrash: async () => {
    const state = get();
    
    // Delete files from databases and remove from entries
    const deletePromises = state.trashedFiles.map(async (item) => {
      try {
        // Delete from database if fileId exists
        if (item.fileId) {
          try {
            await filesAPI.deleteFile(item.fileId);
          } catch (error) {
            // If 404, file already deleted, continue
            if (error.response?.status !== 404) {
              console.error(`Failed to delete file ${item.fileId}:`, error);
            }
          }
        }
        
        // Remove from entry's files array
        const entry = state.entries.find(e => (e.id === item.entryId || e._id === item.entryId));
        if (entry) {
          return { entryId: entry._id || entry.id, index: item.originalIndex };
        }
      } catch (err) {
        console.error(`Failed to process trash item:`, err);
      }
      return null;
    });

    try {
      const results = await Promise.all(deletePromises);
      
      // Group deletions by entry to update efficiently
      const entryUpdates = {};
      results.forEach(result => {
        if (result) {
          if (!entryUpdates[result.entryId]) {
            entryUpdates[result.entryId] = [];
          }
          entryUpdates[result.entryId].push(result.index);
        }
      });
      
      // Update each entry by removing deleted files
      const updatePromises = Object.entries(entryUpdates).map(async ([entryId, indices]) => {
        const entry = state.entries.find(e => (e.id === entryId || e._id === entryId));
        if (entry) {
          // Sort indices in descending order to remove from end first
          const sortedIndices = indices.sort((a, b) => b - a);
          const newFiles = [...(entry.files || [])];
          sortedIndices.forEach(index => {
            newFiles.splice(index, 1);
          });
          
          await entriesAPI.updateEntry(entryId, { ...entry, files: newFiles });
          return { entryId, newFiles };
        }
        return null;
      });
      
      const entryResults = await Promise.all(updatePromises);
      
      // Update local state
      set((state) => ({
        entries: state.entries.map((entry) => {
          const update = entryResults.find(r => r && (r.entryId === entry.id || r.entryId === entry._id));
          if (update) {
            return { ...entry, files: update.newFiles };
          }
          return entry;
        }),
        trashedFiles: [],
      }));
    } catch (error) {
      console.error('Failed to empty trash:', error);
      throw error;
    }
  },

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

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

// Entries API
export const entriesAPI = {
  getAllEntries: async (userId) => {
    const response = await api.get(`/entries/?userId=${userId}`);
    return response.data;
  },
  
  getEntry: async (entryId) => {
    const response = await api.get(`/entries/${entryId}`);
    return response.data;
  },
  
  createEntry: async (entryData) => {
    const response = await api.post('/entries/', entryData);
    return response.data;
  },
  
  updateEntry: async (entryId, entryData) => {
    const response = await api.put(`/entries/${entryId}`, entryData);
    return response.data;
  },
  
  deleteEntry: async (entryId) => {
    const response = await api.delete(`/entries/${entryId}`);
    return response.data;
  },
  
  addFileToEntry: async (entryId, fileId) => {
    const response = await api.patch(`/entries/${entryId}/add-file`, { fileId });
    return response.data;
  },
  
  getEntriesByMood: async (mood) => {
    const response = await api.get(`/entries/mood/${mood}`);
    return response.data;
  },
};

// Files API
export const filesAPI = {
  getFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },
  
  createFile: async (fileData) => {
    const response = await api.post('/files/', fileData);
    return response.data;
  },
  
  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
  
  getFilesByEntry: async (entryId) => {
    const response = await api.get(`/files/entry/${entryId}`);
    return response.data;
  },
};

// Songs API
export const songsAPI = {
  getAllSongs: async () => {
    const response = await api.get('/songs/');
    return response.data;
  },
  
  getSong: async (songId) => {
    const response = await api.get(`/songs/${songId}`);
    return response.data;
  },
  
  getSongsByMood: async (mood) => {
    const response = await api.get(`/songs/mood/${mood}`);
    return response.data;
  },
  
  recommendSongs: async (text) => {
    const response = await api.post('/songs/recommend', { text });
    return response.data;
  },

  createSong: async (songData) => {
    const response = await api.post('/songs/', songData);
    return response.data;
  },

  getSongs: async () => {
    const response = await api.get('/songs/');
    return response.data;
  },
};

export const spotifyAPI = {
  getToken: async (code) => {
    const response = await api.post('/spotify/token', { code });
    return response.data;
  }
};

export default api;

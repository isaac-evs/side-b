import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { FileIcon } from '../components/shared';

const MainExplorer = () => {
  const navigate = useNavigate();
  const { entries, selectedEntryId, setSelectedEntry } = useAppStore();
  const [viewingFile, setViewingFile] = useState(null);
  const [filterMood, setFilterMood] = useState(null);

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  const filteredEntries = filterMood
    ? entries.filter((e) => e.mood === filterMood)
    : entries;

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry.id);
    setViewingFile(null);
  };

  const handleFileClick = (file) => {
    setViewingFile(file);
  };

  const moodTags = [
    { value: 'joy', label: 'Joy', emoji: '😊', color: 'bg-mood-joy' },
    { value: 'calm', label: 'Calm', emoji: '😌', color: 'bg-mood-calm' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-mood-sad' },
    { value: 'stress', label: 'Stress', emoji: '😰', color: 'bg-mood-stress' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Window Title Bar */}
      <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="ml-4 font-semibold text-gray-700 dark:text-gray-300">
            Side B - Diary Explorer
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/diary-input')}
            className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
            title="Add Entry"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
            title="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button
            onClick={() => navigate('/desktop')}
            className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
            title="Desktop"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-200 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
          {/* Log Files Section */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Log Files
            </h3>
            <div className="space-y-1">
              {filteredEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleEntryClick(entry)}
                  className={`
                    w-full text-left px-3 py-2 rounded text-sm transition-colors
                    ${
                      selectedEntryId === entry.id
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span>📝</span>
                    <span className="truncate">{entry.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="p-4 border-t border-gray-300 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Tags by Emotion
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilterMood(null)}
                className={`
                  w-full text-left px-3 py-2 rounded text-sm transition-colors
                  ${
                    filterMood === null
                      ? 'bg-gray-400 dark:bg-gray-600 text-white'
                      : 'hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                All Entries
              </button>
              {moodTags.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setFilterMood(mood.value)}
                  className={`
                    w-full text-left px-3 py-2 rounded text-sm transition-colors
                    ${
                      filterMood === mood.value
                        ? `${mood.color} text-white`
                        : 'hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{mood.emoji}</span>
                  {mood.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto">
          {selectedEntry ? (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Entry - {selectedEntry.date}
              </h2>

              {viewingFile ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {viewingFile.name}
                    </h3>
                    <button
                      onClick={() => setViewingFile(null)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {viewingFile.type === 'feelings' && selectedEntry.text}
                    {viewingFile.type === 'song' && (
                      <div className="space-y-4">
                        <div>
                          <strong>Title:</strong> {selectedEntry.song.title}
                        </div>
                        <div>
                          <strong>Artist:</strong> {selectedEntry.song.artist}
                        </div>
                        <div>
                          <strong>Mood:</strong>{' '}
                          <span className="capitalize">{selectedEntry.song.mood}</span>
                        </div>
                        <div className="mt-6">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                            <button className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white">
                              ▶
                            </button>
                            <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              0:00 / 3:24
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Feelings File */}
                  <FileIcon
                    file={{ name: 'feelings.txt', type: 'text' }}
                    onClick={() =>
                      handleFileClick({ name: 'feelings.txt', type: 'feelings' })
                    }
                  />

                  {/* Song File */}
                  <FileIcon
                    file={{ name: 'song.mp3', type: 'audio' }}
                    onClick={() => handleFileClick({ name: 'song.mp3', type: 'song' })}
                  />

                  {/* Additional Files */}
                  {selectedEntry.files?.map((file) => (
                    <FileIcon
                      key={file.id}
                      file={file}
                      onClick={() => handleFileClick(file)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                {entries.length === 0 ? (
                  <>
                    <p className="text-xl mb-4">No entries yet</p>
                    <button
                      onClick={() => navigate('/diary-input')}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      Create Your First Entry
                    </button>
                  </>
                ) : (
                  <p className="text-xl">Select an entry from the sidebar</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainExplorer;

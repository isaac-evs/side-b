import React from 'react';
import { FileText, Image as ImageIcon, BookOpen, Film, Youtube } from 'lucide-react';

const FileViewer = ({ file, entry, moods }) => {
  if (!file || !entry) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <p className="text-gray-400">No file selected</p>
      </div>
    );
  }

  // Render feelings.txt
  if (file === 'feelings' || file.type === 'feelings') {
    return (
      <div className="flex-1 p-6 bg-white dark:bg-gray-900 overflow-y-auto h-full">
        <div className="max-w-2xl mx-auto bg-white shadow-sm p-8 min-h-[400px]">
          <div className="flex items-center justify-between mb-6 pb-4">
            <h3 className="text-xl font-serif font-bold text-gray-900">
              {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div
              className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
              style={{
                backgroundColor: moods[entry.mood]?.color + '40',
                color: '#000'
              }}
            >
              {moods[entry.mood]?.name}
            </div>
          </div>
          <p className="text-gray-800 leading-relaxed font-serif text-lg whitespace-pre-wrap">
            {entry.text}
          </p>
        </div>
      </div>
    );
  }

  // Render images and GIFs
  if (file.type === 'image' || file.type === 'gif') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl w-full">
          {file.metadata?.imageUrl ? (
            <img 
              src={file.metadata.imageUrl} 
              alt={file.name}
              className="w-full h-auto object-contain max-h-[70vh] rounded-lg shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-24 h-24 mb-4 opacity-20" />
              <p>Image not available</p>
            </div>
          )}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {file.name}{file.metadata?.extension ? `.${file.metadata.extension}` : ''}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // Render books
  if (file.type === 'book') {
    return (
      <div className="flex-1 p-6 bg-white dark:bg-gray-900 overflow-y-auto h-full">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-6 mb-6">
            {file.metadata?.coverUrl ? (
              <img 
                src={file.metadata.coverUrl} 
                alt={file.name}
                className="w-48 h-auto object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {file.name}
              </h2>
              {file.metadata?.author && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  by {file.metadata.author}
                </p>
              )}
              {file.metadata?.content && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {file.metadata.content}
                  </p>
                </div>
              )}
              {file.metadata?.bookUrl && (
                <a 
                  href={file.metadata.bookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  View Book
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render movies
  if (file.type === 'movie') {
    return (
      <div className="flex-1 p-6 bg-white dark:bg-gray-900 overflow-y-auto h-full">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-6 mb-6">
            {file.metadata?.coverUrl ? (
              <img 
                src={file.metadata.coverUrl} 
                alt={file.name}
                className="w-48 h-auto object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-48 h-72 bg-gray-200 rounded-lg flex items-center justify-center">
                <Film className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {file.name}
              </h2>
              {file.metadata?.content && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {file.metadata.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render videos (YouTube, etc.)
  if (file.type === 'video') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl w-full">
          {file.metadata?.videoUrl ? (
            <div className="aspect-video">
              <iframe
                src={file.metadata.videoUrl}
                title={file.name}
                className="w-full h-full rounded-lg shadow-lg"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Youtube className="w-24 h-24 mb-4 opacity-20" />
              <p>Video not available</p>
            </div>
          )}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {file.name}
            </h3>
            {file.metadata?.content && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {file.metadata.content}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default fallback for unknown file types
  return (
    <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
      <div className="text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-400">Cannot preview this file type</p>
        <p className="text-sm text-gray-500 mt-2">{file.name}</p>
      </div>
    </div>
  );
};

export default FileViewer;

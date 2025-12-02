import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

const Gallery = () => {
  // Mock gallery images - could be expanded to show mood-related imagery
  const images = [
    { id: 1, mood: 'joy', color: '#F6DD73' },
    { id: 2, mood: 'calm', color: '#6EC9B1' },
    { id: 3, mood: 'sad', color: '#5386FE' },
    { id: 4, mood: 'stress', color: '#FE5344' },
    { id: 5, mood: 'joy', color: '#F6DD73' },
    { id: 6, mood: 'calm', color: '#6EC9B1' },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 bg-[#f6f6f6] dark:bg-[#2a2a2a]">
        <div className="flex space-x-4">
            <div className="flex space-x-1">
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Photos
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {images.map((image) => (
            <button
              key={image.id}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity shadow-sm border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: image.color }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-white/50" />
              </div>
            </button>
          ))}
        </div>
        
        {images.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No photos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;

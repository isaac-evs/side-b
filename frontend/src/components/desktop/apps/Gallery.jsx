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
    <div className="h-full p-6 overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        Gallery
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <button
            key={image.id}
            className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform shadow-lg"
            style={{ backgroundColor: image.color }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-white/50" />
            </div>
          </button>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No images yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

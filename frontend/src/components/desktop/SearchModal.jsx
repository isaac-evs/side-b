import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, entries }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredResults = entries.filter(entry => 
    entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.song?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.song?.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%)',
          border: '1px solid rgba(0,0,0,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div 
          className="flex items-center p-4 border-b"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.15)' }}
        >
          <Search className="w-5 h-5 mr-3" style={{ color: '#666' }} />
          <input
            type="text"
            placeholder="Search entries, songs, feelings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none text-base"
            style={{
              color: '#000',
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
            }}
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#666' }} />
          </button>
        </div>

        {/* Results */}
        <div 
          className="max-h-96 overflow-y-auto"
          style={{ backgroundColor: '#fff' }}
        >
          {searchQuery && (
            <div className="p-2">
              {filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <p 
                    className="text-sm"
                    style={{
                      color: '#666',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    No results found
                  </p>
                </div>
              ) : (
                filteredResults.map(entry => (
                  <div
                    key={entry.id}
                    className="p-3 rounded hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                    style={{
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    <div className="text-sm font-semibold mb-1">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs opacity-90 line-clamp-2">
                      {entry.text}
                    </div>
                    {entry.song && (
                      <div className="text-xs opacity-75 mt-1">
                        🎵 {entry.song.title} - {entry.song.artist}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          {!searchQuery && (
            <div className="text-center py-8">
              <p 
                className="text-sm"
                style={{
                  color: '#999',
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                }}
              >
                Start typing to search...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

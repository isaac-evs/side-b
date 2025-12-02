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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(240, 240, 240, 0.95)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div 
          className="flex items-center p-3"
        >
          <Search className="w-5 h-5 mr-3 text-gray-500" />
          <input
            type="text"
            placeholder="Spotlight Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none text-xl font-light"
            style={{
              color: '#000',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}
          />
        </div>

        {/* Results */}
        {searchQuery && (
          <div 
            className="max-h-96 overflow-y-auto border-t border-gray-300/50"
          >
            <div className="p-2">
              {filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No results found</p>
                </div>
              ) : (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Top Hits</div>
                  {filteredResults.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors cursor-default group"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-3 text-gray-500 group-hover:text-blue-500 group-hover:bg-white">
                        <span className="text-xs font-bold">{new Date(entry.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {entry.text}
                        </div>
                        {entry.song && (
                          <div className="text-xs opacity-70 truncate">
                            {entry.song.title} - {entry.song.artist}
                          </div>
                        )}
                      </div>
                      <div className="text-xs opacity-50 ml-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;

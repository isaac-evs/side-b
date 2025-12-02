import React from 'react';
import { Trash2, FileText, RotateCcw } from 'lucide-react';

const Trash = () => {
  // Mock deleted items - in a real app, these would be soft-deleted entries
  const deletedItems = [];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 text-sm">
      {/* Finder Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-[#f6f6f6] dark:bg-[#2a2a2a]">
        <div className="flex items-center space-x-2 text-gray-500">
          <span className="font-medium text-gray-700 dark:text-gray-300">Trash</span>
        </div>
        {deletedItems.length > 0 && (
          <button className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            Empty
          </button>
        )}
      </div>

      {/* Finder List Header */}
      <div className="flex items-center px-4 py-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-500 font-medium">
        <div className="flex-1">Name</div>
        <div className="w-32">Date Deleted</div>
        <div className="w-24">Kind</div>
        <div className="w-20">Action</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {deletedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <Trash2 className="w-16 h-16 mb-2 opacity-20" />
            <p className="font-medium">Trash is empty</p>
          </div>
        ) : (
          <div className="w-full">
            {deletedItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center px-4 py-2 group ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-[#f5f5f5] dark:bg-[#1e1e1e]'
                } hover:bg-blue-500 hover:text-white cursor-default`}
              >
                <div className="flex-1 flex items-center space-x-2 min-w-0">
                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-white/80" />
                  <span className="truncate font-medium">{item.name}</span>
                </div>
                <div className="w-32 text-gray-500 group-hover:text-white/90 truncate">
                  {new Date(item.deletedAt).toLocaleDateString()}
                </div>
                <div className="w-24 text-gray-500 group-hover:text-white/90 truncate">
                  Document
                </div>
                <div className="w-20">
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"
                    title="Put Back"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Finder Status Bar */}
      <div className="px-4 py-1 border-t border-gray-200 dark:border-gray-700 bg-[#f6f6f6] dark:bg-[#2a2a2a] text-xs text-gray-500 flex justify-center">
        {deletedItems.length} items
      </div>
    </div>
  );
};

export default Trash;

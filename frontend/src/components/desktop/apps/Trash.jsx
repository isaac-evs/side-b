import React from 'react';
import { Trash2, FileText, RotateCcw } from 'lucide-react';

const Trash = () => {
  // Mock deleted items - in a real app, these would be soft-deleted entries
  const deletedItems = [];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
          <Trash2 className="w-6 h-6 mr-2" />
          Trash
        </h2>
        {deletedItems.length > 0 && (
          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
            Empty Trash
          </button>
        )}
      </div>

      {deletedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <Trash2 className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-semibold">Trash is empty</p>
          <p className="text-sm mt-2">Deleted items will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deletedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Deleted {new Date(item.deletedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                aria-label="Restore"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trash;

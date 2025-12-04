import React, { useState } from 'react';
import { Trash2, FileText, RotateCcw, Image as ImageIcon, BookOpen, Film, Youtube, X } from 'lucide-react';
import useAppStore from '../../../store/appStore';

const Trash = () => {
  const { trashedFiles, restoreFileFromTrash, permanentlyDeleteFile, emptyTrash } = useAppStore();
  const [isEmptying, setIsEmptying] = useState(false);

  const handleRestore = (trashItemId) => {
    restoreFileFromTrash(trashItemId);
  };

  const handlePermanentDelete = async (trashItemId) => {
    if (window.confirm('Permanently delete this file? This action cannot be undone and will remove it from all databases.')) {
      try {
        await permanentlyDeleteFile(trashItemId);
      } catch (error) {
        alert('Failed to delete file: ' + error.message);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (trashedFiles.length === 0) return;
    
    if (window.confirm(`Permanently delete all ${trashedFiles.length} items? This action cannot be undone and will remove them from all databases.`)) {
      setIsEmptying(true);
      try {
        await emptyTrash();
      } catch (error) {
        alert('Failed to empty trash: ' + error.message);
      } finally {
        setIsEmptying(false);
      }
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
      case 'gif':
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'movie':
        return <Film className="w-4 h-4 text-red-500" />;
      case 'video':
        return <Youtube className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 text-sm">
      {/* Finder Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-[#f6f6f6] dark:bg-[#2a2a2a]">
        <div className="flex items-center space-x-2 text-gray-500">
          <span className="font-medium text-gray-700 dark:text-gray-300">Trash</span>
        </div>
        {trashedFiles.length > 0 && (
          <button 
            onClick={handleEmptyTrash}
            disabled={isEmptying}
            className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {isEmptying ? 'Emptying...' : 'Empty Trash'}
          </button>
        )}
      </div>

      {/* Finder List Header */}
      <div className="flex items-center px-4 py-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-500 font-medium">
        <div className="flex-1">Name</div>
        <div className="w-32">Date Deleted</div>
        <div className="w-24">Kind</div>
        <div className="w-32">Actions</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {trashedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <Trash2 className="w-16 h-16 mb-2 opacity-20" />
            <p className="font-medium">Trash is empty</p>
          </div>
        ) : (
          <div className="w-full">
            {trashedFiles.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center px-4 py-2 group ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-[#f5f5f5] dark:bg-[#1e1e1e]'
                } hover:bg-blue-500 hover:text-white cursor-default`}
              >
                <div className="flex-1 flex items-center space-x-2 min-w-0">
                  {getFileIcon(item.fileType)}
                  <span className="truncate font-medium">{item.fileName}</span>
                </div>
                <div className="w-32 text-gray-500 group-hover:text-white/90 truncate text-xs">
                  {new Date(item.deletedAt).toLocaleDateString()}
                </div>
                <div className="w-24 text-gray-500 group-hover:text-white/90 truncate text-xs capitalize">
                  {item.fileType}
                </div>
                <div className="w-32 flex items-center space-x-1">
                  <button
                    onClick={() => handleRestore(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/20 rounded transition-all"
                    title="Put Back"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/30 rounded transition-all"
                    title="Delete Forever"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Finder Status Bar */}
      <div className="px-4 py-1 border-t border-gray-200 dark:border-gray-700 bg-[#f6f6f6] dark:bg-[#2a2a2a] text-xs text-gray-500 flex justify-center">
        {trashedFiles.length} {trashedFiles.length === 1 ? 'item' : 'items'}
      </div>
    </div>
  );
};

export default Trash;

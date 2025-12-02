import React, { useState } from 'react';
import { X, FileImage, FileVideo, BookOpen, Film, Youtube, FileText } from 'lucide-react';

const AddFileModal = ({ isOpen, onClose, onAddFile, currentDate }) => {
  const [step, setStep] = useState('select'); // 'select' or 'form'
  const [fileType, setFileType] = useState(null);
  const [formData, setFormData] = useState({
    fileName: '',
    extension: '',
    mood: '',
    imageUrl: '',
    author: '',
    bookUrl: '',
    youtubeUrl: ''
  });

  const moods = [
    { value: 'joy', label: 'Joy', color: '#F6DD73' },
    { value: 'calm', label: 'Calm', color: '#6EC9B1' },
    { value: 'sad', label: 'Sad', color: '#5386FE' },
    { value: 'stress', label: 'Stress', color: '#FE5344' }
  ];

  const fileTypes = [
    { id: 'image', name: 'Image', icon: FileImage, extensions: ['jpeg', 'jpg', 'png'] },
    { id: 'gif', name: 'GIF', icon: FileImage, extensions: ['gif'] },
    { id: 'book', name: 'Book', icon: BookOpen, extensions: ['epub', 'pdf'] },
    { id: 'movie', name: 'Movie', icon: Film, extensions: ['mp4', 'mkv', 'avi'] },
    { id: 'video', name: 'Video (YouTube)', icon: Youtube, extensions: ['mp4'] },
    { id: 'text', name: 'Text', icon: FileText, extensions: ['txt'] }
  ];

  if (!isOpen) return null;

  const resetForm = () => {
    setStep('select');
    setFileType(null);
    setFormData({
      fileName: '',
      extension: '',
      mood: '',
      imageUrl: '',
      author: '',
      bookUrl: '',
      youtubeUrl: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectType = (type) => {
    setFileType(type);
    setFormData(prev => ({ ...prev, extension: type.extensions[0] }));
    setStep('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.fileName || !formData.mood) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.fileName.includes(' ')) {
      alert('File name cannot contain spaces');
      return;
    }

    if (formData.fileName.length > 15) {
      alert('File name must be 15 characters or less');
      return;
    }

    // Create file object
    const newFile = {
      id: Date.now(),
      type: fileType.id,
      name: `${formData.fileName}.${formData.extension}`,
      mood: formData.mood,
      date: currentDate,
      ...formData
    };

    onAddFile(newFile);
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }}
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          maxHeight: '80vh',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Catalina Title Bar */}
        <div 
          className="flex items-center justify-between px-4 py-3 select-none relative"
          style={{
            backgroundColor: '#f6f6f6',
            borderBottom: '1px solid #e1e1e1',
            height: '38px'
          }}
        >
          {/* Traffic Light Buttons (left side) */}
          <div className="flex items-center space-x-2 group">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full relative transition-all duration-150"
              style={{
                backgroundColor: '#ff5f56',
                border: '0.5px solid rgba(0,0,0,0.1)',
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/50">×</span>
            </button>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e0e0e0', border: '0.5px solid rgba(0,0,0,0.1)' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e0e0e0', border: '0.5px solid rgba(0,0,0,0.1)' }} />
          </div>
          
          {/* Window Title (centered) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span 
              className="text-sm font-medium tracking-tight"
              style={{
                color: '#333',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              {step === 'select' ? 'Add New File' : `Add ${fileType?.name}`}
            </span>
          </div>
          
          <div className="w-14"></div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white" style={{ maxHeight: 'calc(80vh - 40px)' }}>
          {step === 'select' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fileTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className="p-6 rounded-lg hover:bg-blue-50 transition-all group flex flex-col items-center justify-center border border-transparent hover:border-blue-200"
                >
                  <type.icon className="w-12 h-12 mb-3 text-gray-500 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                  <div 
                    className="text-sm font-medium text-gray-700 group-hover:text-blue-600"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {type.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* File Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="No spaces, max 15 chars"
                  maxLength={15}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                  required
                />
                <p className="text-xs mt-1 text-gray-400 text-right">
                  {formData.fileName.length}/15
                </p>
              </div>

              {/* Extension */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Extension
                </label>
                <select
                  value={formData.extension}
                  onChange={(e) => setFormData(prev => ({ ...prev, extension: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-white"
                >
                  {fileType?.extensions.map(ext => (
                    <option key={ext} value={ext}>.{ext}</option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Emotion <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md border transition-all ${
                        formData.mood === mood.value 
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: mood.color }}
                      />
                      <span className={`text-sm ${formData.mood === mood.value ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type-specific fields */}
              {(fileType?.id === 'image' || fileType?.id === 'gif') && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                  />
                </div>
              )}

              {fileType?.id === 'book' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                      Book Cover URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                      Goodreads Link
                    </label>
                    <input
                      type="url"
                      value={formData.bookUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookUrl: e.target.value }))}
                      placeholder="https://goodreads.com/..."
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                    />
                  </div>
                </>
              )}

              {(fileType?.id === 'movie' || fileType?.id === 'video') && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    {fileType?.id === 'video' ? 'YouTube URL' : 'Video URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder={fileType?.id === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/video.mp4'}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-1.5 rounded-md text-sm font-medium text-white bg-blue-500 shadow-sm hover:bg-blue-600 active:bg-blue-700 transition-all"
                  style={{
                    background: 'linear-gradient(to bottom, #4da7ff, #0066cc)',
                    border: '1px solid #0055aa'
                  }}
                >
                  Add File
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFileModal;

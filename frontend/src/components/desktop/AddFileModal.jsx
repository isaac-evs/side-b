import React, { useState } from 'react';
import { X, FileImage, FileVideo, BookOpen, Film, Youtube, FileText, ChevronLeft } from 'lucide-react';

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
    { id: 'image', name: 'Image', icon: FileImage, extensions: ['jpeg', 'jpg', 'png'], color: '#A78BFA' },
    { id: 'gif', name: 'GIF', icon: FileImage, extensions: ['gif'], color: '#F472B6' },
    { id: 'book', name: 'Book', icon: BookOpen, extensions: ['epub', 'pdf'], color: '#FBBF24' },
    { id: 'movie', name: 'Movie', icon: Film, extensions: ['mp4', 'mkv', 'avi'], color: '#EF4444' },
    { id: 'video', name: 'Video', icon: Youtube, extensions: ['mp4'], color: '#EF4444' },
    { id: 'text', name: 'Text', icon: FileText, extensions: ['txt'], color: '#94A3B8' }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.1)',
          maxHeight: '85vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-10 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {step === 'form' && (
              <button
                onClick={() => setStep('select')}
                className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <h2 
              className="text-xl font-semibold text-gray-900"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {step === 'select' ? 'Add File' : fileType?.name}
            </h2>
            <button
              onClick={handleClose}
              className="p-1 -mr-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          {step === 'select' && (
            <div className="grid grid-cols-2 gap-3">
              {fileTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className="group p-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150 bg-white"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                    style={{ backgroundColor: type.color + '20' }}
                  >
                    <type.icon className="w-6 h-6" style={{ color: type.color }} strokeWidth={2} />
                  </div>
                  <div 
                    className="text-sm font-medium text-gray-700"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="filename"
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  required
                />
                <p className="text-xs mt-1.5 text-gray-400">
                  {formData.fileName.length}/15 • No spaces allowed
                </p>
              </div>

              {/* Extension */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extension
                </label>
                <select
                  value={formData.extension}
                  onChange={(e) => setFormData(prev => ({ ...prev, extension: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm bg-white"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                >
                  {fileType?.extensions.map(ext => (
                    <option key={ext} value={ext}>.{ext}</option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mood <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        formData.mood === mood.value 
                          ? 'bg-gray-50 border-2' 
                          : 'bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{
                        borderColor: formData.mood === mood.value ? mood.color : undefined
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: mood.color }}
                      />
                      <span className={`text-sm font-medium ${formData.mood === mood.value ? 'text-gray-900' : 'text-gray-600'}`}>
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type-specific fields */}
              {(fileType?.id === 'image' || fileType?.id === 'gif') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  />
                </div>
              )}

              {fileType?.id === 'book' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link
                    </label>
                    <input
                      type="url"
                      value={formData.bookUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookUrl: e.target.value }))}
                      placeholder="https://goodreads.com/..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                    />
                  </div>
                </>
              )}

              {(fileType?.id === 'movie' || fileType?.id === 'video') && (
                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                    />
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {fileType?.id === 'video' ? 'YouTube URL' : 'Video URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder={fileType?.id === 'video' ? 'https://youtube.com/...' : 'https://example.com/video.mp4'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  />
                </div>
              )}

              {fileType?.id === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your text here..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-0 outline-none transition-all text-sm resize-none"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-3 mt-4 rounded-lg text-sm font-semibold text-white bg-gray-700 hover:bg-gray-800 active:bg-gray-900 transition-all"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Add File
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFileModal;
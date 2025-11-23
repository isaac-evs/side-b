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
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%)',
          border: '1px solid rgba(0,0,0,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          maxHeight: '80vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{
            background: 'linear-gradient(to bottom, #c8d5e5 0%, #9bb0cc 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.15)'
          }}
        >
          <h2 
            className="text-lg font-bold text-white"
            style={{
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {step === 'select' ? 'Add New File' : `Add ${fileType?.name}`}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {step === 'select' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fileTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className="p-6 rounded-lg hover:shadow-lg transition-all"
                  style={{
                    background: 'linear-gradient(to bottom, #fff 0%, #f0f0f0 100%)',
                    border: '1px solid rgba(0,0,0,0.15)'
                  }}
                >
                  <type.icon className="w-12 h-12 mx-auto mb-3" style={{ color: '#4580d4' }} />
                  <div 
                    className="text-sm font-semibold"
                    style={{
                      color: '#000',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    {type.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Name */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    color: '#000',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                  }}
                >
                  File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="No spaces, max 15 chars"
                  maxLength={15}
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    border: '1px solid rgba(0,0,0,0.2)',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                  }}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#666' }}>
                  {formData.fileName.length}/15 characters
                </p>
              </div>

              {/* Extension */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    color: '#000',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                  }}
                >
                  Extension
                </label>
                <select
                  value={formData.extension}
                  onChange={(e) => setFormData(prev => ({ ...prev, extension: e.target.value }))}
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    border: '1px solid rgba(0,0,0,0.2)',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                  }}
                >
                  {fileType?.extensions.map(ext => (
                    <option key={ext} value={ext}>.{ext}</option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    color: '#000',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                  }}
                >
                  Emotion <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                      className="flex items-center space-x-2 px-3 py-2 rounded transition-all"
                      style={{
                        background: formData.mood === mood.value 
                          ? 'linear-gradient(to bottom, #4580d4 0%, #2e5fa8 100%)'
                          : 'linear-gradient(to bottom, #fff 0%, #f0f0f0 100%)',
                        border: '1px solid rgba(0,0,0,0.15)',
                        color: formData.mood === mood.value ? '#fff' : '#000',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: mood.color }}
                      />
                      <span className="text-sm">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type-specific fields */}
              {(fileType?.id === 'image' || fileType?.id === 'gif') && (
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: '#000',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      border: '1px solid rgba(0,0,0,0.2)',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  />
                </div>
              )}

              {fileType?.id === 'book' && (
                <>
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{
                        color: '#000',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    >
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                      className="w-full px-3 py-2 rounded border"
                      style={{
                        border: '1px solid rgba(0,0,0,0.2)',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{
                        color: '#000',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    >
                      Book Cover URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full px-3 py-2 rounded border"
                      style={{
                        border: '1px solid rgba(0,0,0,0.2)',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{
                        color: '#000',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    >
                      Goodreads Link
                    </label>
                    <input
                      type="url"
                      value={formData.bookUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookUrl: e.target.value }))}
                      placeholder="https://goodreads.com/..."
                      className="w-full px-3 py-2 rounded border"
                      style={{
                        border: '1px solid rgba(0,0,0,0.2)',
                        fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                      }}
                    />
                  </div>
                </>
              )}

              {(fileType?.id === 'movie' || fileType?.id === 'video') && (
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: '#000',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    {fileType?.id === 'video' ? 'YouTube URL' : 'Video URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder={fileType?.id === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/video.mp4'}
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      border: '1px solid rgba(0,0,0,0.2)',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-2 rounded"
                  style={{
                    background: 'linear-gradient(to bottom, #fff 0%, #f0f0f0 100%)',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded text-white"
                  style={{
                    background: 'linear-gradient(to bottom, #4580d4 0%, #2e5fa8 100%)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
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

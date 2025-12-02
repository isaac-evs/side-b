import React from 'react';
import { X, BookOpen, Edit3, Music2, FolderOpen } from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: Edit3,
      title: 'Write Your Feelings',
      description: 'Start by writing about your day. Express your emotions freely - there\'s no right or wrong way to journal.',
      color: '#4580d4'
    },
    {
      icon: Music2,
      title: 'Choose a Song',
      description: 'Select a song that matches your mood. Music helps capture the emotional essence of your day.',
      color: '#9b59b6'
    },
    {
      icon: FolderOpen,
      title: 'Browse Your Entries',
      description: 'All your diary entries are saved here. Click on any date to view your feelings and the song you chose.',
      color: '#e67e22'
    },
    {
      icon: BookOpen,
      title: 'Filter by Tags',
      description: 'Use emotion tags at the bottom to filter files by mood. Click to hide or show specific emotions.',
      color: '#16a085'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
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
              onClick={onClose}
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
              Diary Tutorial
            </span>
          </div>
          
          <div className="w-14"></div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto bg-white" style={{ maxHeight: 'calc(80vh - 40px)' }}>
          <div className="text-center mb-8 pb-8 border-b border-gray-100">
            <h3 
              className="text-2xl font-semibold mb-3 text-gray-900"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Welcome to Side-B
            </h3>
            <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
              Your musical diary companion. Capture your daily moments with words and songs.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex space-x-5 p-5 rounded-xl transition-all hover:bg-gray-50 border border-transparent hover:border-gray-100"
              >
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: step.color,
                    boxShadow: `0 4px 12px ${step.color}40`
                  }}
                >
                  <step.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1 pt-1">
                  <h4 
                    className="font-semibold mb-1.5 text-gray-900"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="mt-8 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
          >
            <p className="text-sm text-center text-blue-800 leading-relaxed">
              <span className="font-semibold">Pro Tip:</span> Double-click on files to view their contents. Each file has an emotion tag that you can filter!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end"
        >
          <button
            onClick={onClose}
            className="px-6 py-1.5 rounded-md text-sm font-medium text-white shadow-sm hover:shadow transition-all active:scale-95"
            style={{
              background: 'linear-gradient(to bottom, #4da7ff, #0066cc)',
              border: '1px solid #0055aa'
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;

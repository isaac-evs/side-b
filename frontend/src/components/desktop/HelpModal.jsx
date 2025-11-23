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
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
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
            📔 Diary Tutorial
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          <div 
            className="text-center mb-6 pb-6 border-b"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}
          >
            <h3 
              className="text-2xl font-bold mb-2"
              style={{
                color: '#000',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              Welcome to Side-B
            </h3>
            <p 
              className="text-sm"
              style={{
                color: '#666',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              Your musical diary companion. Capture your daily moments with words and songs.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex space-x-4 p-4 rounded-lg"
                style={{
                  background: 'linear-gradient(to bottom, #fff 0%, #f9f9f9 100%)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: step.color,
                    boxShadow: `0 4px 12px ${step.color}40`
                  }}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-bold mb-2"
                    style={{
                      color: '#000',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
                    }}
                  >
                    {index + 1}. {step.title}
                  </h4>
                  <p 
                    className="text-sm"
                    style={{
                      color: '#666',
                      fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                      lineHeight: '1.5'
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="mt-6 p-4 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff'
            }}
          >
            <p 
              className="text-sm text-center"
              style={{
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                lineHeight: '1.5'
              }}
            >
              💡 <strong>Pro Tip:</strong> Double-click on files to view their contents. Each file has an emotion tag that you can filter!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t flex justify-end"
          style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded text-white"
            style={{
              background: 'linear-gradient(to bottom, #4580d4 0%, #2e5fa8 100%)',
              border: '1px solid rgba(0,0,0,0.2)',
              fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
              boxShadow: '0 2px 6px rgba(69, 128, 212, 0.3)'
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

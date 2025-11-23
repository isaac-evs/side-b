import React from 'react';
import { Rnd } from 'react-rnd';

const FileIcon = ({ icon, title, subtitle, onDoubleClick, position, moodColor }) => {
  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: 120,
        height: 'auto'
      }}
      enableResizing={false}
      bounds="parent"
      dragHandleClassName="file-icon-handle"
    >
      <div
        onDoubleClick={onDoubleClick}
        className="file-icon-handle cursor-pointer select-none group"
        style={{ width: '120px' }}
      >
        <div className="flex flex-col items-center space-y-2">
          {/* Icon Container with mood indicator */}
          <div className="relative">
            <div 
              className="w-16 h-20 rounded-lg flex flex-col items-center justify-center group-hover:bg-white/20 transition-colors"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.9) 100%)',
                border: '1px solid rgba(0,0,0,0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {icon}
            </div>
            {/* Mood color indicator */}
            {moodColor && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                style={{ 
                  backgroundColor: moodColor,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              />
            )}
          </div>
          
          {/* Title */}
          <div 
            className="text-center px-2 py-1 rounded w-full"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div 
              className="text-xs font-medium text-white truncate"
              style={{
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div 
                className="text-[10px] text-white/80 truncate"
                style={{
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </Rnd>
  );
};

export default FileIcon;

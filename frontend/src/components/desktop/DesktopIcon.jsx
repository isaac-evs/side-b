import React from 'react';
import { Rnd } from 'react-rnd';

const DesktopIcon = ({ icon, title, description, onDoubleClick, position }) => {
  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: 100,
        height: 'auto'
      }}
      enableResizing={false}
      bounds="parent"
      dragHandleClassName="desktop-icon-handle"
    >
      <div
        onDoubleClick={onDoubleClick}
        className="desktop-icon-handle cursor-pointer select-none group"
        style={{ width: '100px' }}
      >
        <div className="flex flex-col items-center space-y-1">
          {/* Icon Container */}
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(240,240,240,0.2) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {icon}
          </div>
          
          {/* Title */}
          <div 
            className="text-center px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              maxWidth: '100px'
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
            {description && (
              <div 
                className="text-[10px] text-white/80 truncate"
                style={{
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    </Rnd>
  );
};

export default DesktopIcon;

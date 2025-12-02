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
        className="desktop-icon-handle cursor-pointer select-none group flex flex-col items-center"
        style={{ width: '100px' }}
      >
        {/* Icon Container - macOS Style Squircle */}
        <div 
          className="w-14 h-14 mb-1 flex items-center justify-center transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #e6e6e6 100%)',
            borderRadius: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          {/* Clone icon to ensure size fits */}
          {React.isValidElement(icon) ? React.cloneElement(icon, { className: "w-8 h-8 text-gray-700" }) : icon}
        </div>
        
        {/* Title - macOS Style Label */}
        <div 
          className="px-1 py-0.5 text-center"
          style={{
            maxWidth: '100px'
          }}
        >
          <div 
            className="text-xs font-medium text-white truncate leading-tight group-hover:bg-[#0061D5] group-hover:rounded px-1.5 py-0.5 inline-block"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {title}
          </div>
          {description && (
            <div 
              className="text-[10px] text-white/90 truncate mt-0.5"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
};

export default DesktopIcon;

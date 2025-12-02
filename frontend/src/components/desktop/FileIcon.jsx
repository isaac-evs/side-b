import React from 'react';
import { Rnd } from 'react-rnd';

const FileIcon = ({ icon, title, subtitle, onDoubleClick, position, moodColor }) => {
  // Check if icon is an img element (for custom file icons like txt.png)
  const isCustomImage = React.isValidElement(icon) && icon.type === 'img';
  
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
        className="file-icon-handle cursor-pointer select-none group flex flex-col items-center"
        style={{ width: '120px' }}
      >
        <div className="flex flex-col items-center space-y-1">
          {/* Icon Container with mood indicator */}
          <div className="relative transition-transform active:scale-95">
            {isCustomImage ? (
              // Render custom image without frame
              <div className="flex items-center justify-center">
                {React.cloneElement(icon, { className: "w-12 h-12 object-contain" })}
              </div>
            ) : (
              // Render default file icon with frame
              <div 
                className="w-12 h-16 bg-white flex flex-col items-center justify-center relative"
                style={{
                  borderRadius: '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  border: '1px solid #e0e0e0'
                }}
              >
                {/* Folded corner */}
                <div 
                  className="absolute top-0 right-0 w-3 h-3 bg-[#f0f0f0]"
                  style={{
                    borderBottomLeftRadius: '2px',
                    boxShadow: '-1px 1px 1px rgba(0,0,0,0.05)'
                  }}
                />
                
                {React.isValidElement(icon) ? React.cloneElement(icon, { className: "w-6 h-6 text-gray-500" }) : icon}
              </div>
            )}
            
            {/* Mood color indicator */}
            {moodColor && (
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ 
                  backgroundColor: moodColor,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              />
            )}
          </div>
          
          {/* Title */}
          <div 
            className="text-center px-1 w-full"
            style={{
              maxWidth: '100px'
            }}
          >
            <div 
              className="text-xs font-medium text-white truncate leading-tight group-hover:bg-[#0061D5] group-hover:rounded px-1.5 py-0.5 inline-block"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div 
                className="text-[10px] text-white/80 truncate mt-0.5"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
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

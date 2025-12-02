import React from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useDesktop } from '../../contexts/DesktopContext';

const Window = ({ appId, title, icon, children, minWidth = 400, minHeight = 300 }) => {
  const {
    windows,
    focusedWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize
  } = useDesktop();

  const window = windows[appId];
  if (!window || !window.isOpen || window.isMinimized) return null;

  const isFocused = focusedWindow === appId;
  const isMaximized = window.isMaximized;

  return (
    <Rnd
      size={isMaximized ? { width: '100%', height: '100%' } : window.size}
      position={isMaximized ? { x: 0, y: 0 } : window.position}
      onDragStop={(e, d) => {
        if (!isMaximized) {
          updateWindowPosition(appId, { x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMaximized) {
          updateWindowSize(appId, {
            width: ref.offsetWidth,
            height: ref.offsetHeight
          });
          updateWindowPosition(appId, position);
        }
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      style={{ zIndex: window.zIndex }}
      className={`absolute ${isFocused ? 'shadow-2xl' : 'shadow-lg'}`}
    >
      <div
        className={`h-full flex flex-col overflow-hidden transition-all duration-200 ${
          isFocused ? 'shadow-2xl' : 'shadow-xl'
        }`}
        style={{
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: isFocused 
            ? '0 20px 50px rgba(0,0,0,0.3)' 
            : '0 10px 30px rgba(0,0,0,0.15)'
        }}
        onClick={() => focusWindow(appId)}
      >
        {/* Catalina Title Bar */}
        <div 
          className="window-drag-handle flex items-center justify-between px-4 py-3 cursor-move select-none relative"
          style={{
            backgroundColor: isFocused ? '#f6f6f6' : '#f6f6f6',
            borderBottom: '1px solid #e1e1e1',
            height: '38px',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px'
          }}
        >
          {/* Traffic Light Buttons (left side) */}
          <div className="flex items-center space-x-2 group">
            {/* Close - Red */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(appId);
              }}
              className="w-3 h-3 rounded-full relative transition-all duration-150"
              style={{
                backgroundColor: '#ff5f56',
                border: '0.5px solid rgba(0,0,0,0.1)',
              }}
              aria-label="Close"
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/50">×</span>
            </button>
            
            {/* Minimize - Yellow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(appId);
              }}
              className="w-3 h-3 rounded-full relative transition-all duration-150"
              style={{
                backgroundColor: '#ffbd2e',
                border: '0.5px solid rgba(0,0,0,0.1)',
              }}
              aria-label="Minimize"
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/50">−</span>
            </button>
            
            {/* Zoom - Green */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(appId);
              }}
              className="w-3 h-3 rounded-full relative transition-all duration-150"
              style={{
                backgroundColor: '#27c93f',
                border: '0.5px solid rgba(0,0,0,0.1)',
              }}
              aria-label="Zoom"
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/50">+</span>
            </button>
          </div>
          
          {/* Window Title (centered) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1.5">
            {icon && <span className={isFocused ? 'opacity-90' : 'opacity-50'}>{icon}</span>}
            <span 
              className="text-sm font-medium tracking-tight"
              style={{
                color: isFocused ? '#333' : '#888',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              {title}
            </span>
          </div>
          
          {/* Empty space for symmetry */}
          <div className="w-14"></div>
        </div>

        {/* Window Content */}
        <div 
          className="flex-1 overflow-auto relative bg-white dark:bg-gray-900"
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
};

export default Window;

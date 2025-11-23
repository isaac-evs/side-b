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
          isFocused ? 'shadow-2xl' : 'shadow-md'
        }`}
        style={{
          background: 'linear-gradient(to bottom, #e8e8e8 0%, #f5f5f5 100%)',
          border: '1px solid rgba(0,0,0,0.3)',
          borderRadius: '8px',
          boxShadow: isFocused 
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)' 
            : '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
        onClick={() => focusWindow(appId)}
      >
        {/* Title Bar with Aqua gradient */}
        <div 
          className="window-drag-handle flex items-center justify-between px-3 py-1.5 cursor-move select-none relative overflow-hidden"
          style={{
            background: isFocused
              ? 'linear-gradient(to bottom, #c8d5e5 0%, #9bb0cc 50%, #7a94b8 50%, #6382b0 100%)'
              : 'linear-gradient(to bottom, #ececec 0%, #d5d5d5 50%, #bebebe 50%, #b0b0b0 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
            minHeight: '22px'
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
              className="w-3 h-3 rounded-full relative transition-all duration-150 hover:brightness-110"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ff5f52, #e33e32)',
                border: '0.5px solid rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.3)'
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
              className="w-3 h-3 rounded-full relative transition-all duration-150 hover:brightness-110"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ffbd2e, #f5a623)',
                border: '0.5px solid rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.3)'
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
              className="w-3 h-3 rounded-full relative transition-all duration-150 hover:brightness-110"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #28ca42, #1fa735)',
                border: '0.5px solid rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.3)'
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
              className="text-xs font-semibold tracking-tight"
              style={{
                color: isFocused ? '#000' : '#666',
                textShadow: isFocused ? '0 1px 0 rgba(255,255,255,0.8)' : '0 1px 0 rgba(255,255,255,0.5)',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
              }}
            >
              {title}
            </span>
          </div>
          
          {/* Empty space for symmetry */}
          <div className="w-20"></div>
        </div>

        {/* Window Content with Pinstripes */}
        <div 
          className="flex-1 overflow-auto relative"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px)',
            backgroundSize: '100% 2px',
            backgroundColor: '#f5f5f5'
          }}
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
};

export default Window;

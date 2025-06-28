// [NEW] src/components/common/StyledCrossfader.jsx

import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

const StyledCrossfader = ({ value, onChange, className = '' }) => {
  const trackRef = useRef(null);

  const handleInteraction = useCallback((e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const newValue = (x / rect.width) * 100;
    onChange(newValue);
  }, [onChange]);

  const handlePointerDown = useCallback((e) => {
    handleInteraction(e); // Handle initial click
    const handlePointerMove = (moveEvent) => handleInteraction(moveEvent);
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [handleInteraction]);

  const knobPosition = `${value}%`;

  return (
    <div 
      className={`flex items-center gap-3 text-gray-400 font-bold text-sm ${className}`}
      onPointerDown={handlePointerDown}
    >
      <span>L</span>
      <div 
        ref={trackRef}
        className="relative w-full h-2 bg-black/50 rounded-full cursor-pointer"
      >
        <div className="absolute top-0 left-0 h-full bg-gray-700 rounded-full" style={{ width: knobPosition }}></div>
        <div 
          className="absolute top-1/2 w-5 h-8 bg-gray-300 border-2 border-gray-900 rounded-sm shadow-lg -translate-y-1/2 -translate-x-1/2"
          style={{ left: knobPosition }}
        >
          <div className="h-full w-px bg-gray-500 mx-auto"></div>
        </div>
      </div>
      <span>R</span>
    </div>
  );
};

StyledCrossfader.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default StyledCrossfader;
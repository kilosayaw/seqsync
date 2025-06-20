import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const TactileJoystick = ({ onNudge, deadzone = 0.1 }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  
  const handleInteraction = useCallback((e) => {
    if (!joystickRef.current || !onNudge) return;
    e.preventDefault();

    const rect = joystickRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate normalized XY coordinates from -1 to 1
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = (((clientY - rect.top) / rect.height) * 2 - 1) * -1; // Invert Y-axis

    const distance = Math.sqrt(x*x + y*y);
    const clampedDist = Math.min(1, distance);

    const normX = clampedDist > deadzone ? (x / distance) * clampedDist : 0;
    const normY = clampedDist > deadzone ? (y / distance) * clampedDist : 0;

    // Nudge based on the vector. The parent component will determine the step amount.
    onNudge(normX, normY);

    if (knobRef.current) {
        knobRef.current.style.transform = `translate(${normX * (rect.width/4)}px, ${-normY * (rect.height/4)}px)`;
    }
  }, [onNudge, deadzone]);
  
  const handlePointerUp = useCallback(() => {
    document.removeEventListener('pointermove', handleInteraction);
    document.removeEventListener('pointerup', handlePointerUp);
    if (knobRef.current) {
        knobRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, [handleInteraction]);

  const handlePointerDown = useCallback((e) => {
    handleInteraction(e);
    document.addEventListener('pointermove', handleInteraction);
    document.addEventListener('pointerup', handlePointerUp);
  }, [handleInteraction, handlePointerUp]);

  return (
    <div
      ref={joystickRef}
      onPointerDown={handlePointerDown}
      className="w-24 h-24 bg-gray-900/50 rounded-full flex items-center justify-center relative cursor-pointer border-2 border-gray-700/80 shadow-inner"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute w-full h-px bg-gray-600/50"></div>
      <div className="absolute h-full w-px bg-gray-600/50"></div>
      <div
        ref={knobRef}
        className="w-8 h-8 bg-pos-yellow rounded-full shadow-lg transition-transform duration-100 ease-out pointer-events-none ring-2 ring-black/50"
      ></div>
    </div>
  );
};

TactileJoystick.propTypes = {
  onNudge: PropTypes.func.isRequired,
  deadzone: PropTypes.number,
};

export default TactileJoystick;
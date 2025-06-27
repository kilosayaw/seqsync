import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

// This is now a self-contained, VISIBLE joystick component.
const FootJoystickOverlay = ({ side, onGroundingChange, onVectorChange, initialVector }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((e) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    let x = clientX - rect.left - rect.width / 2;
    let y = clientY - rect.top - rect.height / 2;
    const radius = rect.width / 2;
    const distance = Math.sqrt(x * x + y * y);

    if (distance > radius) {
      x = (x / distance) * radius;
      y = (y / distance) * radius;
    }

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }

    // Normalize vector to -1 to 1 range for pose data
    const vector = { x: x / radius, y: y / radius };
    
    // Call the appropriate handler
    if (onVectorChange) {
      onVectorChange(side, vector);
    } else if (onGroundingChange) {
      // Future logic for converting vector to grounding points would go here
      // For now, we pass a placeholder
      onGroundingChange(side, [`${side}P${vector.x.toFixed(2)},${vector.y.toFixed(2)}`]);
    }

  }, [onGroundingChange, onVectorChange, side]);

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    handleInteraction(e);
  }, [handleInteraction]);

  const handlePointerMove = useCallback((e) => {
    if (isDragging) {
      handleInteraction(e);
    }
  }, [isDragging, handleInteraction]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    // Optionally reset vector on release, or keep last position
  }, []);

  return (
    <div
      ref={joystickRef}
      className="w-40 h-40 bg-gray-900/50 rounded-full flex items-center justify-center relative cursor-pointer border-2 border-gray-700"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <div className="absolute w-full h-px bg-gray-700"></div>
      <div className="absolute h-full w-px bg-gray-700"></div>
      <div
        ref={knobRef}
        className="w-10 h-10 bg-pos-yellow rounded-full shadow-lg transition-transform duration-75 ease-out"
      ></div>
    </div>
  );
};

FootJoystickOverlay.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  onGroundingChange: PropTypes.func,
  onVectorChange: PropTypes.func,
  initialVector: PropTypes.object,
};

export default FootJoystickOverlay;
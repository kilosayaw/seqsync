import React, { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const GroundingJoystick = ({ onZoneChange, zones }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);

  const getZoneFromAngle = useCallback((angle) => {
    const wrapAroundZone = zones.find(z => z.minAngle > z.maxAngle);
    if (wrapAroundZone && (angle >= wrapAroundZone.minAngle || angle < wrapAroundZone.maxAngle)) {
        return wrapAroundZone;
    }
    return zones.find(z => angle >= z.minAngle && angle < z.maxAngle) || null;
  }, [zones]);
  
  const handleInteraction = useCallback((e) => {
    if (!joystickRef.current) return;
    e.preventDefault();
    const rect = joystickRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const normX = ((x / rect.width) * 2) - 1;
    const normY = ((y / rect.height) * 2) - 1;

    let angle = (Math.atan2(normY, normX) * (180 / Math.PI) + 360) % 360;

    const zone = getZoneFromAngle(angle);
    onZoneChange(zone ? zone.notation : null);

    if (knobRef.current) {
        const knobRadius = rect.width / 2;
        knobRef.current.style.transform = `translate(${normX * knobRadius * 0.5}px, ${normY * knobRadius * 0.5}px)`;
    }
  }, [getZoneFromAngle, onZoneChange]);
  
  const handlePointerUp = useCallback(() => {
    document.removeEventListener('pointermove', handleInteraction);
    document.removeEventListener('pointerup', handlePointerUp);
    // On mouse up, we do NOT reset the value, making the selection persistent.
    // We can reset the knob's visual position for feedback if desired.
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
      className="w-20 h-20 bg-gray-900/50 rounded-full flex items-center justify-center relative cursor-pointer border-2 border-gray-700/80 shadow-inner"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute w-full h-px bg-gray-600/50"></div>
      <div className="absolute h-full w-px bg-gray-600/50"></div>
      <div
        ref={knobRef}
        className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg transition-transform duration-100 ease-out pointer-events-none ring-2 ring-black/50"
      ></div>
    </div>
  );
};

GroundingJoystick.propTypes = {
  onZoneChange: PropTypes.func.isRequired,
  zones: PropTypes.array.isRequired,
};

export default GroundingJoystick;
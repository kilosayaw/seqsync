// src/components/core/pose_editor/KneeJoystick.jsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { clampVector } from "../../../utils/biomechanics";

const KneeJoystick = ({ initialVector = { x: 0, y: 0, z: 0 }, onVectorChange, bounds }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update knob position based on the vector prop
  useEffect(() => {
    if (knobRef.current) {
      const knobX = (initialVector.x * 50) + 50; // Map -1 to 1 -> 0 to 100
      const knobY = (-initialVector.z * 50) + 50; // Map -1 to 1 -> 0 to 100 for Z->Y axis
      knobRef.current.style.left = `${knobX}%`;
      knobRef.current.style.top = `${knobY}%`;
    }
  }, [initialVector]);

  const handleInteraction = useCallback((e) => {
    if (!joystickRef.current) return;
    
    e.preventDefault();
    const rect = joystickRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Normalize coordinates to a -1 to 1 range
    let vecX = ((x / rect.width) * 2) - 1;
    let vecZ = -(((y / rect.height) * 2) - 1); // Invert Y-axis for intuitive forward control

    const newVector = { x: vecX, y: initialVector.y, z: vecZ }; // Preserve Y
    
    // Clamp the vector based on the biomechanical bounds
    const clampedVec = clampVector(newVector, bounds);
    
    onVectorChange(clampedVec);

  }, [bounds, onVectorChange, initialVector.y]);

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    handleInteraction(e);
    window.addEventListener('pointermove', handleInteraction);
    window.addEventListener('pointerup', handlePointerUp);
  }, [handleInteraction]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handleInteraction);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handleInteraction]);

  return (
    <div className="w-full space-y-2">
        <label className="text-sm font-semibold text-gray-300">Knee Position (Relative to Foot)</label>
        <div 
            ref={joystickRef}
            onPointerDown={handlePointerDown}
            className="w-full aspect-square bg-gray-900/50 border-2 border-gray-700 rounded-lg cursor-pointer relative touch-none shadow-inner"
        >
            {/* Center lines */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-600/50"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-gray-600/50"></div>
            
            {/* Knob */}
            <div 
                ref={knobRef}
                className="absolute w-6 h-6 -ml-3 -mt-3 bg-brand-accent rounded-full border-2 border-gray-900 shadow-lg pointer-events-none"
            ></div>
        </div>
        <div className="text-center text-xs text-gray-400 font-mono">
            X: {initialVector.x.toFixed(2)} | Z: {initialVector.z.toFixed(2)}
        </div>
    </div>
  );
};

KneeJoystick.propTypes = {
  initialVector: PropTypes.object,
  onVectorChange: PropTypes.func.isRequired,
  bounds: PropTypes.object.isRequired,
};

export default KneeJoystick;
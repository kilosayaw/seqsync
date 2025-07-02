import { useState, useRef, useCallback, useEffect } from 'react';

export const useRotaryDrag = (onDragEnd) => {
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const centerRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    const rad = Math.atan2(dy, dx);
    const deg = rad * (180 / Math.PI);
    setAngle(deg + 90);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) {
        setAngle(currentAngle => {
            onDragEnd(currentAngle);
            return currentAngle;
        });
      }
    }
  }, [isDragging, onDragEnd]);
  
  const handleMouseDown = useCallback((e) => {
    // Stop event propagation to prevent joystick from firing
    e.stopPropagation(); 
    
    setIsDragging(true);
    // Find the absolute center of the SVG viewport to calculate angle from
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { angle, setAngle, handleMouseDown };
};
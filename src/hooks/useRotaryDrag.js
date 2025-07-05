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
    setAngle(deg + 90); // +90 to align 0 degrees to the top
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // On release, call the provided callback with the final angle
      if (onDragEnd) {
        setAngle(currentAngle => {
            onDragEnd(currentAngle);
            return currentAngle;
        });
      }
    }
  }, [isDragging, onDragEnd]);
  
  const handleMouseDown = useCallback((e) => {
    e.stopPropagation(); 
    setIsDragging(true);
    // Calculate the center of the SVG element at the start of the drag
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
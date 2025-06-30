import { useState, useRef, useCallback, useEffect } from 'react';

export const useRotaryDrag = (onDragEnd) => { // Accept a callback
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);
  
  // This function is for live visual updates during the drag
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !nodeRef.current) return;
    const rect = nodeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const rad = Math.atan2(dy, dx);
    let deg = rad * (180 / Math.PI);
    setAngle(deg + 90);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // NEW: When the drag ends, call the provided callback with the final angle.
    if (onDragEnd) {
        // We capture the final angle using a functional update to ensure we have the latest value
        setAngle(currentAngle => {
            onDragEnd(currentAngle);
            return currentAngle;
        });
    }
  }, [onDragEnd]);
  
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { angle, setAngle, nodeRef, handleMouseDown }; // Expose setAngle for initial state
};
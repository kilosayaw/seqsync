import { useRef, useCallback, useEffect } from 'react';

export const useTurntableDrag = (angle, setAngle, onDragEnd) => {
  const isDraggingRef = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    const rad = Math.atan2(dy, dx);
    const deg = rad * (180 / Math.PI);
    setAngle(deg + 90);
  }, [setAngle]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (onDragEnd) {
            onDragEnd(angle);
        }
    }
  }, [angle, onDragEnd]);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  useEffect(() => {
    const mouseUpListener = () => handleMouseUp();
    const mouseMoveListener = (e) => handleMouseMove(e);

    if (isDraggingRef.current) {
        window.addEventListener('mousemove', mouseMoveListener);
        window.addEventListener('mouseup', mouseUpListener);
    }
    
    return () => {
        window.removeEventListener('mousemove', mouseMoveListener);
        window.removeEventListener('mouseup', mouseUpListener);
    };
  }, [handleMouseMove, handleMouseUp]);

  return { handleMouseDown };
};
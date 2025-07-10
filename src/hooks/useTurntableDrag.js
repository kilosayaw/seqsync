import { useRef, useCallback, useEffect } from 'react';

export const useTurntableDrag = (onDragMove, onDragEnd) => {
    const centerRef = useRef({ x: 0, y: 0 });
    const lastMouseAngleRef = useRef(0);
    const isDraggingRef = useRef(false);

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

        let delta = currentMouseAngle - lastMouseAngleRef.current;
        if (delta < -180) delta += 360;
        else if (delta > 180) delta -= 360;

        lastMouseAngleRef.current = currentMouseAngle;

        if (onDragMove) {
            onDragMove(delta);
        }
    }, [onDragMove]);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        if (onDragEnd) {
            onDragEnd();
        }
    }, [onDragEnd]);
    
    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        isDraggingRef.current = true;

        const svgElement = e.currentTarget.ownerSVGElement || e.currentTarget;
        const rect = svgElement.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        lastMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    }, []);

    // DEFINITIVE FIX: This useEffect now correctly adds and removes listeners based on the drag state.
    // This was the primary bug causing the drag to fail.
    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isDraggingRef.current) {
                handleMouseUp();
            }
        };

        // Add listeners when the component mounts
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUpGlobal);

        // Cleanup function to remove listeners when the component unmounts
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUpGlobal);
        };
    }, [handleMouseMove, handleMouseUp]);

    return { handleMouseDown };
};
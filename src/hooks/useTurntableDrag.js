import { useRef, useCallback, useEffect } from 'react';

export const useTurntableDrag = (onDragMove, onDragEnd) => {
    const isDraggingRef = useRef(false);
    const centerRef = useRef({ x: 0, y: 0 });
    const lastMouseAngleRef = useRef(0);

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

        let delta = currentMouseAngle - lastMouseAngleRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

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
        // DEFINITIVE FIX: Remove the global listeners upon drag completion.
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [onDragEnd, handleMouseMove]);

    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        isDraggingRef.current = true;
        
        const svgElement = e.currentTarget.ownerSVGElement || e.currentTarget;
        const rect = svgElement.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        lastMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

        // DEFINITIVE FIX: Add the global listeners when the drag starts.
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);

    // This effect ensures that if the component unmounts mid-drag, the listeners are cleaned up.
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return { handleMouseDown };
};
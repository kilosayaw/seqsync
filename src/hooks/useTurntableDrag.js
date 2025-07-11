// src/hooks/useTurntableDrag.js
import { useState, useEffect, useRef, useCallback } from 'react';

const FRICTION = 0.95; 
const MIN_VELOCITY = 0.05;

export const useTurntableDrag = (initialAngle, onDragEnd) => {
    const [angle, setAngle] = useState(initialAngle);
    // DEFINITIVE: 'delta' is now managed inside the component that uses the hook.
    const [isDragging, setIsDragging] = useState(false);
    
    const velocityRef = useRef(0);
    const animationFrameRef = useRef();
    const centerRef = useRef({ x: 0, y: 0 });
    const lastMouseAngleRef = useRef(0);
    const hasMovedRef = useRef(false);

    useEffect(() => {
        if (!isDragging) {
            setAngle(initialAngle);
        }
    }, [initialAngle, isDragging]);

    const animate = useCallback(() => {
        if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
            cancelAnimationFrame(animationFrameRef.current);
            velocityRef.current = 0;
            if (onDragEnd && hasMovedRef.current) {
                setAngle(currentAngle => {
                    onDragEnd(currentAngle, 0); // Pass 0 for delta when animation ends
                    return currentAngle;
                });
            }
            return;
        }

        const newAngle = angle + velocityRef.current;
        setAngle(newAngle);
        if (onDragEnd) onDragEnd(newAngle, velocityRef.current); // Pass velocity as delta during spin

        velocityRef.current *= FRICTION;
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [onDragEnd, angle]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        hasMovedRef.current = true;
        
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

        let angleDelta = currentMouseAngle - lastMouseAngleRef.current;
        if (angleDelta < -180) angleDelta += 360;
        else if (angleDelta > 180) angleDelta -= 360;

        const newAngle = angle + angleDelta;
        setAngle(newAngle);
        velocityRef.current = angleDelta;
        lastMouseAngleRef.current = currentMouseAngle;
        
        // Fire the callback on every move while dragging
        if (onDragEnd) onDragEnd(newAngle, angleDelta);

    }, [isDragging, angle, onDragEnd]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                if (onDragEnd && hasMovedRef.current) {
                    onDragEnd(angle, 0);
                }
            }
        }
    }, [isDragging, animate, onDragEnd, angle]);
    
    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        setIsDragging(true);
        hasMovedRef.current = false;
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;
        
        const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
        centerRef.current = { 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2,
        };

        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        lastMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
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

    return { angle, handleMouseDown };
};
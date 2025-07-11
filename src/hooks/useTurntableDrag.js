import { useState, useEffect, useRef, useCallback } from 'react';

const FRICTION = 0.95; // Controls how quickly the spin slows down (0.9 is fast, 0.99 is slow)
const MIN_VELOCITY = 0.05; // How slow the spin can be before it stops completely

export const useTurntableDrag = (initialAngle, onDragEnd) => {
    const [angle, setAngle] = useState(initialAngle);
    const [isDragging, setIsDragging] = useState(false);
    
    const velocityRef = useRef(0);
    const animationFrameRef = useRef();
    const centerRef = useRef({ x: 0, y: 0 });
    const lastMouseAngleRef = useRef(0);
    const hasMovedRef = useRef(false);

    // When the initialAngle from props changes (e.g., selecting a new pad),
    // update the component's angle, but only if the user isn't currently dragging.
    useEffect(() => {
        if (!isDragging) {
            setAngle(initialAngle);
        }
    }, [initialAngle, isDragging]);

    // The animation loop for the inertial spin
    const animate = useCallback(() => {
        if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
            cancelAnimationFrame(animationFrameRef.current);
            velocityRef.current = 0;
            if (onDragEnd && hasMovedRef.current) {
                // Use a functional update to get the most recent angle
                setAngle(currentAngle => {
                    onDragEnd(currentAngle);
                    return currentAngle;
                });
            }
            return;
        }

        setAngle(prevAngle => prevAngle + velocityRef.current);
        velocityRef.current *= FRICTION;
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [onDragEnd]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        hasMovedRef.current = true;
        
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

        let angleDelta = currentMouseAngle - lastMouseAngleRef.current;
        if (angleDelta < -180) angleDelta += 360;
        else if (angleDelta > 180) angleDelta -= 360;

        setAngle(prevAngle => prevAngle + angleDelta);
        velocityRef.current = angleDelta; // Set the velocity for the inertia effect
        lastMouseAngleRef.current = currentMouseAngle;
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            // If there's enough velocity, start the animation.
            if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                // If there was no significant spin, fire the callback immediately.
                if (onDragEnd && hasMovedRef.current) {
                    onDragEnd(angle);
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
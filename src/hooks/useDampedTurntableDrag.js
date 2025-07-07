// src/hooks/useDampedTurntableDrag.js

import { useRef, useCallback, useEffect, useState } from 'react';

const DAMPING_FACTOR = 0.95;
const VELOCITY_THRESHOLD = 0.05;

// The hook now receives the initialAngle and an onDragEnd callback.
// It no longer needs the main `setAngle` function passed to it.
export const useDampedTurntableDrag = (initialAngle, onDragEnd) => {
    const [isDragging, setIsDragging] = useState(false);
    // NEW: The hook now manages its own internal angle for animation.
    const [internalAngle, setInternalAngle] = useState(initialAngle);

    const velocityRef = useRef(0);
    const centerRef = useRef({ x: 0, y: 0 });
    const lastAngleRef = useRef(initialAngle);
    const startAngleRef = useRef(0);
    const startMouseAngleRef = useRef(0);
    const animationFrameRef = useRef();

    // Sync internal angle when the initial prop changes
    useEffect(() => {
        setInternalAngle(initialAngle);
    }, [initialAngle]);

    const animate = useCallback(() => {
        // Use a functional update for the internal state
        setInternalAngle(prev => {
            const newAngle = prev + velocityRef.current;
            velocityRef.current *= DAMPING_FACTOR;

            if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                velocityRef.current = 0;
                // Animation is finished, call the final save function.
                if (onDragEnd) {
                    onDragEnd(newAngle);
                }
            }
            return newAngle;
        });
    }, [onDragEnd]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        const mouseAngleDelta = currentMouseAngle - startMouseAngleRef.current;
        const newAngle = startAngleRef.current + mouseAngleDelta;
        
        let delta = newAngle - lastAngleRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        
        velocityRef.current = delta;
        lastAngleRef.current = newAngle;
        setInternalAngle(newAngle); // Update the internal angle directly
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // Start the physics animation on mouse up
        if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            // If not spinning, save the final position immediately.
            if (onDragEnd) {
                onDragEnd(internalAngle);
            }
        }
    }, [isDragging, animate, onDragEnd, internalAngle]);

    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;
        setIsDragging(true);

        const rect = e.currentTarget.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        
        startAngleRef.current = internalAngle;
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        startMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        lastAngleRef.current = internalAngle;
    }, [internalAngle]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Return the internal angle for rendering, and the mousedown handler
    return { angle: internalAngle, handleMouseDown };
};
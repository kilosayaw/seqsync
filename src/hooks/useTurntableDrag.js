// src/hooks/useTurntableDrag.js
import { useState, useEffect, useRef, useCallback } from 'react';

// Constants for the physics simulation
const FRICTION = 0.95; // How quickly the spin slows down (0.9 is fast, 0.99 is slow)
const MIN_VELOCITY = 0.05; // The rotational speed below which the animation stops

export const useTurntableDrag = (initialAngle, onDragEnd) => {
    const [angle, setAngle] = useState(initialAngle);
    const [isDragging, setIsDragging] = useState(false);
    
    // Using refs to store values that don't need to trigger a re-render
    const velocityRef = useRef(0);
    const animationFrameRef = useRef();
    const centerRef = useRef({ x: 0, y: 0 });
    const lastMouseAngleRef = useRef(0);

    // Effect to reset the visual angle if the underlying data changes (e.g., user selects a new pad)
    useEffect(() => {
        // Only reset the angle if the user is not actively dragging it
        if (!isDragging) {
            setAngle(initialAngle);
        }
    }, [initialAngle, isDragging]);

    // The animation loop for the "friction" spin
    const animate = useCallback(() => {
        animationFrameRef.current = requestAnimationFrame(() => {
            setAngle(prevAngle => {
                const newAngle = prevAngle + velocityRef.current;
                velocityRef.current *= FRICTION; // Apply friction to slow down the spin

                // If the spin is too slow, stop the animation and call the final callback
                if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
                    if (onDragEnd) onDragEnd(newAngle);
                    // Return the final resting angle
                    return newAngle;
                }
                
                animate(); // Request the next frame to continue the animation
                return newAngle;
            });
        });
    }, [onDragEnd]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        
        // Calculate the angle of the mouse relative to the center of the turntable
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        
        // Calculate the change in angle, accounting for wrapping around 360 degrees
        let delta = currentMouseAngle - lastMouseAngleRef.current;
        if (delta < -180) delta += 360;
        else if (delta > 180) delta -= 360;
        
        setAngle(prevAngle => prevAngle + delta);
        velocityRef.current = delta; // The velocity is the change in angle since the last frame
        lastMouseAngleRef.current = currentMouseAngle;
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            // If there's enough velocity, start the friction animation
            if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
                animate();
            } else {
                // Otherwise, just call the final callback immediately
                if (onDragEnd) onDragEnd(angle);
            }
        }
    }, [isDragging, animate, onDragEnd, angle]);
    
    const handleMouseDown = useCallback((e) => {
        e.stopPropagation(); // Prevent other elements from responding to the click
        setIsDragging(true);
        cancelAnimationFrame(animationFrameRef.current); // Stop any ongoing spin animation
        velocityRef.current = 0;
        
        // Calculate the center of the SVG element for accurate angle calculations
        const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        
        // Calculate the initial mouse angle
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        lastMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    }, []);

    // Effect to add and remove global event listeners for mouse move/up
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
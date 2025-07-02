import { useState, useRef, useCallback, useEffect } from 'react';

// --- PHYSICS CONSTANTS (Tunable for "feel") ---
const FRICTION = 0.95; // Damping factor.
const MIN_VELOCITY = 0.01; // The speed at which we consider the wheel to be stopped.
const VELOCITY_MULTIPLIER = 1.0; // Keep this at 1 for now, as velocity is now more direct.

export const useTurntableDrag = (onDragEnd, initialAngle = 0) => {
    const [angle, setAngle] = useState(initialAngle);
    const [isDragging, setIsDragging] = useState(false);
    
    // --- REFS FOR PHYSICS & STATE TRACKING ---
    const velocityRef = useRef(0);
    const animationFrameRef = useRef();
    const centerRef = useRef({ x: 0, y: 0 });

    // NEW: This ref is now the key to tracking continuous rotation.
    const lastMouseAngleRef = useRef(0);

    // Sync external angle changes only when not interacting
    useEffect(() => {
        if (!isDragging && Math.abs(velocityRef.current) < MIN_VELOCITY) {
            setAngle(initialAngle);
        }
    }, [initialAngle, isDragging]);

    // The animation loop for momentum and friction remains largely the same.
    const animate = useCallback(() => {
        const newVelocity = velocityRef.current * FRICTION;
        velocityRef.current = newVelocity;

        if (Math.abs(newVelocity) < MIN_VELOCITY) {
            velocityRef.current = 0;
            setAngle(currentAngle => {
                onDragEnd(currentAngle);
                return currentAngle;
            });
            cancelAnimationFrame(animationFrameRef.current);
            return;
        }
        
        setAngle(prevAngle => prevAngle + newVelocity);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [onDragEnd]);

    // CORE LOGIC UPDATE: This function is completely re-engineered for cumulative tracking.
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        
        // Calculate current mouse angle relative to the center
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;

        // Calculate the delta from the *last frame's* mouse angle.
        let delta = currentMouseAngle - lastMouseAngleRef.current;
        
        // This is the "angle wrapping" logic. It ensures smooth rotation
        // when the cursor crosses the 180/-180 degree boundary.
        if (delta < -180) {
            delta += 360;
        } else if (delta > 180) {
            delta -= 360;
        }

        // Apply the calculated delta to the current angle to get the new cumulative angle.
        setAngle(prevAngle => prevAngle + delta);
        
        // Update velocity based on this frame's movement
        velocityRef.current = delta * VELOCITY_MULTIPLIER;
        
        // Update the last mouse angle for the next frame's calculation.
        lastMouseAngleRef.current = currentMouseAngle;
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                onDragEnd(angle);
            }
        }
    }, [isDragging, animate, onDragEnd, angle]);
    
    // LOGIC UPDATE: This function now just "primes the pump" for the mouse move calculation.
    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        setIsDragging(true);
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;

        const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
        centerRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };

        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        // Set the initial mouse angle to establish a reference point.
        lastMouseAngleRef.current = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
        
    }, []);

    // Effect to manage global event listeners remains the same.
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
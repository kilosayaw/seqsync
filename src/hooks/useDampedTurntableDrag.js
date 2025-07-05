import { useRef, useCallback, useEffect, useState } from 'react';

const DAMPING_FACTOR = 0.95;
const VELOCITY_THRESHOLD = 0.05;

export const useDampedTurntableDrag = (angle, setAngle, onDragEnd) => {
    const [isDragging, setIsDragging] = useState(false);
    
    const centerRef = useRef({ x: 0, y: 0 });
    const velocityRef = useRef(0);
    const lastAngleRef = useRef(angle);
    const startAngleRef = useRef(0);
    const startMouseAngleRef = useRef(0);
    const animationFrameRef = useRef();

    const animate = useCallback(() => {
        if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
            setAngle(prev => prev + velocityRef.current);
            velocityRef.current *= DAMPING_FACTOR;
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            velocityRef.current = 0;
            if (onDragEnd) {
                setAngle(latestAngle => {
                    onDragEnd(latestAngle);
                    return latestAngle;
                });
            }
        }
    }, [setAngle, onDragEnd]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;

        const mouseAngleDelta = currentMouseAngle - startMouseAngleRef.current;
        let newAngle = startAngleRef.current + mouseAngleDelta;
        
        let delta = newAngle - lastAngleRef.current;
        // Handle angle wrapping for smooth velocity calculation
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        
        velocityRef.current = delta;
        lastAngleRef.current = newAngle;
        setAngle(newAngle);
    }, [isDragging, setAngle]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;
        setIsDragging(true);

        const rect = e.currentTarget.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        
        startAngleRef.current = angle;
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        startMouseAngleRef.current = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
        lastAngleRef.current = angle;
    }, [angle]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, animate]);

    return { handleMouseDown };
};
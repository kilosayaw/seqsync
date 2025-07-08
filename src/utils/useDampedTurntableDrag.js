// src/hooks/useDampedTurntableDrag.js

import { useRef, useCallback, useEffect, useState } from 'react';

const DAMPING_FACTOR = 0.96;
const VELOCITY_THRESHOLD = 0.05;

export const useDampedTurntableDrag = (initialAngle, onAngleChange, onDragEnd) => {
    const [isDragging, setIsDragging] = useState(false);
    const [displayAngle, setDisplayAngle] = useState(initialAngle);

    const velocityRef = useRef(0);
    const centerRef = useRef({ x: 0, y: 0 });
    const lastAngleRef = useRef(initialAngle);
    const startAngleRef = useRef(0);
    const startMouseAngleRef = useRef(0);
    const animationFrameRef = useRef();

    useEffect(() => {
        if (!isDragging && velocityRef.current === 0) {
            setDisplayAngle(initialAngle);
        }
    }, [initialAngle, isDragging]);

    const animate = useCallback(() => {
        const newAngle = displayAngle + velocityRef.current;
        velocityRef.current *= DAMPING_FACTOR;
        
        onAngleChange(newAngle); // Provide live updates during animation
        setDisplayAngle(newAngle);

        if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            velocityRef.current = 0;
            if (onDragEnd) onDragEnd(newAngle);
        }
    }, [displayAngle, onAngleChange, onDragEnd]);

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
        
        onAngleChange(newAngle); // Provide live updates during drag
        setDisplayAngle(newAngle);
    }, [isDragging, onAngleChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            if (onDragEnd) onDragEnd(displayAngle);
        }
    }, [isDragging, animate, onDragEnd, displayAngle]);

    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;
        setIsDragging(true);

        const rect = e.currentTarget.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        
        startAngleRef.current = displayAngle;
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        startMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        lastAngleRef.current = displayAngle;
    }, [displayAngle]);

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

    return { angle: displayAngle, handleMouseDown };
};
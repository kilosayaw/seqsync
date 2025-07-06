// src/hooks/useDampedTurntableDrag.js
import { useRef, useCallback, useEffect, useState } from 'react';

const DAMPING_FACTOR = 0.95;
const VELOCITY_THRESHOLD = 0.05;

export const useDampedTurntableDrag = (angle, setAngle, onDragEnd) => {
    const isDraggingRef = useRef(false);
    const centerRef = useRef({ x: 0, y: 0 });
    const velocityRef = useRef(0);
    const lastAngleRef = useRef(angle);
    const startAngleRef = useRef(0);
    const startMouseAngleRef = useRef(0);
    const animationFrameRef = useRef();

    const animate = useCallback(() => {
        if (Math.abs(velocityRef.current) > VELOCITY_THRESHOLD) {
            lastAngleRef.current += velocityRef.current;
            setAngle(lastAngleRef.current);
            velocityRef.current *= DAMPING_FACTOR;
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            velocityRef.current = 0;
            if (onDragEnd) {
                // THE FIX: Call onDragEnd with the *final* stable angle.
                console.log(`%c[DragHook] Animation finished. Calling onDragEnd with final angle: ${lastAngleRef.current.toFixed(2)}`, 'color: cyan');
                onDragEnd(lastAngleRef.current);
            }
        }
    }, [setAngle, onDragEnd]);

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;

        const mouseAngleDelta = currentMouseAngle - startMouseAngleRef.current;
        const newAngle = startAngleRef.current + mouseAngleDelta;
        
        const delta = newAngle - lastAngleRef.current;
        velocityRef.current = (delta > 180) ? delta - 360 : (delta < -180) ? delta + 360 : delta;
        
        lastAngleRef.current = newAngle;
        setAngle(newAngle);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (!isDraggingRef.current) return;
        console.log('[DragHook] Mouse Up detected. Ending drag.');
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [handleMouseMove, animate]);

    const handleMouseDown = useCallback((e) => {
        console.log('%c[DragHook] Mouse Down on wheel. Starting drag.', 'color: orange;');
        e.stopPropagation();
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;
        isDraggingRef.current = true;

        const rect = e.currentTarget.getBoundingClientRect();
        centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        
        startAngleRef.current = angle;
        lastAngleRef.current = angle;
        const dx = e.clientX - centerRef.current.x;
        const dy = e.clientY - centerRef.current.y;
        startMouseAngleRef.current = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [angle, handleMouseMove, handleMouseUp]);

    return { handleMouseDown };
};
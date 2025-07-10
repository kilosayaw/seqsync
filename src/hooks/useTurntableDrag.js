// src/hooks/useTurntableDrag.js
import { useState, useEffect, useRef, useCallback } from 'react';

const FRICTION = 0.95; 
const MIN_VELOCITY = 0.05;

export const useTurntableDrag = (initialAngle, onDragEnd) => {
    const [angle, setAngle] = useState(initialAngle);
    const [isDragging, setIsDragging] = useState(false);
    const [delta, setDelta] = useState(0);
    
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
        setAngle(prevAngle => {
            const newAngle = prevAngle + velocityRef.current;
            velocityRef.current *= FRICTION;

            if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
                cancelAnimationFrame(animationFrameRef.current);
                velocityRef.current = 0;
                if (onDragEnd && hasMovedRef.current) {
                    onDragEnd(newAngle);
                }
                return newAngle;
            }
            
            animationFrameRef.current = requestAnimationFrame(animate);
            return newAngle;
        });
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
        setDelta(angleDelta);
        velocityRef.current = angleDelta;
        lastMouseAngleRef.current = currentMouseAngle;
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            setDelta(0);
            if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
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

    return { angle, delta, handleMouseDown };
};
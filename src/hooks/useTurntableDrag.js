import { useState, useEffect, useRef, useCallback } from 'react';

const FRICTION = 0.95; 
const MIN_VELOCITY = 0.05;
// PHOENIX PROTOCOL: The true graphical center of the 550x550 SVG viewBox.
const FIXED_CENTER = { x: 275, y: 275 };

export const useTurntableDrag = (initialAngle, onDrag) => {
    const [angle, setAngle] = useState(initialAngle);
    const [isDragging, setIsDragging] = useState(false);
    
    const velocityRef = useRef(0);
    const animationFrameRef = useRef();
    const lastMouseAngleRef = useRef(0);
    const hasMovedRef = useRef(false);
    // PHOENIX PROTOCOL: This ref will now store the SVG's bounding box.
    const rectRef = useRef(null);

    useEffect(() => {
        if (!isDragging) {
            setAngle(initialAngle);
        }
    }, [initialAngle, isDragging]);

    const animate = useCallback(() => {
        if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
            cancelAnimationFrame(animationFrameRef.current);
            velocityRef.current = 0;
            if (onDrag && hasMovedRef.current) {
                setAngle(currentAngle => {
                    onDrag(currentAngle, 0);
                    return currentAngle;
                });
            }
            return;
        }

        const newAngle = angle + velocityRef.current;
        setAngle(newAngle);
        if (onDrag) onDrag(newAngle, velocityRef.current);

        velocityRef.current *= FRICTION;
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [onDrag, angle]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !rectRef.current) return;
        hasMovedRef.current = true;
        
        // PHOENIX PROTOCOL: Calculate mouse position relative to the SVG, not the window.
        const mouseX = e.clientX - rectRef.current.left;
        const mouseY = e.clientY - rectRef.current.top;

        const dx = mouseX - FIXED_CENTER.x;
        const dy = mouseY - FIXED_CENTER.y;
        const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

        let angleDelta = currentMouseAngle - lastMouseAngleRef.current;
        if (angleDelta < -180) angleDelta += 360;
        else if (angleDelta > 180) angleDelta -= 360;

        const newAngle = angle + angleDelta;
        setAngle(newAngle);
        velocityRef.current = angleDelta;
        lastMouseAngleRef.current = currentMouseAngle;
        
        if (onDrag) onDrag(newAngle, angleDelta);

    }, [isDragging, angle, onDrag]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                if (onDrag && hasMovedRef.current) {
                    onDrag(angle, 0);
                }
            }
        }
    }, [isDragging, animate, onDrag, angle]);
    
    // PHOENIX PROTOCOL: The handler now accepts the SVG's bounding box.
    const handleMouseDown = useCallback((e, rect) => {
        e.stopPropagation();
        setIsDragging(true);
        hasMovedRef.current = false;
        cancelAnimationFrame(animationFrameRef.current);
        velocityRef.current = 0;
        
        rectRef.current = rect; // Store the SVG's dimensions

        const mouseX = e.clientX - rectRef.current.left;
        const mouseY = e.clientY - rectRef.current.top;

        const dx = mouseX - FIXED_CENTER.x;
        const dy = mouseY - FIXED_CENTER.y;
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

    return { angle, handleMouseDown, setAngle };
};
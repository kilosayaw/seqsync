// src/components/ui/MovementFader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useUIState } from '../../context/UIStateContext';
import './MovementFader.css';

const MovementFader = () => {
    const { movementFaderValue, setMovementFaderValue } = useUIState();
    const [isDragging, setIsDragging] = useState(false);
    const faderRef = useRef(null);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        updateValue(e.clientY);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            updateValue(e.clientY);
        }
    };

    const updateValue = (clientY) => {
        if (!faderRef.current) return;
        const rect = faderRef.current.getBoundingClientRect();
        const rawValue = (rect.bottom - clientY) / rect.height;
        const clampedValue = Math.max(0, Math.min(1, rawValue));
        setMovementFaderValue(clampedValue);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleTop = `${(1 - movementFaderValue) * 100}%`;

    return (
        <div ref={faderRef} className="movement-fader-container" onMouseDown={handleMouseDown}>
            <div className="movement-fader-track">
                <div className="movement-fader-handle" style={{ top: handleTop }}></div>
            </div>
        </div>
    );
};
export default MovementFader;
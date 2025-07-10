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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging]);

    const handleTop = `${(1 - movementFaderValue) * 100}%`;

    return (
        // DEFINITIVE REFACTOR: Added wrapper and labels, track now uses faderRef.
        <div className="movement-fader-wrapper">
            <div className="fader-label top-label">-O-</div>
            <div ref={faderRef} className="movement-fader-container" onMouseDown={handleMouseDown}>
                <div className="movement-fader-track">
                    <div className="movement-fader-handle" style={{ top: handleTop }}></div>
                </div>
            </div>
            <div className="fader-label bottom-label">-o-</div>
        </div>
    );
};
export default MovementFader;
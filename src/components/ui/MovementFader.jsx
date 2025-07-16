import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useUIState } from '../../context/UIStateContext';
import './MovementFader.css';

// The component now accepts a 'side' prop to identify itself.
const MovementFader = ({ side }) => {
    // It now reads from the new 'movementFaderValues' object and uses the updated setter.
    const { movementFaderValues, setMovementFaderValue } = useUIState();
    const [isDragging, setIsDragging] = useState(false);
    const faderRef = useRef(null);

    const updateValue = useCallback((clientY) => {
        if (!faderRef.current) return;
        const rect = faderRef.current.getBoundingClientRect();
        const rawValue = (rect.bottom - clientY) / rect.height;
        const clampedValue = Math.max(0, Math.min(1, rawValue));
        // It uses the 'side' prop to update the correct value in the context.
        setMovementFaderValue(side, clampedValue);
    }, [side, setMovementFaderValue]);

    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        updateValue(e.clientY);
    }, [updateValue]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            updateValue(e.clientY);
        }
    }, [isDragging, updateValue]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // It reads the correct value for its specific side ('left' or 'right').
    const faderValue = movementFaderValues[side];
    const handleTop = `${(1 - faderValue) * 100}%`;

    return (
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

MovementFader.propTypes = {
    side: PropTypes.oneOf(['left', 'right']).isRequired,
};

export default MovementFader;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUIState } from '../../context/UIStateContext';
import './MasterFader.css'; // This import will now resolve correctly.

const MasterFader = () => {
    const { weightDistribution, setWeightDistribution } = useUIState();
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef(null);

    const updateValue = useCallback((clientX) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const rawValue = (clientX - rect.left) / rect.width;
        const newWeight = (rawValue * 2) - 1;
        const clampedWeight = Math.max(-1, Math.min(1, newWeight));
        setWeightDistribution(clampedWeight);
    }, [setWeightDistribution]);

    const handleMouseDown = (e) => {
        console.log("[Fader] MasterFader interaction started.");
        setIsDragging(true);
        updateValue(e.clientX);
    };

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            console.log("[Fader] MasterFader interaction ended.");
            setIsDragging(false);
        }
    }, [isDragging]);

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            updateValue(e.clientX);
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
    
    const handleLeft = `${(weightDistribution + 1) / 2 * 100}%`;

    return (
        <div className="master-fader-container" onMouseDown={handleMouseDown}>
            <div ref={trackRef} className="master-fader-track">
                <div className="master-fader-handle" style={{ left: handleLeft }}></div>
            </div>
        </div>
    );
};
export default MasterFader;
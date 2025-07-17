import React, { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import './MasterFader.css';

const MasterFader = () => {
    // --- LOGIC UPDATED: Get the new mode state and setter ---
    const { weightDistribution, setWeightDistribution, masterFaderMode, setMasterFaderMode } = useUIState();
    // --- END OF LOGIC UPDATED ---
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
        setIsDragging(true);
        updateValue(e.clientX);
    };

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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
        <div className="master-fader-wrapper">
            {/* --- UI ADDED: Mode switching buttons --- */}
            <button 
                className={classNames('fader-mode-btn', 'left-btn', { 'active': masterFaderMode === 'head' })}
                onClick={() => setMasterFaderMode('head')}
            >
                HEAD
            </button>
            <div className="master-fader-container" onMouseDown={handleMouseDown}>
                <div ref={trackRef} className="master-fader-track">
                    <div className="master-fader-handle" style={{ left: handleLeft }}></div>
                </div>
            </div>
            <button 
                className={classNames('fader-mode-btn', 'right-btn', { 'active': masterFaderMode === 'hip' })}
                onClick={() => setMasterFaderMode('hip')}
            >
                HIP
            </button>
            {/* --- END OF UI ADDED --- */}
        </div>
    );
};
export default MasterFader;
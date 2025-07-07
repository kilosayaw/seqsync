// src/components/ui/Crossfader.jsx
import React from 'react';
import './Crossfader.css';

const Crossfader = () => {
    const handleInteraction = () => {
        console.log("[Fader] Crossfader interaction.");
    };
    return (
        <div className="crossfader-container" data-testid="crossfader" onMouseDown={handleInteraction}>
            <div className="fader-track">
                <div className="fader-handle"></div>
            </div>
        </div>
    );
};
export default Crossfader;
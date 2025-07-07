// src/components/ui/MovementFader.jsx
import React from 'react';
import './MovementFader.css';

const MovementFader = () => {
    const handleInteraction = () => {
        console.log("[Fader] Movement Fader interaction.");
    };
    return (
        <div className="movement-fader-container" onMouseDown={handleInteraction}>
            <div className="movement-fader-track">
                <div className="movement-fader-handle"></div>
            </div>
        </div>
    );
};
export default MovementFader;
// src/components/CenterDisplay.jsx
import React from 'react';
import BarBeatDisplay from './BarBeatDisplay';
import TransportControls from './TransportControls';
import './CenterDisplay.css';

const CenterDisplay = () => {
    return (
        <div className="center-display-container">
            {/* This div acts as the Camera/Video Feed area */}
            <div className="video-feed-placeholder">
                CAMERA / VIDEO FEED
            </div>
            
            {/* The controls are now grouped at the bottom */}
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
            </div>
        </div>
    );
};

export default CenterDisplay;
// src/components/layout/CenterConsole.jsx

import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            {/* The main video/camera view area */}
            <div className="video-feed-placeholder" data-testid="video-feed">
                CAMERA / VIDEO FEED
            </div>

            {/* A dedicated group for the time displays and main playback buttons */}
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
            </div>
            
            <Crossfader />
        </div>
    );
};

export default CenterConsole;
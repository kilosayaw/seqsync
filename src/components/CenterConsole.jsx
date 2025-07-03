import React from 'react';
import CameraFeed from './CameraFeed.jsx';
import TransportControls from './TransportControls.jsx'; // Using YOUR component
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            <div className="camera-feed-wrapper">
                <CameraFeed />
            </div>
            <div className="transport-controls-wrapper">
                <TransportControls />
            </div>
        </div>
    );
};

export default CenterConsole;
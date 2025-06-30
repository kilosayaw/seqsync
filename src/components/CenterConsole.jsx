import React from 'react';
import CenterDisplayUnit from './CenterDisplayUnit'; // Import the NEW component
import CameraFeed from './CameraFeed';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            {/* The old TransportControls is replaced by our new unit */}
            <CenterDisplayUnit />

            <div className="main-display-area">
                <CameraFeed />
            </div>

            <div className="directional-controls-wrapper">
                <div className="directional-controls">
                    <button className="d-btn">UP</button>
                    <button className="d-btn">IN</button>
                    <button className="d-btn">LEFT</button>
                    <button className="d-btn">DOWN</button>
                    <button className="d-btn">OUT</button>
                    <button className="d-btn">RIGHT</button>
                </div>
            </div>

            <div className="crossfader-placeholder">Crossfader</div>
        </div>
    );
};

export default CenterConsole;
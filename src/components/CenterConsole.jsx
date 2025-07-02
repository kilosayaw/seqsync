import React from 'react';
import CenterDisplayUnit from './CenterDisplayUnit';
import CameraFeed from './CameraFeed';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            <CenterDisplayUnit />

            <div className="main-display-area">
                <CameraFeed />
            </div>

            {/* === RESTORED VISUAL STRUCTURE === */}
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
            {/* === END RESTORED STRUCTURE === */}
        </div>
    );
};

export default CenterConsole;
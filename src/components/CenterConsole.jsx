import React from 'react';
import TransportControls from './TransportControls';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            <TransportControls />

            {/* This placeholder will eventually hold the main skeletal visualizer */}
            <div className="main-display-placeholder"></div>

            {/* This group contains the directional buttons from the old InteractionArea */}
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
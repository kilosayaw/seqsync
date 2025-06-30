import React from 'react';
import TransportControls from './TransportControls'; // Import TransportControls
import InteractionArea from './InteractionArea';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            {/* Replace CenterDisplay with TransportControls */}
            <div className="transport-wrapper-compact">
                <TransportControls />
            </div>
            <InteractionArea />
            <div className="crossfader-placeholder">Crossfader</div>
        </div>
    );
};

export default CenterConsole;
import React from 'react';
import BarBeatDisplay from './BarBeatDisplay';
import TransportControls from './TransportControls';
import './CenterDisplay.css';

const CenterDisplay = () => {
    return (
        <div className="center-display-container">
            <BarBeatDisplay />
            <TransportControls />
        </div>
    );
};

export default CenterDisplay;
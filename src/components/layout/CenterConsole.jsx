import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay'; // IMPORT RESTORED
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder" data-testid="video-feed">
                CAMERA / VIDEO FEED
            </div>

            <div className="center-controls-group">
                <BarBeatDisplay /> {/* PLACED HERE */}
                <TransportControls />
            </div>
            
            <Crossfader />
        </div>
    );
};

export default CenterConsole;
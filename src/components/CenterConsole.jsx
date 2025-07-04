import React from 'react';
import TransportControls from './TransportControls';
import WaveformNavigator from './WaveformNavigator';
import NotationDisplay from './NotationDisplay';
import CrossFader from './CrossFader';
import './CenterConsole.css';

const CenterConsole = () => {
    return (
        <div className="center-console">
            <WaveformNavigator />
            <NotationDisplay />
            <div className="main-display-area">
                {/* Future home of notation display or camera feed */}
            </div>
            <TransportControls />
            <CrossFader />
        </div>
    );
};

export default CenterConsole;
// src/components/layout/CenterConsole.jsx
import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext'; // Import UI context
import classNames from 'classnames'; // Import classnames for animations
import './CenterConsole.css';

const CenterConsole = () => {
    const { preRollCount } = usePlayback();
    // Get the notification message from the UI context
    const { notification } = useUIState(); 

    // Determine what to display: pre-roll > notification > default text
    let displayContent;
    if (preRollCount > 0) {
        displayContent = <span className="preroll-countdown">{preRollCount}</span>;
    } else if (notification) {
        displayContent = <span className="feed-notification">{notification}</span>;
    } else {
        displayContent = "CAMERA / VIDEO FEED";
    }

    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                {displayContent}
            </div>
            <div className="center-controls-group">
                <BarBeatDisplay />
                <TransportControls />
            </div>
            <Crossfader />
        </div>
    );
};
export default CenterConsole;
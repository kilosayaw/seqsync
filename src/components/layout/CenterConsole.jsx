// src/components/layout/CenterConsole.jsx
import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import CameraFeed from '../ui/CameraFeed'; // Import CameraFeed
import PoseOverlay from '../ui/PoseOverlay'; // Import PoseOverlay
import { useUIState } from '../../context/UIStateContext';
import './CenterConsole.css';

const CenterConsole = () => {
    const { preRollCount, notification, mixerState } = useUIState();

    let displayContent;
    if (preRollCount > 0) {
        displayContent = <span className="preroll-countdown">{preRollCount}</span>;
    } else if (notification) {
        displayContent = <span className="feed-notification">{notification}</span>;
    } else if (!mixerState.cameraFeed) {
        // Show default text if camera is off
        displayContent = "CAMERA / VIDEO FEED";
    }

    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                {/* Render the camera feed and overlay if the mixer track is ON */}
                {mixerState.cameraFeed && (
                    <>
                        <CameraFeed />
                        <PoseOverlay />
                    </>
                )}
                {/* Render the text/notification content on top */}
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
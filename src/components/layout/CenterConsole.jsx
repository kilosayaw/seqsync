// src/components/layout/CenterConsole.jsx
import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import MediaDisplay from '../media/MediaDisplay'; // Correct relative path
import { useMedia } from '../../context/MediaContext';
import { useSequence } from '../../context/SequenceContext';
import './CenterConsole.css';

const CenterConsole = () => {
    const { notification } = useSequence();
    const { isCameraActive, toggleCamera, isMotionTrackingEnabled, toggleMotionTracking, mediaFile, isLoading, preRollCount } = useMedia();

    let overlayContent = null;
    if (preRollCount > 0) { overlayContent = <span className="preroll-countdown">{preRollCount}</span>; }
    else if (notification) { overlayContent = <span className="feed-notification">{notification}</span>; }
    else if (isLoading) { overlayContent = <span className="feed-notification">LOADING...</span>; }
    else if (!mediaFile && !isCameraActive) { overlayContent = "UPLOAD MEDIA OR START CAMERA"; }

    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                <MediaDisplay />
                <div className="feed-overlay-content">{overlayContent}</div>
            </div>
            <div className="media-controls-bar">
                <button onClick={toggleCamera} className={`media-toggle-button ${isCameraActive ? 'active' : ''}`} disabled={isLoading}>{isCameraActive ? 'CAMERA ON' : 'CAMERA OFF'}</button>
                <button onClick={toggleMotionTracking} className={`media-toggle-button ${isMotionTrackingEnabled ? 'active' : ''}`} disabled={isLoading}>{isMotionTrackingEnabled ? 'OVERLAY ON' : 'OVERLAY OFF'}</button>
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
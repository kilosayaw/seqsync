import React from 'react';
import BarBeatDisplay from '../ui/BarBeatDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import { usePlayback } from '../../context/PlaybackContext'; // Import playback context
import './CenterConsole.css';

const CenterConsole = () => {
    // Get pre-roll count state
    const { preRollCount } = usePlayback();

    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder">
                {/* Conditionally render the count-in or the default text */}
                {preRollCount > 0 ? (
                    <span className="preroll-countdown">{preRollCount}</span>
                ) : (
                    "CAMERA / VIDEO FEED"
                )}
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
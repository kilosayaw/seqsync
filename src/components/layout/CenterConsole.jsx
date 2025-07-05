import React from 'react';
import DigitalDisplay from '../ui/DigitalDisplay';
import TransportControls from '../ui/TransportControls';
import Crossfader from '../ui/Crossfader';
import { usePlayback } from '../../context/PlaybackContext';
import { formatTime } from '../../utils/notationUtils';
import './CenterConsole.css';

const CenterConsole = () => {
    const { isPlaying, currentTime, bpm } = usePlayback();
    
    // Placeholder logic for bar/beat display
    const bar = 1;
    const beat = 1;

    return (
        <div className="center-console-container">
            <div className="video-feed-placeholder" data-testid="video-feed">
                CAMERA / VIDEO FEED
            </div>

            <div className="center-controls-group">
                <div className="bar-beat-display-container">
                    <DigitalDisplay label="BAR" value={String(bar).padStart(2, '0')} />
                    <DigitalDisplay label="TIME" value={formatTime(currentTime)} />
                    <DigitalDisplay label="BEAT" value={String(beat).padStart(2, '0')} />
                    <DigitalDisplay label="BPM" value={String(Math.round(bpm))} />
                </div>
                <TransportControls />
            </div>
            
            <Crossfader />
        </div>
    );
};

export default CenterConsole;
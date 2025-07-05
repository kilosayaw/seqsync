import React from 'react';
import DigitalDisplay from './DigitalDisplay';
import { usePlayback } from '../../context/PlaybackContext';
import { formatTime } from '../../utils/notationUtils';
import './BarBeatDisplay.css';

const BarBeatDisplay = () => {
    const { currentTime } = usePlayback();
    // Placeholder data
    const bar = "01";
    const beat = "01";

    return (
        <div className="bar-beat-display-container">
            <DigitalDisplay label="BAR" value={bar} />
            {/* The time display is now wider */}
            <DigitalDisplay label="TIME" value={formatTime(currentTime)} className="time-display" />
            <DigitalDisplay label="BEAT" value={beat} />
        </div>
    );
};

export default BarBeatDisplay;
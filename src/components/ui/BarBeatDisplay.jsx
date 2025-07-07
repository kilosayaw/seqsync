// src/components/ui/BarBeatDisplay.jsx

import React from 'react';
import DigitalDisplay from './DigitalDisplay';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { formatTime } from '../../utils/notationUtils';
import './BarBeatDisplay.css';

const BarBeatDisplay = () => {
    const { currentTime, isPlaying, currentBar, currentBeat } = usePlayback();
    const { selectedBar } = useUIState();

    const displayBar = isPlaying ? currentBar : selectedBar;
    // When paused, the "BEAT" display will be blank. It only shows a value during playback.
    const displayBeat = isPlaying ? currentBeat + 1 : " "; 

    return (
        <div className="bar-beat-display-container">
            <DigitalDisplay label="BAR" value={String(displayBar).padStart(2, '0')} />
            <DigitalDisplay label="TIME" value={formatTime(currentTime)} className="time-display" />
            <DigitalDisplay label="BEAT" value={typeof displayBeat === 'number' ? String(displayBeat).padStart(2, '0') : displayBeat} />
        </div>
    );
};

export default BarBeatDisplay;
// src/components/ui/BarBeatDisplay.jsx
import React from 'react';
import DigitalDisplay from './DigitalDisplay';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext'; // DEFINITIVE: Import useSequence
import { formatTime } from '../../utils/notationUtils';
import './BarBeatDisplay.css';

const BarBeatDisplay = () => {
    const { currentTime, isPlaying, currentBar: playingBar, currentBeat: playingBeat } = usePlayback();
    const { selectedBar, activePad } = useUIState();
    const { STEPS_PER_BAR } = useSequence(); // DEFINITIVE: Get steps per bar

    // If playing, use the real-time bar from the playback context. Otherwise, use the selected bar.
    const displayBar = isPlaying ? playingBar : selectedBar;
    
    // DEFINITIVE: The beat display logic is now unified.
    // If playing, use the real-time beat. Otherwise, use the selected pad's beat.
    const beatInBar = isPlaying ? playingBeat : (activePad !== null ? activePad % STEPS_PER_BAR : 0);
    
    // Add 1 to make it one-based for the display.
    const displayBeat = beatInBar + 1;

    return (
        <div className="bar-beat-display-container">
            <DigitalDisplay label="BAR" value={String(displayBar).padStart(2, '0')} />
            <DigitalDisplay label="TIME" value={formatTime(currentTime)} className="time-display" />
            <DigitalDisplay label="BEAT" value={String(displayBeat).padStart(2, '0')} />
        </div>
    );
};

export default BarBeatDisplay;
// src/components/ui/TransportControls.jsx

import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import classNames from 'classnames';
import './TransportControls.css';

const TransportControls = () => {
    // We get all the necessary state and functions from our hooks
    const { isPlaying, togglePlay, isRecording, handleRecord, seekToTime, bpm } = usePlayback(); 
    const { selectedBar, setSelectedBar, activePad } = useUIState();
    const { totalBars, barStartTimes, STEPS_PER_BAR } = useSequence();

    const handleBarChange = (direction) => {
        // Don't allow transport changes while recording or playing
        if (isPlaying || isRecording) return;

        const newBar = selectedBar + direction;

        // Ensure the new bar is within the valid range of the song
        if (newBar >= 1 && newBar <= totalBars) {
            console.log(`[Transport] Bar changed to: ${newBar}`);
            
            // This is the core logic for seeking correctly
            // 1. Determine the current beat within the bar (0-15). If no pad is active, default to the start (0).
            const currentBeatInBar = activePad !== null ? (activePad % STEPS_PER_BAR) : 0;
            
            // 2. Get the start time of the new bar from our pre-calculated array.
            const newBarStartTime = barStartTimes[newBar - 1] || 0;
            
            // 3. Calculate the time offset for the specific beat within that new bar.
            const timePerSixteenth = (60 / (bpm || 120)) / 4;
            const beatOffset = currentBeatInBar * timePerSixteenth;
            
            // 4. The final target time is the new bar's start time plus the beat's offset.
            const targetTime = newBarStartTime + beatOffset;
            
            // 5. Update the state: set the new bar number and seek the audio playhead.
            setSelectedBar(newBar);
            seekToTime(targetTime);
        }
    };

    return (
        <div className="transport-controls-container">
            <button 
                className={classNames('transport-btn', 'record-btn', { 'active': isRecording })} 
                title="Record"
                onClick={handleRecord}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            </button>
            <button className="transport-btn" title="Back Bar" onClick={() => handleBarChange(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L12 12L18 18M12 6L6 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Back Beat">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn play-btn" onClick={togglePlay} title="Play/Pause">
                {isPlaying 
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
            </button>
            <button className="transport-btn" title="Forward Beat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Forward Bar" onClick={() => handleBarChange(1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L12 12L6 18M12 6L18 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
        </div>
    );
};

export default TransportControls;
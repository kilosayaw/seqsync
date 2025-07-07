// src/components/ui/TransportControls.jsx

import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import classNames from 'classnames';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, togglePlay, isRecording, handleRecord, seekToTime, bpm, currentTime } = usePlayback(); 
    const { selectedBar, setSelectedBar, activePad, setActivePad } = useUIState();
    const { totalBars, barStartTimes, STEPS_PER_BAR } = useSequence();

    const handleBarChange = (direction) => {
        if (isPlaying || isRecording) return;

        const newBar = selectedBar + direction;
        if (newBar >= 1 && newBar <= totalBars) {
            console.log(`[Transport] Bar changed to: ${newBar}`);
            
            // --- DEFINITIVE FIX: Calculate and seek to the new time ---
            const currentBeatInBar = activePad !== null ? (activePad % STEPS_PER_BAR) : 0;
            const newBarStartTime = barStartTimes[newBar - 1] || 0;
            const timePerSixteenth = (60 / (bpm || 120)) / 4;
            const beatOffset = currentBeatInBar * timePerSixteenth;
            const targetTime = newBarStartTime + beatOffset;
            
            // Set the new bar and seek the playhead
            setSelectedBar(newBar);
            seekToTime(targetTime);
            // We keep the same relative pad selected in the new bar
            setActivePad(currentBeatInBar);
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
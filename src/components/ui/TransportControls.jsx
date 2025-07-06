// src/components/ui/TransportControls.jsx

import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, togglePlay } = usePlayback();
    const { selectedBar, setSelectedBar, setActivePad } = useUIState();
    const { totalBars } = useSequence();

    // Handler for changing the current bar
    const handleBarChange = (direction) => {
        const newBar = selectedBar + direction;
        // Clamp the new bar value within the valid range (1 to totalBars)
        const clampedBar = Math.max(1, Math.min(newBar, totalBars));

        if (clampedBar !== selectedBar) {
            console.log(`[Transport] Bar changed from ${selectedBar} to ${clampedBar}.`);
            setSelectedBar(clampedBar);
            // Reset active pad to prevent confusion when changing bars
            setActivePad(null); 
        } else {
            console.log(`[Transport] Bar change ignored. At boundary (Bar ${selectedBar}).`);
        }
    };

    // Handler for the main play/pause button
    const handlePlayPause = () => {
        console.log(`[Transport] Play/Pause Toggled. Was: ${isPlaying ? 'Playing' : 'Paused'}.`);
        togglePlay();
    };

    // Placeholder handlers for beat skipping
    const handleBeatSkip = (direction) => {
        const directionText = direction === 1 ? 'Forward' : 'Back';
        console.log(`[Transport] ${directionText} Beat button clicked. (Functionality to be implemented)`);
        // Future logic for nudging the timeline by one beat would go here.
    };

    return (
        <div className="transport-controls-container">
            <button className="transport-btn" title="Back Bar" onClick={() => handleBarChange(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L12 12L18 18M12 6L6 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Back Beat" onClick={() => handleBeatSkip(-1)}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            
            <button className="transport-btn play-btn" onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"}>
                {isPlaying 
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
            </button>
            
            <button className="transport-btn" title="Forward Beat" onClick={() => handleBeatSkip(1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Forward Bar" onClick={() => handleBarChange(1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L12 12L6 18M12 6L18 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
        </div>
    );
};

export default TransportControls;
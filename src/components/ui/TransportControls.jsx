// src/components/ui/TransportControls.jsx

import React, { useEffect } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, togglePlay } = usePlayback();
    const { selectedBar, setSelectedBar, setActivePad } = useUIState();
    const { totalBars } = useSequence();

    const handleBarChange = (direction) => {
        // Prevent changing bars during playback to avoid sync issues.
        if (isPlaying) return;

        const newBar = selectedBar + direction;
        // Ensure the new bar is within the valid range (1 to totalBars)
        if (newBar >= 1 && newBar <= totalBars) {
            setSelectedBar(newBar);
            // When we change bars, we must reset the active pad to avoid confusion.
            setActivePad(null); 
        }
    };

    return (
        <div className="transport-controls-container">
            {/* Back Bar Button */}
            <button className="transport-btn" title="Back Bar" onClick={() => handleBarChange(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L12 12L18 18M12 6L6 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            
            {/* Back Beat Button (functionality to be added later) */}
            <button className="transport-btn" title="Back Beat">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            
            {/* Main Play/Pause Button */}
            <button className="transport-btn play-btn" onClick={togglePlay} title="Play/Pause">
                {isPlaying 
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
            </button>
            
            {/* Forward Beat Button (functionality to be added later) */}
            <button className="transport-btn" title="Forward Beat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* Forward Bar Button */}
            <button className="transport-btn" title="Forward Bar" onClick={() => handleBarChange(1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L12 12L6 18M12 6L18 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
        </div>
    );
};

export default TransportControls;
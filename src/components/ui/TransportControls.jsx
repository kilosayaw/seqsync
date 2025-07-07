// src/components/ui/TransportControls.jsx
import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
// ... other imports ...
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import classNames from 'classnames'; // Import classNames
import './TransportControls.css';

const TransportControls = () => {
    // Get isRecording and handleRecord from playback context
    const { isPlaying, togglePlay, isRecording, handleRecord } = usePlayback(); 
    const { selectedBar, setSelectedBar, setActivePad } = useUIState();
    const { totalBars } = useSequence();

    const handleBarChange = (direction) => {
        // ... (this logic is unchanged)
        if (isPlaying || isRecording) return;
        const newBar = selectedBar + direction;
        if (newBar >= 1 && newBar <= totalBars) {
            setSelectedBar(newBar);
            setActivePad(null); 
        }
    };

    return (
        <div className="transport-controls-container">
            {/* NEW: Record Button */}
            <button 
                className={classNames('transport-btn', 'record-btn', { 'active': isRecording })} 
                title="Record"
                onClick={handleRecord}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            </button>

            {/* The rest of the transport controls */}
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
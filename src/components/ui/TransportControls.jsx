import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, togglePlay } = usePlayback();

    return (
        <div className="transport-controls-container">
            {/* All buttons now use a consistent base class */}
            <button className="transport-btn" title="Back Bar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L12 12L18 18M12 6L6 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Back Beat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            
            {/* The record button now uses the same style */}
            <button className="transport-btn record-btn" title="Record">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4"/></svg>
            </button>

            {/* The play button remains the primary, larger call to action */}
            <button className="transport-btn play-btn" onClick={togglePlay} title="Play/Pause">
                {isPlaying 
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
            </button>
            
            <button className="transport-btn" title="Forward Beat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Forward Bar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L12 12L6 18M12 6L18 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
        </div>
    );
};

export default TransportControls;
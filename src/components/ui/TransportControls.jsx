import React from 'react';
import { usePlayback } from '../../context/PlaybackContext.jsx';
import { useUIState } from '../../context/UIStateContext.jsx';
import { useSequence } from '../../context/SequenceContext.jsx';
import { usePlaybackSync } from '../../hooks/usePlaybackSync.js';
import classNames from 'classnames';
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, isRecording } = usePlayback();
    const { selectedBar } = useUIState();
    const { totalBars } = useSequence();
    
    const { handleBeatStep, handleBarJump, togglePlay, handleRecord } = usePlaybackSync();

    return (
        <div className="transport-controls-container">
            <button className={classNames('transport-btn', 'record-btn', { 'active': isRecording })} onClick={handleRecord} title="Record">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            </button>
            <button className="transport-btn" title="Back Bar" onClick={() => handleBarJump(-1)} disabled={selectedBar <= 1}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L12 12L18 18M12 6L6 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Back Beat" onClick={() => handleBeatStep(-1)}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn play-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                {isPlaying 
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
            </button>
            <button className="transport-btn" title="Forward Beat" onClick={() => handleBeatStep(1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="transport-btn" title="Forward Bar" onClick={() => handleBarJump(1)} disabled={selectedBar >= totalBars}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6L12 12L6 18M12 6L18 12L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
        </div>
    );
};
export default React.memo(TransportControls);
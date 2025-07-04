import React from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { useMedia } from '../context/MediaContext';
import { useTapTempo } from '../hooks/useTapTempo';
import { FaPlay, FaPause, FaArrowLeft, FaArrowRight, FaCircle, FaSyncAlt, FaStepBackward, FaStepForward } from 'react-icons/fa'; // Added new icons
import './TransportControls.css';

const TransportControls = () => {
    const { isPlaying, isRecording, togglePlay, setIsRecording } = usePlayback();
    const { selectedBar, setSelectedBar, isCycling, setIsCycling, cycleStartBar, setCycleStartBar, cycleEndBar, setCycleEndBar } = useUIState();
    const { totalBars } = useSequence();
    const { detectedBpm } = useMedia();
    
    const { tap } = useTapTempo(null);

    const handleCycleToggle = () => setIsCycling(prev => !prev);
    const handleSetLoopStart = () => {
        setCycleStartBar(selectedBar);
        if (cycleEndBar < selectedBar) setCycleEndBar(selectedBar);
    };
    const handleSetLoopEnd = () => {
        setCycleEndBar(selectedBar);
        if (cycleStartBar > selectedBar) setCycleStartBar(selectedBar);
    };

    // Placeholder functions for beat stepping
    const handleBeatBack = () => console.log('Beat Back');
    const handleBeatFwd = () => console.log('Beat Fwd');

    return (
        <div className="transport-controls-container">
            <div className="bpm-section">
                <div className="digital-display">{String(Math.round(detectedBpm || 0)).padStart(3, '0')}</div>
                <button className="transport-btn tap-btn" onClick={tap}>TAP</button>
            </div>
            
            <div className="navigation-section">
                <button className="transport-btn nav-btn" onClick={() => setSelectedBar(p => Math.max(1, p - 1))} disabled={selectedBar <= 1 || totalBars === 0}>
                    <FaArrowLeft />
                </button>
                <button className="transport-btn nav-btn" onClick={handleBeatBack}><FaStepBackward /></button>
                <div className="bar-display">BAR {String(selectedBar).padStart(2, '0')} / {String(totalBars || 0).padStart(2, '0')}</div>
                <button className="transport-btn nav-btn" onClick={handleBeatFwd}><FaStepForward /></button>
                <button className="transport-btn nav-btn" onClick={() => setSelectedBar(p => Math.min(totalBars, p + 1))} disabled={selectedBar >= totalBars || totalBars === 0}>
                    <FaArrowRight />
                </button>
            </div>

            <div className="playback-section">
                <button className={`transport-btn cycle-btn ${isCycling ? 'active' : ''}`} onClick={handleCycleToggle}><FaSyncAlt /></button>
                {/* We can add In/Out buttons back later if needed */}
                <button className={`transport-btn rec-btn ${isRecording ? 'active' : ''}`} onClick={() => setIsRecording(p => !p)}><FaCircle /></button>
                <button className="transport-btn play-btn" onClick={togglePlay}>{isPlaying ? <FaPause/> : <FaPlay/>}</button>
            </div>
        </div>
    );
};

export default TransportControls;
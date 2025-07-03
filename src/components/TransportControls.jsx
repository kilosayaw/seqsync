import React, { useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { useUIState } from '../context/UIStateContext';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext';
import { useTapTempo } from '../hooks/useTapTempo';
import { FaPlay, FaPause, FaFolderOpen, FaArrowLeft, FaArrowRight, FaCircle, FaSave, FaFolder, FaVideo } from 'react-icons/fa';
import './TransportControls.css';

const TransportControls = () => {
    const { loadMedia } = useMedia();
    const { isPlaying, isRecording, togglePlay, toggleRecording, bpm, setBpm } = usePlayback();
    const { isLiveFeed, setIsLiveFeed, selectedBar, setSelectedBar } = useUIState();
    const { totalBars } = useSequence();
    const { tap } = useTapTempo(setBpm);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMedia(file);
        }
    };

    return (
        <div className="transport-wrapper-compact">
            <div className="file-controls-row">
                <button className="transport-btn-file" onClick={() => fileInputRef.current.click()}>
                    <FaFolderOpen /> <span>Media</span>
                </button>
                <button className={`transport-btn-file live-toggle ${isLiveFeed ? 'active' : ''}`} onClick={() => setIsLiveFeed(p => !p)}>
                    <FaVideo /> <span>Live</span>
                </button>
                <button className="transport-btn-file" onClick={() => console.log('load seq')}>
                    <FaFolder /> <span>Load</span>
                </button>
                <button className="transport-btn-file" onClick={() => console.log('save seq')}>
                    <FaSave /> <span>Save</span>
                </button>
            </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="audio/*,video/*" />
            
            <div className="bar-nav-compact">
                <button className="transport-btn-arrow" onClick={() => setSelectedBar(p => Math.max(1, p - 1))} disabled={selectedBar <= 1}><FaArrowLeft /></button>
                <div className="bar-display-compact">BAR {String(selectedBar).padStart(2, '0')} of {String(totalBars || 0).padStart(2, '0')}</div>
                <button className="transport-btn-arrow" onClick={() => setSelectedBar(p => Math.min(totalBars, p + 1))} disabled={selectedBar >= totalBars}><FaArrowRight /></button>
            </div>
            
            <div className="main-controls-grid">
                <div className="bpm-tap-group">
                    <div className="digital-bpm-display">{String(Math.round(bpm)).padStart(3, '0')}</div>
                    <button className="tap-btn" onClick={tap}>TAP</button>
                </div>
                <div className="rec-play-group">
                    <button className={`rec-play-btn record-btn ${isRecording ? 'active' : ''}`} onClick={toggleRecording}><FaCircle /></button>
                    <button className={`rec-play-btn play-btn`} onClick={togglePlay}>{isPlaying ? <FaPause/> : <FaPlay/>}</button>
                </div>
            </div>
        </div>
    );
};

export default TransportControls;
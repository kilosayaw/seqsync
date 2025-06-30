import React, { useRef, useState, useEffect } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { useMedia } from '../context/MediaContext';
import { useUIState } from '../context/UIStateContext';
import { FaPlay, FaPause, FaFolderOpen, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './TransportControls.css';

const TransportControls = () => {
  const { isPlaying, togglePlay, bpm, setBpm } = usePlayback();
  const { loadMedia, isMediaReady, duration } = useMedia();
  const { selectedBar, setSelectedBar } = useUIState();

  const fileInputRef = useRef(null);
  const [totalBars, setTotalBars] = useState(4); // Default to 4 bars

  useEffect(() => {
    // Auto-detect bar count when media is ready
    if (isMediaReady && duration > 0 && bpm > 0) {
      const beatsPerBar = 4; // Assuming 4/4 time
      const totalBeatsInSong = duration / (60 / bpm);
      const estimatedBars = Math.ceil(totalBeatsInSong / beatsPerBar);
      setTotalBars(estimatedBars > 0 ? estimatedBars : 1);
      setSelectedBar(1); // Reset to first bar on new media load
    }
  }, [isMediaReady, duration, bpm, setSelectedBar]);


  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadMedia(file);
    }
  };
  
  const handleBarChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTotalBars(value);
    }
  }

  const handlePrevBar = () => {
      setSelectedBar(prev => Math.max(1, prev - 1));
  }
  
  const handleNextBar = () => {
      setSelectedBar(prev => Math.min(totalBars, prev + 1));
  }

  return (
    <div className="transport-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="audio/*,video/*"
      />
      <button onClick={handleUploadClick} className="transport-button upload-button">
        <FaFolderOpen />
        <span>Load Media</span>
      </button>

      <div className="bar-navigation">
        <button onClick={handlePrevBar} className="transport-button nav-button" disabled={selectedBar <= 1}>
            <FaArrowLeft />
        </button>
        <div className="bar-display">
            Bar {selectedBar} of {totalBars}
        </div>
        <button onClick={handleNextBar} className="transport-button nav-button" disabled={selectedBar >= totalBars}>
            <FaArrowRight />
        </button>
      </div>

      <button onClick={togglePlay} className="transport-button play-pause-button">
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>

      <div className="info-display-group">
        <div className="info-display">
          <label htmlFor="bpm">BPM</label>
          <input
            id="bpm"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="info-input"
          />
        </div>
        <div className="info-display">
            <label htmlFor="total-bars">Total Bars</label>
             <input
                id="total-bars"
                type="number"
                value={totalBars}
                onChange={handleBarChange}
                className="info-input"
            />
        </div>
      </div>
    </div>
  );
};

export default TransportControls;
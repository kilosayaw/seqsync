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
  const [totalBars, setTotalBars] = useState(4); 

  useEffect(() => {
    if (isMediaReady && duration > 0 && bpm > 0) {
      const beatsPerBar = 4;
      const totalBeatsInSong = duration / (60 / bpm);
      const estimatedBars = Math.ceil(totalBeatsInSong / beatsPerBar);
      setTotalBars(estimatedBars > 0 ? estimatedBars : 1);
      if (selectedBar > estimatedBars) {
        setSelectedBar(1); 
      }
    }
  }, [isMediaReady, duration, bpm, selectedBar, setSelectedBar]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadMedia(file);
    }
  };
  
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
            BAR {selectedBar} of {totalBars}
        </div>
        <button onClick={handleNextBar} className="transport-button nav-button" disabled={selectedBar >= totalBars}>
            <FaArrowRight />
        </button>
        <button onClick={togglePlay} className="transport-button play-pause-button">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      <div className="info-display-group">
        <div className="info-display">
          <label htmlFor="bpm">BPM</label>
          <input
            id="bpm"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10) || 120)}
            className="info-input"
          />
        </div>
      </div>
    </div>
  );
};

export default TransportControls;
// src/components/ui/WaveformNavigator.jsx

import React, { useRef } from 'react';
import { useMedia } from '../../context/MediaContext';
import { FaUpload } from 'react-icons/fa'; // We need the icon again
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    // We get isMediaReady to conditionally show the prompt
    const { waveformContainerRef, loadMedia, isMediaReady } = useMedia();
    const fileInputRef = useRef(null);

    const handleContainerClick = () => {
        // Only trigger the file input if no media is loaded
        if (isMediaReady) return;
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMedia(file);
        }
    };

    return (
        // The container is always clickable, but the handler has a condition
        <div className="waveform-navigator-container" onClick={handleContainerClick}>
            <div ref={waveformContainerRef} className="waveform" />
            
            {/* DEFINITIVE FIX: Show the upload prompt ONLY when no media is ready */}
            {!isMediaReady && (
                <div className="upload-prompt">
                    <FaUpload />
                    <span>Click to Upload Media</span>
                </div>
            )}

            {/* Hidden file input is always available */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="audio/*,video/*"
            />
        </div>
    );
};

export default WaveformNavigator;
// src/components/ui/WaveformNavigator.jsx

import React, { useRef } from 'react';
import { useMedia } from '../../context/MediaContext';
import { FaArrowAltCircleUp } from 'react-icons/fa';
import classNames from 'classnames'; // Import classnames
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const { waveformContainerRef, loadMedia, isMediaReady } = useMedia();
    const fileInputRef = useRef(null);

    const handleContainerClick = () => {
        if (isMediaReady) return;
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMedia(file);
        }
    };

    // Conditionally set the class for the prompt
    const promptClasses = classNames('upload-prompt', {
        'hidden': isMediaReady,
    });

    return (
        <div className="waveform-navigator-container" onClick={handleContainerClick}>
            <div ref={waveformContainerRef} className="waveform" />
            
            <div className={promptClasses}>
                <FaArrowAltCircleUp />
                <span>Upload Media</span>
            </div>

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
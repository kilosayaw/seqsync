// src/components/ui/TopNavBar.jsx

import React, { useRef } from 'react';
import { useMedia } from '../../context/MediaContext';
import { FaFolderOpen, FaSave } from 'react-icons/fa';
import './TopNavBar.css';

const TopNavBar = () => {
    const { loadMedia, mediaFile } = useMedia();
    const fileInputRef = useRef(null);

    const handleMediaClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMedia(file);
        }
    };

    return (
        <nav className="top-nav-bar">
            <div className="nav-group-left">
                <div className="logo">SĒQsync</div>
                <button className="nav-btn" onClick={handleMediaClick}><FaFolderOpen /> Media</button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept="audio/*" 
                />
                <button className="nav-btn"><FaFolderOpen /> Load SEQ</button>
                <button className="nav-btn"><FaSave /> Save SEQ</button>
            </div>
            <div className="song-title-display">
                {mediaFile ? mediaFile.name : 'No Media Loaded'}
            </div>
            {/* The right group is empty for now, as designed */}
            <div className="nav-group-right" />
        </nav>
    );
};

export default TopNavBar;
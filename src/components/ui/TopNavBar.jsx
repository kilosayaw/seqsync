// src/components/ui/TopNavBar.jsx

import React, { useRef } from 'react';
import { useMedia } from '../../context/MediaContext';
import { FaFolderOpen, FaSave } from 'react-icons/fa';
import './TopNavBar.css';

const TopNavBar = () => {
    const { mediaFile, loadMedia } = useMedia(); 
    const fileInputRef = useRef(null);

    const handleMediaClick = () => {
        // Trigger the hidden file input when the "Media" button is clicked.
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMedia(file);
        }
    };

    const handleLoadSeq = () => console.log('[Nav] Clicked Load SEQ');
    const handleSaveSeq = () => console.log('[Nav] Clicked Save SEQ');

    return (
        <nav className="top-nav-bar">
            <div className="nav-group-left">
                <div className="logo">SĒQsync</div>
                {/* The Media button is now restored */}
                <button className="nav-btn" onClick={handleMediaClick}><FaFolderOpen /> Media</button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept="audio/*,video/*"
                />
                <button className="nav-btn" onClick={handleLoadSeq}><FaFolderOpen /> Load SEQ</button>
                <button className="nav-btn" onClick={handleSaveSeq}><FaSave /> Save SEQ</button>
            </div>
            <div className="song-title-display">
                {mediaFile ? mediaFile.name : 'No Media Loaded'}
            </div>
            <div className="nav-group-right" />
        </nav>
    );
};

export default TopNavBar;
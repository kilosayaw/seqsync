import React, { useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { useUIState } from '../context/UIStateContext';
import { FaFolderOpen, FaSave, FaFolder, FaVideo, FaUserCircle } from 'react-icons/fa';
import './TopNavBar.css';

const TopNavBar = () => {
    const { loadMedia } = useMedia();
    const { isLiveFeed, setIsLiveFeed } = useUIState();
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMedia(file);
        }
    };

    const handleSaveSequence = () => console.log("Save sequence clicked");
    const handleLoadSequence = () => console.log("Load sequence clicked");

    return (
        <nav className="top-nav-bar">
            <div className="nav-group-left">
                <button className="nav-btn" onClick={() => fileInputRef.current.click()}>
                    <FaFolderOpen /> Media
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="audio/*,video/*" />
                
                <button className="nav-btn" onClick={handleLoadSequence}>
                    <FaFolder /> Load
                </button>
                <button className="nav-btn" onClick={handleSaveSequence}>
                    <FaSave /> Save
                </button>
            </div>
            <div className="nav-group-right">
                 <button className={`nav-btn live-toggle ${isLiveFeed ? 'active' : ''}`} onClick={() => setIsLiveFeed(p => !p)}>
                    <FaVideo /> Live
                </button>
                <button className="nav-btn">
                    <FaUserCircle /> Sign In
                </button>
            </div>
        </nav>
    );
};

export default TopNavBar;
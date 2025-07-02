import React, { useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { useUIState } from '../context/UIStateContext';
import { FaFolderOpen, FaSave, FaFolder, FaVideo, FaUserCircle } from 'react-icons/fa';
import './TopNavBar.css';

const TopNavBar = () => {
    const { loadMedia } = useMedia();
    const { isLiveFeed, setIsLiveFeed } = useUIState();
    const fileInputRef = useRef(null);

    const handleMediaClick = () => {
        console.log('[TopNavBar] Media button clicked.');
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log(`[TopNavBar] Media file selected: ${file.name}`);
            loadMedia(file);
        }
    };

    const handleLoadSequence = () => console.log("[TopNavBar] Load Sequence button clicked.");
    const handleSaveSequence = () => console.log("[TopNavBar] Save Sequence button clicked.");
    const handleLiveToggle = () => {
        console.log(`[TopNavBar] Live toggle clicked. New state: ${!isLiveFeed}`);
        setIsLiveFeed(p => !p);
    };
    const handleSignIn = () => console.log("[TopNavBar] Sign In button clicked.");

    return (
        <nav className="top-nav-bar">
            <div className="nav-group-left">
                <button className="nav-btn" onClick={handleMediaClick}><FaFolderOpen /> Media</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="audio/*,video/*" />
                <button className="nav-btn" onClick={handleLoadSequence}><FaFolder /> Load</button>
                <button className="nav-btn" onClick={handleSaveSequence}><FaSave /> Save</button>
            </div>
            <div className="nav-group-right">
                 <button className={`nav-btn live-toggle ${isLiveFeed ? 'active' : ''}`} onClick={handleLiveToggle}><FaVideo /> Live</button>
                <button className="nav-btn" onClick={handleSignIn}><FaUserCircle /> Sign In</button>
            </div>
        </nav>
    );
};

export default TopNavBar;
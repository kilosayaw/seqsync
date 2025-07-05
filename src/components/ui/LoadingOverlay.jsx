import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = () => {
    return (
        <div className="loading-overlay">
            <div className="spinner"></div>
            <p>ANALYZING AUDIO...</p>
        </div>
    );
};

export default LoadingOverlay;
// src/components/ui/LoadingOverlay.jsx
import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = () => {
    return (
        <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Processing Media...</p>
        </div>
    );
};

export default LoadingOverlay;
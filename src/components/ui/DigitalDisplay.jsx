import React from 'react';
import './DigitalDisplay.css';

const DigitalDisplay = ({ label, value, className = '' }) => {
    return (
        <div className={`digital-display-wrapper ${className}`}>
            <div className="digital-display-label">{label}</div>
            <div className="digital-display-value">{value}</div>
        </div>
    );
};

// --- DEFINITIVE FIX: Wrap in React.memo to prevent unnecessary re-renders ---
export default React.memo(DigitalDisplay);
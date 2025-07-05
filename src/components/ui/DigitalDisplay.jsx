import React from 'react';
import './DigitalDisplay.css';

const DigitalDisplay = ({ value, label }) => {
    return (
        <div className="digital-display-wrapper">
            <div className="digital-display-label">{label}</div>
            <div className="digital-display-value">{value}</div>
        </div>
    );
};

export default DigitalDisplay;
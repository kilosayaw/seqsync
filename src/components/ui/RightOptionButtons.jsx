import React from 'react';
import './OptionButtons.css'; // Assuming this file exists and is styled

// This is the component logic
const RightOptionButtons = () => {
    // Future logic for Presets, Modes, etc. will go here.
    return (
        <div className="option-buttons-container">
            <button className="option-btn">PRESETS</button>
            <button className="option-btn">ROTATE</button>
            <button className="option-btn">STRIKE</button>
            <button className="option-btn">LIVE</button>
        </div>
    );
};

// THE CRITICAL FIX: Exporting the component as the default for this file.
export default RightOptionButtons;
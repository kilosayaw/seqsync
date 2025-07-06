import React from 'react';
import './OptionButtons.css'; // Assuming this file exists and is styled

// This is the component logic
const LeftOptionButtons = () => {
    const logClick = (buttonName) => console.log(`[OptionBtn] Left button "${buttonName}" clicked.`);
    // Future logic for Copy, Paste, etc. will go here.
    return (
        <div className="option-buttons-container">
            <button className="option-btn">COPY</button>
            <button className="option-btn">PASTE</button>
            <button className="option-btn">CLEAR</button>
            <button className="option-btn">NUDGE</button>
        </div>
    );
};

// THE CRITICAL FIX: Exporting the component as the default for this file.
export default LeftOptionButtons; 
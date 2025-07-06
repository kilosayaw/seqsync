// src/components/ui/LeftOptionButtons.jsx
import React from 'react';
import './OptionButtons.css'; // This component imports its OWN stylesheet.

const LeftOptionButtons = () => {
    const logClick = (buttonName) => console.log(`[OptionBtn] Left button "${buttonName}" clicked.`);
    return (
        <div className="option-buttons-container">
            <button className="option-btn" onClick={() => logClick('COPY')}>COPY</button>
            <button className="option-btn" onClick={() => logClick('PASTE')}>PASTE</button>
            <button className="option-btn" onClick={() => logClick('CLEAR')}>CLEAR</button>
            <button className="option-btn" onClick={() => logClick('NUDGE')}>NUDGE</button>
        </div>
    );
};

export default LeftOptionButtons;
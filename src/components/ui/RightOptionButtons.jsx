// src/components/ui/RightOptionButtons.jsx
import React from 'react';
import './OptionButtons.css'; // This component imports its OWN stylesheet.

const RightOptionButtons = () => {
    const logClick = (buttonName) => console.log(`[OptionBtn] Right button "${buttonName}" clicked.`);
    return (
        <div className="option-buttons-container">
            <button className="option-btn" onClick={() => logClick('PRESETS')}>PRESETS</button>
            <button className="option-btn" onClick={() => logClick('ROTATE')}>ROTATE</button>
            <button className="option-btn" onClick={() => logClick('STRIKE')}>STRIKE</button>
            <button className="option-btn" onClick={() => logClick('LIVE')}>LIVE</button>
        </div>
    );
};

export default RightOptionButtons;
// src/components/ui/DirectionalControls.jsx
import React from 'react';
import './DirectionalControls.css';

const DirectionalControls = () => {
    return (
        <div className="directional-controls-container">
            <button className="dir-btn">UP/DOWN</button>
            <button className="dir-btn">L/R</button>
            <button className="dir-btn">FWD/BWD</button>
        </div>
    );
};
export default DirectionalControls;
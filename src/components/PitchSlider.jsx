import React from 'react';
import './PitchSlider.css';

const PitchSlider = ({ side }) => {
    return (
        <div className={`pitch-slider-container pitch-slider-${side}`}>
            <div className="pitch-label">PITCH</div>
            <div className="slider-track">
                <div className="slider-handle"></div>
            </div>
        </div>
    );
};

export default PitchSlider;
import React from 'react';
import './InteractionArea.css';

const InteractionArea = () => {
    // The 'joints' array and the joint-selector-column div have been removed.
    
    return (
        <div className="interaction-area-container">
            <div className="visualizer-column">
                <div className="skeletal-display-placeholder"></div>
                <div className="directional-controls">
                    <div className="d-col">
                        <button className="d-btn">UP</button>
                        <button className="d-btn">DOWN</button>
                    </div>
                    <div className="d-col">
                        <button className="d-btn">IN</button>
                        <button className="d-btn">OUT</button>
                    </div>
                     <div className="d-col">
                        <button className="d-btn wide">LEFT</button>
                        <button className="d-btn wide">RIGHT</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractionArea;
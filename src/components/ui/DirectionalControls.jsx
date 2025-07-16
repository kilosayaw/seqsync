// src/components/ui/DirectionalControls.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './DirectionalControls.css';

const gridLayout = [
    { vector: { x: -1, y: 1 } }, { vector: { x: 0, y: 1 } }, { vector: { x: 1, y: 1 } },
    { vector: { x: -1, y: 0 } }, { vector: { x: 0, y: 0 } }, { vector: { x: 1, y: 0 } },
    { vector: { x: -1, y: -1 } }, { vector: { x: 0, y: -1 } }, { vector: { x: 1, y: -1 } }
];

const DirectionalControls = ({ onDirectionalClick, activeVector }) => {
    
    const handleGridClick = (gridVector) => {
        if (!onDirectionalClick) return;
        // This component only deals with X and Y. The parent will handle the Z value.
        onDirectionalClick({ x: gridVector.x, y: gridVector.y });
    };

    return (
        <div className="directional-controls-container">
            <div className="directional-grid">
                {gridLayout.map((cell, index) => {
                    // The active green dot is shown if the vector matches the current joint's vector on the XY plane.
                    const isActive = activeVector && 
                                     activeVector.x === cell.vector.x && 
                                     activeVector.y === cell.vector.y;
                    
                    return (
                        <button 
                            key={index} 
                            className="dir-grid-btn"
                            onClick={() => handleGridClick(cell.vector)}
                        >
                            {isActive && <div className="active-indicator"></div>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

DirectionalControls.propTypes = {
    onDirectionalClick: PropTypes.func.isRequired,
    activeVector: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.number,
    }),
};

export default DirectionalControls;
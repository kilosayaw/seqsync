// src/components/ui/XYZGrid.jsx
import React from 'react';
import './XYZGrid.css';

const XYZGrid = ({ position = [0, 0, 0], onPositionChange }) => {

    const handleCellClick = (x, y) => {
        const [currentX, currentY, currentZ] = position;

        // If clicking a NEW cell, set X/Y and reset Z to 0.
        if (x !== currentX || y !== currentY) {
            onPositionChange([x, y, 0]);
        } else {
            // If clicking the SAME cell, cycle Z-depth: 0 -> 1 -> -1 -> 0
            let nextZ = 0;
            if (currentZ === 0) nextZ = 1;
            if (currentZ === 1) nextZ = -1;
            if (currentZ === -1) nextZ = 0;
            onPositionChange([x, y, nextZ]);
        }
    };
    
    // Scale mapping: -1 (far) -> 0.4, 0 (middle) -> 0.7, 1 (near) -> 1.0
    const zToScale = (z) => 0.7 + (z * 0.3);

    return (
        <div className="xyz-grid-container">
            {[-1, 0, 1].map(y => 
                [1, 0, -1].map(x => { 
                    const isActive = position[0] === x && position[1] === y;
                    return (
                        <div 
                            key={`${x},${y}`} 
                            className="xyz-grid-cell"
                            onClick={() => handleCellClick(x, y)}
                        >
                            {isActive && (
                                <div 
                                    className="xyz-indicator" 
                                    style={{ transform: `scale(${zToScale(position[2])})` }}
                                />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};
export default XYZGrid;
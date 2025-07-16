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
            if (currentZ === 0) nextZ = 1;  // Neutral -> Forward
            if (currentZ === 1) nextZ = -1; // Forward -> Backward
            if (currentZ === -1) nextZ = 0; // Backward -> Neutral
            onPositionChange([x, y, nextZ]);
        }
    };
    
    // Scale mapping: 1 (fwd) -> 1.0 (large), 0 (mid) -> 0.7, -1 (back) -> 0.4 (small)
    const zToScale = (z) => 0.7 + (z * 0.3);

    return (
        <div className="xyz-grid-container">
            {/* Y-axis: Top row is y=1 (Up), Bottom row is y=-1 (Down). This is correct. */}
            {[1, 0, -1].map(y => 
                // X-axis: Left column is x=1 (Left), Right column is x=-1 (Right). This is now correct.
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
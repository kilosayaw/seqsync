// src/components/ui/XYZGrid.jsx
import React, { useState } from 'react';
import './XYZGrid.css';

const XYZGrid = ({ position = [0, 0, 0], onPositionChange }) => {
    const [zDragStart, setZDragStart] = useState(null);

    const handleCellClick = (x, y) => {
        // On first click, just set X and Y
        onPositionChange([x, y, position[2]]);
    };

    const handleZDragStart = (e, x, y) => {
        // If this isn't the active cell, make it active first
        if (x !== position[0] || y !== position[1]) {
            handleCellClick(x, y);
        }
        setZDragStart({
            screenY: e.screenY,
            initialZ: position[2]
        });
        e.stopPropagation();
    };

    const handleZDragMove = (e) => {
        if (!zDragStart) return;
        const deltaY = zDragStart.screenY - e.screenY;
        let newZ = zDragStart.initialZ + (deltaY / 100); // Sensitivity
        newZ = Math.max(-1, Math.min(1, newZ)); // Clamp between -1 and 1
        onPositionChange([position[0], position[1], newZ]);
    };

    const handleZDragEnd = () => {
        setZDragStart(null);
    };

    useEffect(() => {
        if (zDragStart) {
            window.addEventListener('mousemove', handleZDragMove);
            window.addEventListener('mouseup', handleZDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleZDragMove);
            window.removeEventListener('mouseup', handleZDragEnd);
        };
    }, [zDragStart, handleZDragMove, handleZDragEnd]);

    const zToScale = (z) => 0.5 + (z * 0.45); // Maps z from [-1, 1] to scale [0.05, 0.95]

    return (
        <div className="xyz-grid-container">
            {[-1, 0, 1].map(y => 
                [-1, 0, 1].map(x => {
                    const isActive = position[0] === x && position[1] === y;
                    return (
                        <div 
                            key={`${x},${y}`} 
                            className="xyz-grid-cell"
                            onClick={() => handleCellClick(x, y)}
                            onMouseDown={(e) => handleZDragStart(e, x, y)}
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
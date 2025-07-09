// src/components/ui/XYZGrid.jsx
import React, { useState, useEffect } from 'react';
import './XYZGrid.css';

const XYZGrid = ({ position = [0, 0, 0], onPositionChange }) => {
    const [zDragStart, setZDragStart] = useState(null);

    const handleCellClick = (x, y) => {
        onPositionChange([x, y, position[2]]);
    };

    const handleZDragStart = (e, x, y) => {
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
        let newZ = zDragStart.initialZ + (deltaY / 100);
        newZ = Math.max(-1, Math.min(1, newZ));
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

    const zToScale = (z) => 0.5 + (z * 0.45);

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
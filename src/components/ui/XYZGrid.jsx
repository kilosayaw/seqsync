// src/components/ui/XYZGrid.jsx
import React, { useState, useEffect } from 'react';
import './XYZGrid.css';

const XYZGrid = ({ position = [0, 0, 0], onPositionChange, onZChange, zValue }) => {
    // DEFINITIVE: This component now manages its own internal Z state during a drag for responsiveness
    // but reports the final value up. It receives the canonical Z value as a prop.
    const [localZ, setLocalZ] = useState(zValue);
    const [zDragStart, setZDragStart] = useState(null);
    
    // Sync local Z with prop from parent
    useEffect(() => {
        setLocalZ(zValue);
    }, [zValue]);

    const handleCellClick = (x, y) => {
        // Report X and Y change immediately
        if (onPositionChange) onPositionChange([x, y, localZ]);
    };

    const handleZDragStart = (e, x, y) => {
        if (x !== position[0] || y !== position[1]) {
            handleCellClick(x, y);
        }
        setZDragStart({
            screenY: e.screenY,
            initialZ: localZ
        });
        e.stopPropagation();
    };

    const handleZDragMove = (e) => {
        if (!zDragStart) return;
        const deltaY = zDragStart.screenY - e.screenY;
        let newZ = zDragStart.initialZ + (deltaY / 100);
        newZ = Math.max(-1, Math.min(1, newZ));
        setLocalZ(newZ); // Update local state for smooth visual feedback
    };

    const handleZDragEnd = () => {
        // On mouse up, report the final Z value to the parent
        if (zDragStart && onZChange) {
            onZChange(localZ);
        }
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
    }, [zDragStart]);

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
                                    style={{ transform: `scale(${zToScale(localZ)})` }}
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
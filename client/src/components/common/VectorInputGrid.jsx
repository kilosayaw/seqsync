import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { VECTOR_GRID_CELLS, Z_DEPTH_CONFIG } from '../../utils/constants';

const VectorInputGrid = ({ vector, onVectorChange }) => {
    // Local state to manage the vector, initialized from props
    const [currentVector, setCurrentVector] = useState(vector || { x: 0, y: 0, z: 0 });

    // Tap detection state
    const tapTimeout = useRef(null);
    const lastTapTime = useRef(0);

    // Ensure local state updates when the prop changes (e.g., new joint selected)
    useEffect(() => {
        setCurrentVector(vector || { x: 0, y: 0, z: 0 });
    }, [vector]);

    const handleCellClick = (x, y) => {
        const newVector = { ...currentVector, x, y };
        setCurrentVector(newVector);
        onVectorChange(newVector);
    };

    const handleCircleInteraction = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300; // ms

        // Double Tap Logic
        if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
            clearTimeout(tapTimeout.current);
            lastTapTime.current = 0; // Reset tap time
            const newVector = { ...currentVector, z: 1 }; // Largest circle
            setCurrentVector(newVector);
            onVectorChange(newVector);
            return;
        }

        lastTapTime.current = now;

        // Single Tap Logic (fires after a delay)
        tapTimeout.current = setTimeout(() => {
            const newVector = { ...currentVector, z: -1 }; // Smallest circle
            setCurrentVector(newVector);
            onVectorChange(newVector);
        }, DOUBLE_TAP_DELAY);
    };

    const handleResetClick = (e) => {
        e.stopPropagation(); // Prevent grid click
        const newVector = { x: 0, y: 0, z: 0 };
        setCurrentVector(newVector);
        onVectorChange(newVector);
    }
    
    // Convert Z-value to a size class for the circle
    const zSizeClass = Z_DEPTH_CONFIG[currentVector.z]?.sizeClasses || Z_DEPTH_CONFIG[0].sizeClasses;
    const zColorClass = Z_DEPTH_CONFIG[currentVector.z]?.color || Z_DEPTH_CONFIG[0].color;
    
    return (
        <div className="relative w-32 h-32">
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1 bg-gray-900/50 p-1 rounded-md">
                {VECTOR_GRID_CELLS.map(({ x, y }) => (
                    <div
                        key={`${x}-${y}`}
                        onClick={() => handleCellClick(x, y)}
                        className={`
                            border border-dashed border-gray-700 rounded-sm cursor-pointer
                            hover:bg-yellow-400/20 hover:border-yellow-400
                            ${currentVector.x === x && currentVector.y === y ? 'bg-yellow-500/10' : ''}
                        `}
                    >
                        {/* Center cell gets the reset button */}
                        {x === 0 && y === 0 && (
                             <div className="relative w-full h-full flex items-center justify-center">
                                <button
                                    onClick={handleResetClick}
                                    className="w-4 h-4 rounded-full bg-gray-600 border border-gray-500 hover:bg-red-500"
                                    title="Reset Vector (0,0,0)"
                                />
                             </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* The Movable Circle Indicator */}
            <div
                className="absolute top-0 left-0 w-full h-full p-1 pointer-events-none"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    gap: '0.25rem'
                }}
            >
                <div
                    onClick={handleCircleInteraction}
                    className={`
                        flex items-center justify-center rounded-full 
                        transition-all duration-150 ease-in-out pointer-events-auto cursor-pointer
                        shadow-lg
                        ${zSizeClass} ${zColorClass}
                    `}
                    style={{
                        // CSS Grid uses 1-based indexing. Vector is -1, 0, 1.
                        gridColumnStart: currentVector.x + 2,
                        gridRowStart: -currentVector.y + 2, // Y is inverted
                        justifySelf: 'center',
                        alignSelf: 'center',
                    }}
                />
            </div>
        </div>
    );
};

VectorInputGrid.propTypes = {
  vector: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number, z: PropTypes.number }),
  onVectorChange: PropTypes.func.isRequired,
};

export default VectorInputGrid;
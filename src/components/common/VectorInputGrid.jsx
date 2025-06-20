import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { VECTOR_GRID_CELLS, Z_DEPTH_CONFIG } from '../../utils/constants';

const VectorInputGrid = ({ vector, onVectorChange }) => {
    const [currentVector, setCurrentVector] = useState(vector || { x: 0, y: 0, z: 0 });

    useEffect(() => {
        setCurrentVector(vector || { x: 0, y: 0, z: 0 });
    }, [vector]);

    const handleCellClick = useCallback((x, y) => {
        const newVector = { ...currentVector, x, y };
        setCurrentVector(newVector);
        onVectorChange(newVector);
    }, [currentVector, onVectorChange]);

    const handleResetClick = useCallback((e) => {
        e.stopPropagation();
        const newVector = { x: 0, y: 0, z: 0 };
        setCurrentVector(newVector);
        onVectorChange(newVector);
    }, [onVectorChange]);
    
    // --- DEFINITIVE MERGE: Using the robust z-cycling logic ---
    const handleZCycle = useCallback((e) => {
        e.stopPropagation();
        const z_values = [0, 1, -1]; // Neutral -> Forward -> Backward
        const currentZIndex = z_values.indexOf(currentVector.z);
        const nextZIndex = (currentZIndex + 1) % z_values.length;
        const newZ = z_values[nextZIndex];
        
        const newVector = { ...currentVector, z: newZ };
        setCurrentVector(newVector);
        onVectorChange(newVector);
    }, [currentVector, onVectorChange]);
    
    const zKey = String(currentVector.z);
    const zConfig = Z_DEPTH_CONFIG[zKey] || Z_DEPTH_CONFIG['0'];
    
    return (
        <div className="relative w-32 h-32">
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1 bg-gray-900/50 p-1 rounded-md">
                {VECTOR_GRID_CELLS.map(({ x, y, desc }) => (
                    <div
                        key={`${x}-${y}`}
                        onClick={() => handleCellClick(x, y)}
                        className={`border border-dashed border-gray-700 rounded-sm cursor-pointer hover:bg-yellow-400/20 hover:border-yellow-400 ${currentVector.x === x && currentVector.y === y ? 'bg-yellow-500/10' : ''}`}
                        title={desc}
                    >
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
                    onClick={handleZCycle}
                    title={`Click to cycle Z-Depth (Current: ${zConfig.label})`}
                    className={`flex items-center justify-center rounded-full transition-all duration-150 ease-in-out pointer-events-auto cursor-pointer shadow-lg ${zConfig.sizeClasses} ${zConfig.color}`}
                    style={{
                        gridColumnStart: currentVector.x + 2,
                        gridRowStart: -currentVector.y + 2,
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
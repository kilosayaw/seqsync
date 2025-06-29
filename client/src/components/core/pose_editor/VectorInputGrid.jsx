// src/components/studio/pose_editor/VectorInputGrid.jsx
import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { VECTOR_GRID_CELLS, Z_DEPTH_CONFIG, POSE_DEFAULT_VECTOR } from '../../../utils/constants';

const VectorInputGrid = ({ vector = POSE_DEFAULT_VECTOR, onVectorChange }) => {
    const [zDepth, setZDepth] = useState(vector?.z || 0);

    useEffect(() => { setZDepth(vector?.z || 0); }, [vector]);

    const handleCellClick = (x, y) => onVectorChange({ x, y, z: zDepth });
    const handleZDepthChange = (newZ) => {
        setZDepth(newZ);
        onVectorChange({ x: vector?.x || 0, y: vector?.y || 0, z: newZ });
    };
    
    const zButtons = useMemo(() => Object.entries(Z_DEPTH_CONFIG).sort(([a],[b]) => b - a), []);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-900/50 rounded-md">
                {VECTOR_GRID_CELLS.map(({ x, y, desc }) => (
                    <button key={`${x},${y}`} onClick={() => handleCellClick(x, y)} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-150 ${vector?.x === x && vector?.y === y ? 'bg-yellow-400 text-black' : 'bg-gray-700 hover:bg-gray-600'}`} title={desc}>
                        <div className={`rounded-full ${vector?.x === x && vector?.y === y ? Z_DEPTH_CONFIG[zDepth]?.sizeClasses : 'w-2 h-2'} bg-current`}></div>
                    </button>
                ))}
            </div>
            <div className="flex justify-center items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-gray-400">Z:</span>
                {zButtons.map(([zKey, config]) => (
                    <button key={zKey} onClick={() => handleZDepthChange(Number(zKey))} className={`px-2 py-0.5 text-xs rounded-md transition-colors ${zDepth === Number(zKey) ? `${config.color} text-black font-bold` : 'bg-gray-600 hover:bg-gray-500 text-white'}`}>{config.label}</button>
                ))}
            </div>
        </div>
    );
};
VectorInputGrid.propTypes = { vector: PropTypes.object, onVectorChange: PropTypes.func.isRequired };
export default VectorInputGrid;
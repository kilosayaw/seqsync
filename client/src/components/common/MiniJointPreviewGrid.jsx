// src/components/common/MiniJointPreviewGrid.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Added PropTypes
import { Z_DEPTH_CONFIG, VECTOR_GRID_CELLS } from '../../utils/constants'; // Assuming these are in constants

const getZIndicatorClassFromConfig = (zValue, isActive = false) => {
  const baseOpacity = isActive ? 'opacity-100' : 'opacity-80';
  // Find the closest Z_DEPTH_CONFIG entry
  let closestConfig = Z_DEPTH_CONFIG['0']; // Default to middle
  let minDiff = Infinity;

  for (const key in Z_DEPTH_CONFIG) {
    const diff = Math.abs(Z_DEPTH_CONFIG[key].value - zValue);
    if (diff < minDiff) {
      minDiff = diff;
      closestConfig = Z_DEPTH_CONFIG[key];
    }
  }
  return `${closestConfig.sizeClasses} ${closestConfig.activeColor || closestConfig.color} ${baseOpacity}`;
};


const MiniJointPreviewGrid = ({ jointData, label, opacityClass = "opacity-75" }) => {
  if (!jointData || Object.keys(jointData).length === 0) {
    return (
      <div className={`p-2 border border-dashed border-gray-700 rounded-md ${opacityClass} text-center`}>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs text-gray-600 italic">No Data</p>
      </div>
    );
  }

  const { vector = { x: 0, y: 0, z: 0 }, orientation = "N/A", rotation = 0 } = jointData;
  const numericRotation = parseFloat(rotation);

  return (
    <div className={`p-2 border border-gray-700 rounded-md ${opacityClass} flex flex-col items-center space-y-1`}>
      {label && <p className="text-xs text-gray-400 font-semibold">{label}</p>}
      <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-black/20 rounded w-max">
        {VECTOR_GRID_CELLS.map((cell, index) => (
          <div
            key={index}
            className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-sm flex items-center justify-center
                        ${vector.x === cell.x && vector.y === cell.y ? 'bg-blue-700/50 ring-1 ring-blue-400' : 'bg-gray-600/50'}`}
            title={`X: ${cell.x}, Y: ${cell.y}`}
          >
            {vector.x === cell.x && vector.y === cell.y && (
              <span className={`absolute rounded-full transition-all duration-150 ${getZIndicatorClassFromConfig(vector.z, true)}`}></span>
            )}
          </div>
        ))}
      </div>
      <p className="text-[0.65rem] text-gray-500 leading-tight">
        Vec: {vector.x},{vector.y},{vector.z}
      </p>
      <p className="text-[0.65rem] text-gray-500 leading-tight truncate w-full text-center max-w-[60px]" title={String(orientation)}>
        Ori: {String(orientation).substring(0,5)}{String(orientation).length > 5 ? '..' : ''}
      </p>
      <p className="text-[0.65rem] text-gray-500 leading-tight">
        Rot: {!isNaN(numericRotation) ? numericRotation.toFixed(0) : '0'}°
      </p>
    </div>
  );
};

MiniJointPreviewGrid.propTypes = {
    jointData: PropTypes.shape({
        vector: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
            z: PropTypes.number,
        }),
        orientation: PropTypes.string,
        rotation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    label: PropTypes.string,
    opacityClass: PropTypes.string,
};


export default MiniJointPreviewGrid;
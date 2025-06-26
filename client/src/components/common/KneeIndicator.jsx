import React from 'react';
import PropTypes from 'prop-types';

const KneeIndicator = ({ rotation = 0, extension = 1.0 }) => {
  const extensionHeight = 50 * extension; // Max height is 50px
  const antennaRotation = rotation - 90; // Adjust so 0 degrees points up

  return (
    <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-end justify-center p-2 relative">
      {/* Base */}
      <div className="w-16 h-8 bg-gray-900 rounded-t-full"></div>
      
      {/* Extension Meter */}
      <div 
        className="absolute bottom-2 w-4 bg-pos-yellow transition-all duration-150 ease-out"
        style={{ height: `${extensionHeight}px`, borderRadius: '4px 4px 0 0' }}
      ></div>

      {/* Rotating Antenna */}
      <div 
        className="absolute top-1/2 left-1/2 w-1 h-12 origin-bottom transition-transform duration-150"
        style={{ transform: `translateX(-50%) translateY(-100%) rotate(${antennaRotation}deg)` }}
      >
        <div className="w-full h-full bg-red-500 rounded-full"></div>
      </div>
    </div>
  );
};

KneeIndicator.propTypes = {
  rotation: PropTypes.number,
  extension: PropTypes.number,
};

export default KneeIndicator;
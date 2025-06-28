// src/components/common/Crossfader.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Crossfader = ({
  value = 50,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  labelLeft = 'L',
  labelRight = 'R',
  className = '',
  title, // Pass title for the wrapper for tooltip-like behavior
}) => {

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(parseInt(e.target.value, 10));
    }
  };

  const getBackgroundStyle = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    // Gradient: Left side (blue) up to thumb, Right side (red) from thumb
    const colorLeft = 'rgba(59, 130, 246, 0.7)'; // blue-500
    const colorRight = 'rgba(239, 68, 68, 0.7)'; // red-500
    const colorTrack = 'rgba(75, 85, 99, 0.5)'; // gray-600
    
    return {
      background: `linear-gradient(to right, ${colorLeft} 0%, ${colorLeft} ${percentage}%, ${colorTrack} ${percentage}%, ${colorTrack} 100%)`
    };
  };

  return (
    <div className={`flex items-center gap-2 w-full ${className}`} title={title}>
      <span className="text-xs font-semibold text-gray-400">{labelLeft}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInputChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer crossfader-track"
        style={getBackgroundStyle()}
      />
      <span className="text-xs font-semibold text-gray-400">{labelRight}</span>
      {/* Basic CSS to style the thumb - add to your main CSS file or index.css */}
      <style>{`
        .crossfader-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 24px;
          background: #d1d5db; /* gray-300 */
          cursor: pointer;
          border-radius: 3px;
          border: 1px solid #4b5563; /* gray-600 */
        }
        .crossfader-track::-moz-range-thumb {
          width: 12px;
          height: 24px;
          background: #d1d5db;
          cursor: pointer;
          border-radius: 3px;
          border: 1px solid #4b5563;
        }
      `}</style>
    </div>
  );
};

Crossfader.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  labelLeft: PropTypes.string,
  labelRight: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
};

export default React.memo(Crossfader);
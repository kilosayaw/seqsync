import React from 'react';
import PropTypes from 'prop-types';

const HipIndicator = ({ weight = 50 }) => {
  // weight is 0 (full right) to 100 (full left)
  const leftHeight = `${weight}%`;
  const rightHeight = `${100 - weight}%`;

  return (
    <div className="flex items-center justify-center gap-4 p-1 bg-gray-700/50 rounded-lg w-48">
      <div className="w-4 h-10 bg-gray-900 rounded-sm overflow-hidden relative flex justify-center items-end" title={`Left Weight: ${weight.toFixed(0)}%`}>
        <div className="w-full bg-blue-500 transition-all duration-150" style={{ height: leftHeight, boxShadow: '0 0 8px #3B82F6' }}></div>
      </div>
      <span className="text-sm font-bold text-gray-300 font-sans">HIPS</span>
      <div className="w-4 h-10 bg-gray-900 rounded-sm overflow-hidden relative flex justify-center items-end" title={`Right Weight: ${(100-weight).toFixed(0)}%`}>
        <div className="w-full bg-red-500 transition-all duration-150" style={{ height: rightHeight, boxShadow: '0 0 8px #EF4444' }}></div>
      </div>
    </div>
  );
};
HipIndicator.propTypes = { weight: PropTypes.number };
export default HipIndicator;
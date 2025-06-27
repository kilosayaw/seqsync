import React from 'react';
import PropTypes from 'prop-types';

const HipWeightIndicator = ({ side, opacity, glow }) => {
  const color = side === 'L' ? 'text-blue-300' : 'text-red-300';
  return (
    <div
      style={{ opacity, textShadow: glow }}
      className={`text-center text-xs font-semibold ${color} p-1 bg-gray-900/40 rounded transition-all duration-300`}
    >
      {side}-HIP WEIGHT
    </div>
  );
};

HipWeightIndicator.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  opacity: PropTypes.number.isRequired,
  glow: PropTypes.string.isRequired,
};

export default HipWeightIndicator;
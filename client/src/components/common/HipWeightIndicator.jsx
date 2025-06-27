// [NEW] src/components/common/HipWeightIndicator.jsx

import React from 'react';
import PropTypes from 'prop-types';

const HipWeightIndicator = ({ side, weight, isActive }) => {
  const isLeft = side === 'L';
  const bgColor = isLeft ? 'bg-blue-600' : 'bg-red-600';
  const progressColor = isLeft ? 'bg-blue-400' : 'bg-red-400';
  const activeGlow = isActive ? (isLeft ? 'shadow-[0_0_15px_rgba(59,130,246,0.7)]' : 'shadow-[0_0_15px_rgba(239,68,68,0.7)]') : '';

  const height = `${weight}%`;

  return (
    <div className={`relative w-4 h-32 bg-black/50 rounded-full overflow-hidden border-2 border-gray-700 transition-all ${activeGlow}`}>
      <div 
        className={`absolute bottom-0 left-0 w-full ${progressColor} transition-all duration-150 ease-in-out`}
        style={{ height }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs">
        {side}
      </div>
    </div>
  );
};

HipWeightIndicator.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  weight: PropTypes.number.isRequired,
  isActive: PropTypes.bool,
};

export default HipWeightIndicator;
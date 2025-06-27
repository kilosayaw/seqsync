import React from 'react';
import PropTypes from 'prop-types';

const HipWeightIndicator = ({ side, weight = 50 }) => { // Using default parameter
  const isLeft = side === 'L';
  const displayWeight = isLeft ? weight : 100 - weight;
  const safeWeight = (typeof displayWeight === 'number' && !isNaN(displayWeight)) ? displayWeight : 50;
  const heightPercent = Math.max(0, Math.min(100, safeWeight));
  const colorClass = isLeft ? 'bg-blue-500' : 'bg-red-500';
  const glowColor = isLeft ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)';
  const glowIntensity = Math.max(0, (safeWeight - 50) / 50);

  return ( <div className="relative w-6 h-full bg-gray-700 rounded-full overflow-hidden shadow-inner"> <div className={`absolute bottom-0 w-full transition-all duration-150 ease-out ${colorClass}`} style={{ height: `${heightPercent}%`, boxShadow: `0 0 12px ${glowColor.replace('0.7', String(glowIntensity))}` }} /> <div className="absolute inset-0 flex items-center justify-center pointer-events-none"> <span className="text-white font-bold text-base mix-blend-difference">{side}</span> </div> </div> );
};
HipWeightIndicator.propTypes = { side: PropTypes.oneOf(['L', 'R']).isRequired, weight: PropTypes.number };
export default HipWeightIndicator;
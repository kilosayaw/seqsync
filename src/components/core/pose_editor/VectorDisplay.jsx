// [NEW] src/components/core/pose_editor/VectorDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronLeft, faCircle } from '@fortawesome/free-solid-svg-icons';

const VectorDisplay = ({ vector = { x: 0, y: 0, z: 0 }, className = '' }) => {
  const { x, y, z } = vector;

  // Determine visibility and rotation for each chevron
  const yStyle = {
    display: y !== 0 ? 'block' : 'none',
    transform: y < 0 ? 'rotate(180deg)' : 'none',
    color: 'rgba(255, 255, 255, 0.7)',
  };

  const xStyle = {
    display: x !== 0 ? 'block' : 'none',
    transform: x > 0 ? 'rotate(90deg)' : 'rotate(-90deg)',
    color: 'rgba(255, 255, 255, 0.7)',
  };

  const zStyle = {
    display: z !== 0 ? 'block' : 'none',
    transform: `scale(${1 + Math.abs(z) * 0.4})`, // Scale up/down
    color: z < 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)', // Red for Near, Blue for Far
  };
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <FontAwesomeIcon icon={faChevronUp} style={yStyle} className="absolute transition-transform" />
      <FontAwesomeIcon icon={faChevronLeft} style={xStyle} className="absolute transition-transform" />
      <FontAwesomeIcon icon={faCircle} style={zStyle} className="absolute transition-transform text-xs" />
    </div>
  );
};

VectorDisplay.propTypes = {
  vector: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number, z: PropTypes.number }),
  className: PropTypes.string,
};

export default React.memo(VectorDisplay);
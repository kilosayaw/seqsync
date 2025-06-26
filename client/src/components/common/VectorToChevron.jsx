import React from 'react';
import PropTypes from 'prop-types';

const VectorToChevron = ({ vector, className = 'w-8 h-8' }) => {
  // DEFENSIVE CHECK: Ensure vector is an object, not a string or undefined.
  const safeVector = (vector && typeof vector === 'object' && !Array.isArray(vector))
    ? vector
    : { x: 0, y: 0, z: 0 };

  const { x = 0, y = 0, z = 0 } = safeVector;
  
  // ... the rest of your SVG mapping logic remains the same ...
  const chevronMap = { /* ... */ };
  const key = `${x},${y},${z}`;
  const chevronSvg = chevronMap[key] || chevronMap['0,0,0'];

  return (
    <svg /* ... */ >
      {chevronSvg}
    </svg>
  );
};

VectorToChevron.propTypes = {
  vector: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // Temporarily allow string to suppress warning while debugging if needed
};

export default VectorToChevron;
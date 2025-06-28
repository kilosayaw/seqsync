// src/components/core/pose_editor/VectorToChevron.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowUp, faArrowDown, faArrowLeft, faArrowRight, 
  faPlus, faMinus, faDotCircle, faTimes, faChevronUp, faChevronDown
} from '@fortawesome/free-solid-svg-icons';

// This component translates a {x, y, z} vector into a visual icon symbol.
// It is designed to be robust and handle incomplete or invalid data gracefully.
const VectorToChevron = ({ vector, className = 'w-8 h-8' }) => {
  
  // DEFENSIVE CHECK: Ensure 'vector' is a valid object before destructuring.
  // If it's not a valid object, default to a neutral vector.
  const safeVector = (vector && typeof vector === 'object' && !Array.isArray(vector))
    ? vector
    : { x: 0, y: 0, z: 0 };

  // Safely destructure with default values for each axis.
  const { x = 0, y = 0, z = 0 } = safeVector;

  // A mapping from a vector string "x,y,z" to its FontAwesome icon.
  // Using FontAwesome gives us clean, consistent, and easily styleable icons.
  const getIconForVector = () => {
    // Prioritize diagonal movements first
    if (y > 0 && x > 0) return <FontAwesomeIcon icon={faChevronUp} transform={{ rotate: -45 }} />; // Up-Left
    if (y > 0 && x < 0) return <FontAwesomeIcon icon={faChevronUp} transform={{ rotate: 45 }} />;  // Up-Right
    if (y < 0 && x > 0) return <FontAwesomeIcon icon={faChevronDown} transform={{ rotate: 45 }} />; // Down-Left
    if (y < 0 && x < 0) return <FontAwesomeIcon icon={faChevronDown} transform={{ rotate: -45 }} />; // Down-Right

    // Cardinal directions
    if (y > 0) return <FontAwesomeIcon icon={faArrowUp} />;   // Up
    if (y < 0) return <FontAwesomeIcon icon={faArrowDown} />; // Down
    if (x > 0) return <FontAwesomeIcon icon={faArrowLeft} />; // Left (Mirrored for user perspective)
    if (x < 0) return <FontAwesomeIcon icon={faArrowRight} />; // Right (Mirrored for user perspective)
    
    // Depth-only movements
    if (z > 0) return <FontAwesomeIcon icon={faPlus} />;      // Forward
    if (z < 0) return <FontAwesomeIcon icon={faMinus} />;     // Backward
    
    // Default/Neutral state
    return <FontAwesomeIcon icon={faDotCircle} />;
  };
  
  const iconElement = getIconForVector();

  return (
    <div className={className}>
      {iconElement}
    </div>
  );
};

VectorToChevron.propTypes = {
  // We expect an object, but will defensively handle other types.
  vector: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default React.memo(VectorToChevron);
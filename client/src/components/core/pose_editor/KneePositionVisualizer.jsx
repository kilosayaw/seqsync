// src/components/pose_editor/KneePositionVisualizer.jsx
import React from 'react';
import PropTypes from 'prop-types';

const VISUALIZER_SIZE = 120; // The width and height of the SVG viewbox
const HEEL_ANCHOR_POS = { x: VISUALIZER_SIZE / 2, y: VISUALIZER_SIZE * 0.8 }; // Position of the heel anchor
const ANCHOR_RADIUS = 5;
const KNEE_RADIUS = 6;

const KneePositionVisualizer = ({ kneeVector = { x: 0, y: 0, z: 0 }, isEditing = false }) => {
  // The vector from state is normalized (-1 to 1). We need to scale it to our visualizer's coordinates.
  const spread = (VISUALIZER_SIZE / 2) * 0.9; // 90% of the half-width
  
  const kneePos = {
    x: HEEL_ANCHOR_POS.x + (kneeVector.x * spread),
    y: HEEL_ANCHOR_POS.y - (kneeVector.z * spread) // We use Z for forward/backward movement on the Y-axis
  };

  const opacity = isEditing ? 1 : 0.4;
  const strokeColor = isEditing ? 'rgba(250, 204, 21, 0.9)' : 'rgba(107, 114, 128, 0.7)'; // Yellow when editing

  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox={`0 0 ${VISUALIZER_SIZE} ${VISUALIZER_SIZE}`} 
      className="absolute inset-0 pointer-events-none transition-opacity"
      style={{ opacity }}
    >
      {/* Connector Line */}
      <line
        x1={HEEL_ANCHOR_POS.x}
        y1={HEEL_ANCHOR_POS.y}
        x2={kneePos.x}
        y2={kneePos.y}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray={isEditing ? "none" : "2 2"} // Dashed line when not editing
      />

      {/* Anchor Circle (Hollow) */}
      <circle
        cx={HEEL_ANCHOR_POS.x}
        cy={HEEL_ANCHOR_POS.y}
        r={ANCHOR_RADIUS}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />

      {/* Knee Position Circle (Filled) */}
      <circle
        cx={kneePos.x}
        cy={kneePos.y}
        r={KNEE_RADIUS}
        fill={strokeColor}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1"
      />
    </svg>
  );
};

KneePositionVisualizer.propTypes = {
  kneeVector: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),
  isEditing: PropTypes.bool,
};

export default KneePositionVisualizer;
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const SVGContainer = styled.svg`
  width: 100%;
  height: 100%;
  background-color: #0f172a;
  border-radius: 4px;
`;

const VectorScope = ({ jointVector }) => {
  // If no vector data is available for the selected joint, don't render anything.
  if (!jointVector) {
    return (
      <SVGContainer viewBox="-1.5 -1.5 3 3">
        <text
          x="0"
          y="0.1"
          fill="#475569"
          fontSize="0.4"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          No Vector
        </text>
      </SVGContainer>
    );
  }

  const { x, y, z } = jointVector;

  // Function to determine the dot's radius based on Z-depth
  const getRadius = (zValue) => {
    if (zValue === 1) return 0.18; // Large dot (Closer)
    if (zValue === -1) return 0.06; // Small dot (Farther)
    return 0.12; // Medium dot (Neutral)
  };

  // The Y-coordinate is inverted for SVG's coordinate system (0,0 is top-left)
  const invertedY = -y;
  const radius = getRadius(z);

  return (
    <SVGContainer viewBox="-1.5 -1.5 3 3">
      {/* Background Grid */}
      <defs>
        <pattern
          id="smallGrid"
          width="1"
          height="1"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 1 0 L 0 0 0 1"
            fill="none"
            stroke="#273142"
            strokeWidth="0.05"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#smallGrid)" />
      
      {/* Center crosshairs */}
      <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#334155" strokeWidth="0.02" />
      <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#334155" strokeWidth="0.02" />

      {/* Vector Line */}
      <line
        x1="0"
        y1="0"
        x2={x}
        y2={invertedY}
        stroke="#94a3b8"
        strokeWidth="0.05"
        strokeDasharray="0.1"
      />

      {/* Vector Dot */}
      <circle
        cx={x}
        cy={invertedY}
        r={radius}
        fill="var(--color-accent-yellow, #FFD700)"
        stroke="white"
        strokeWidth="0.03"
      />
    </SVGContainer>
  );
};

VectorScope.propTypes = {
  jointVector: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),
};

export default VectorScope;
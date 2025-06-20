// src/components/common/SSTGauge.jsx
import React from 'react';
import PropTypes from 'prop-types';

const SSTGauge = ({ skill = 50, strength = 50, technique = 50 }) => {
  const svgSize = 100;
  const padding = 10;
  // Base of the triangle corners
  const p1 = { x: padding, y: svgSize - padding }; // Skill (bottom-left)
  const p2 = { x: svgSize - padding, y: svgSize - padding }; // Strength (bottom-right)
  const p3 = { x: svgSize / 2, y: padding }; // Technique (top)

  // Calculate the position of the center point based on the three values
  const total = skill + strength + technique || 1;
  const skillRatio = skill / total;
  const strengthRatio = strength / total;
  const techniqueRatio = technique / total;

  const centerX = p1.x * skillRatio + p2.x * strengthRatio + p3.x * techniqueRatio;
  const centerY = p1.y * skillRatio + p2.y * strengthRatio + p3.y * techniqueRatio;
  
  return (
    <div className="w-24 h-24">
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Triangle Outline */}
        <polygon points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill="rgba(31, 41, 55, 0.5)" stroke="rgba(107, 114, 128, 0.5)" strokeWidth="1" />

        {/* The Balance Point */}
        <circle cx={centerX} cy={centerY} r="4" fill="rgba(250, 204, 21, 0.9)" />
        
        {/* Labels */}
        <text x={p1.x} y={p1.y + 8} fill="#9ca3af" fontSize="8" textAnchor="middle">Skill</text>
        <text x={p2.x} y={p2.y + 8} fill="#9ca3af" fontSize="8" textAnchor="middle">Strength</text>
        <text x={p3.x} y={p3.y - 4} fill="#9ca3af" fontSize="8" textAnchor="middle">Technique</text>
      </svg>
    </div>
  );
};

SSTGauge.propTypes = { skill: PropTypes.number, strength: PropTypes.number, technique: PropTypes.number };
export default SSTGauge;
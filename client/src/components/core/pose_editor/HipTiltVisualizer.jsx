// src/components/pose/HipTiltVisualizer.jsx
import React from 'react';
import styled from 'styled-components';
import { getCoreState } from '../../utils/biomechanics';

const SVGContainer = styled.svg`
  width: 200px;
  height: 150px;
  overflow: visible;
`;

const HipTiltVisualizer = ({ poseState }) => {
  const { LH, RH } = poseState;
  const { coil, energy } = getCoreState(poseState);

  // Calculate pelvic tilt and rotation for visualization
  // Tilt is based on the average flexion/extension of the hips
  const avgFlexion = (LH.flexion + RH.flexion) / 2;
  const tiltAngle = -avgFlexion * 0.15; // Simple mapping of flexion to visual tilt

  // Rotation is based on the average rotation of the hips
  const avgRotation = (LH.rotation + RH.rotation) / 2;

  // Energy ball visualization
  const energyRadius = 5 + energy * 20; // Radius from 5 to 25
  const energyColor = `rgba(0, 255, 255, ${0.2 + energy * 0.8})`; // Becomes more opaque with energy

  // Coil indicator visualization
  const coilX = coil * 30; // Move from -30 to 30

  return (
    <SVGContainer viewBox="-50 -50 100 100">
      {/* Energy Ball - represents stored potential */}
      <circle cx="0" cy="0" r={energyRadius} fill={energyColor} stroke="#00ffff" strokeWidth="1" />

      {/* Pelvis Representation */}
      <g transform={`rotate(${tiltAngle})`}>
        <rect 
          x="-40" 
          y="-10" 
          width="80" 
          height="20" 
          fill="rgba(100, 100, 120, 0.5)"
          stroke="#FFFFFF"
          strokeWidth="1"
          transform-origin="center"
          style={{ transform: `scaleX(${1 - Math.abs(avgRotation / 90) * 0.3})` }} // Simple 3D perspective
        />
        {/* Coil Indicator - shows twist between hips and shoulders */}
        <circle cx={coilX} cy="0" r="4" fill="#ffff00" />
      </g>
      <text x="-45" y="40" fill="white" fontSize="8px">Core State</text>
    </SVGContainer>
  );
};

export default HipTiltVisualizer;
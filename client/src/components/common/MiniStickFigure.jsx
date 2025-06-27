// src/components/common/MiniStickFigure.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { BODY_SEGMENTS, DEFAULT_POSITIONS_2D, Z_DEPTH_JOINT_SCALES } from '../../utils/constants';

const MiniStickFigure = ({ pose }) => {
  const size = 32; // SVG viewbox size

  const getJointPos = (jointAbbrev) => {
    const jointData = pose?.[jointAbbrev];
    const defaultPos = DEFAULT_POSITIONS_2D[jointAbbrev];
    if (!defaultPos) return { x: NaN, y: NaN, z: 0 };
    return {
      x: defaultPos.x * size,
      y: defaultPos.y * size,
      z: jointData?.vector?.z || 0
    };
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full filter drop-shadow-md">
      {/* Render Segments */}
      {BODY_SEGMENTS.map((seg, index) => {
        const p1 = getJointPos(seg.from);
        const p2 = getJointPos(seg.to);
        if (isNaN(p1.x) || isNaN(p2.x)) return null;
        return <line key={`seg-${index}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
      })}
      {/* Render Joints with Z-Depth Scaling */}
      {Object.keys(pose || {}).map(jointAbbrev => {
        const pos = getJointPos(jointAbbrev);
        if (isNaN(pos.x)) return null;
        
        const zScale = pos.z === 1 ? Z_DEPTH_JOINT_SCALES.FAR : (pos.z === -1 ? Z_DEPTH_JOINT_SCALES.NEAR : Z_DEPTH_JOINT_SCALES.NEUTRAL);
        // sm, med, lg dot sizes: 0.75, 1, 1.25px radius
        const radius = 1 * zScale;
        
        return <circle key={`joint-${jointAbbrev}`} cx={pos.x} cy={pos.y} r={radius} fill="white" />
      })}
    </svg>
  );
};

MiniStickFigure.propTypes = { pose: PropTypes.object };
export default React.memo(MiniStickFigure);
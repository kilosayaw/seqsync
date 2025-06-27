import React from 'react';
import PropTypes from 'prop-types';
import { ALL_JOINTS_MAP, BODY_SEGMENTS, DEFAULT_POSITIONS_2D, Z_DEPTH_JOINT_SCALES, DEFAULT_JOINT_CIRCLE_RADIUS, SVG_WIDTH_DEFAULT, SVG_HEIGHT_DEFAULT } from '../../../utils/constants';

const SkeletalPoseVisualizer2D = ({ jointInfoData = {}, highlightJoint = null, onJointClick = () => {} }) => {
  
  const getPosition = (jointAbbrev) => {
    const jointData = jointInfoData[jointAbbrev];
    const defaultPos = DEFAULT_POSITIONS_2D[jointAbbrev] || { x: 0.5, y: 0.5 };
    const vector = jointData?.vector;
    if (vector) {
      return { x: defaultPos.x + (vector.x * 0.1), y: defaultPos.y - (vector.y * 0.1) };
    }
    return defaultPos;
  };

  const getZScale = (jointAbbrev) => {
    const z = jointInfoData[jointAbbrev]?.vector?.z;
    if (z > 0.1) return Z_DEPTH_JOINT_SCALES.FAR;
    if (z < -0.1) return Z_DEPTH_JOINT_SCALES.NEAR;
    return Z_DEPTH_JOINT_SCALES.NEUTRAL;
  };

  const LimbRibbon = ({ from, to }) => {
    const p1 = getPosition(from);
    const p2 = getPosition(to);

    const rot1 = jointInfoData[from]?.rotation || 0;
    const rot2 = jointInfoData[to]?.rotation || rot1; // Inherit rotation if end joint has none

    // Convert rotation degrees to a width multiplier (e.g., -90 to 90 -> 0 to 1)
    const widthMultiplier1 = Math.abs(rot1) / 90;
    const widthMultiplier2 = Math.abs(rot2) / 90;
    
    const baseWidth = 4; // Base width of the ribbon
    const w1 = Math.max(1, baseWidth * widthMultiplier1);
    const w2 = Math.max(1, baseWidth * widthMultiplier2);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    // Perpendicular vector
    const px = -dy / len;
    const py = dx / len;

    const points = [
      `${(p1.x * SVG_WIDTH_DEFAULT) - px * w1} ${(p1.y * SVG_HEIGHT_DEFAULT) - py * w1}`,
      `${(p1.x * SVG_WIDTH_DEFAULT) + px * w1} ${(p1.y * SVG_HEIGHT_DEFAULT) + py * w1}`,
      `${(p2.x * SVG_WIDTH_DEFAULT) + px * w2} ${(p2.y * SVG_HEIGHT_DEFAULT) + py * w2}`,
      `${(p2.x * SVG_WIDTH_DEFAULT) - px * w2} ${(p2.y * SVG_HEIGHT_DEFAULT) - py * w2}`,
    ].join(' ');

    return <polygon points={points} className="fill-gray-600/70" />;
  };

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH_DEFAULT} ${SVG_HEIGHT_DEFAULT}`} className="w-full h-full">
      {/* Render Ribbons */}
      {BODY_SEGMENTS.map((segment, index) => (
        <LimbRibbon key={`segment-${index}`} from={segment.from} to={segment.to} />
      ))}
      {/* Render Joints */}
      {Object.keys(ALL_JOINTS_MAP).map((jointAbbrev) => {
        const pos = getPosition(jointAbbrev);
        const isHighlighted = highlightJoint === jointAbbrev;
        const zScale = getZScale(jointAbbrev);
        return (
          <circle
            key={`joint-${jointAbbrev}`}
            cx={pos.x * SVG_WIDTH_DEFAULT}
            cy={pos.y * SVG_HEIGHT_DEFAULT}
            r={DEFAULT_JOINT_CIRCLE_RADIUS * zScale * (isHighlighted ? 1.5 : 1)}
            className={`transition-all duration-150 cursor-pointer ${isHighlighted ? 'fill-pos-yellow stroke-white' : 'fill-gray-400 stroke-gray-700'}`}
            strokeWidth="1.5"
            onClick={(e) => { e.stopPropagation(); onJointClick(jointAbbrev); }}
          />
        );
      })}
    </svg>
  );
};

SkeletalPoseVisualizer2D.propTypes = {
  jointInfoData: PropTypes.object,
  highlightJoint: PropTypes.string,
  onJointClick: PropTypes.func, // New prop type
};

export default SkeletalPoseVisualizer2D;
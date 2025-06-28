import React from 'react';
import PropTypes from 'prop-types';
import { ALL_JOINTS_MAP, BODY_SEGMENTS, DEFAULT_POSITIONS_2D, Z_DEPTH_JOINT_SCALES, SVG_WIDTH_DEFAULT, SVG_HEIGHT_DEFAULT } from '../../../utils/constants';

const DEFAULT_JOINT_CIRCLE_RADIUS = 5;
const HEAD_RADIUS_MULTIPLIER = 1.5;
const NOSE_CONE_RADIUS_MULTIPLIER = 0.6;

const SkeletalPoseVisualizer2D = ({
  jointInfoData = {},
  highlightJoint = null,
  onJointClick = () => {},
  basePositions = DEFAULT_POSITIONS_2D, 
}) => {
  
  const getPosition = (jointAbbrev) => {
    const jointData = jointInfoData[jointAbbrev];
    const defaultPos = basePositions[jointAbbrev] || { x: 0.5, y: 0.5 };
    const vector = jointData?.vector;
    if (vector) {
      // Apply vector displacement, scaled to be noticeable but not extreme
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

  const HeadIndicator = () => {
    const headPos = getPosition('H');
    const neckRotation = jointInfoData['N']?.rotation || 0;
    const headZScale = getZScale('H');
    const isFacingForward = Math.abs(neckRotation) <= 90;
    if (!isFacingForward) return null; // Don't draw nose if head is turned away

    const angleRad = (neckRotation - 90) * (Math.PI / 180);
    const coneBaseRadius = DEFAULT_JOINT_CIRCLE_RADIUS * HEAD_RADIUS_MULTIPLIER * headZScale;
    const coneX = headPos.x * SVG_WIDTH_DEFAULT + Math.cos(angleRad) * coneBaseRadius * NOSE_CONE_RADIUS_MULTIPLIER;
    const coneY = headPos.y * SVG_HEIGHT_DEFAULT + Math.sin(angleRad) * coneBaseRadius * NOSE_CONE_RADIUS_MULTIPLIER;
    
    return (
      <g>
        <circle 
          cx={coneX}
          cy={coneY}
          r={coneBaseRadius * NOSE_CONE_RADIUS_MULTIPLIER * 0.4}
          className="fill-gray-300"
        />
        <circle 
          cx={coneX}
          cy={coneY}
          r={coneBaseRadius * NOSE_CONE_RADIUS_MULTIPLIER * 0.15}
          className="fill-black"
        />
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH_DEFAULT} ${SVG_HEIGHT_DEFAULT}`}
      className="w-full h-full"
    >
      {/* Render Segments with simulated ribboning */}
      {BODY_SEGMENTS.map((segment, index) => {
        const p1 = getPosition(segment.from);
        const p2 = getPosition(segment.to);
        // Rotation is a bit abstract in 2D, but we can use it to affect thickness
        const rot1 = Math.abs(jointInfoData[segment.from]?.rotation || 0);
        const rot2 = Math.abs(jointInfoData[segment.to]?.rotation || rot1);
        const w1 = Math.max(1, 4 * (rot1 / 90)); // Thickness based on rotation
        const w2 = Math.max(1, 4 * (rot2 / 90));
        
        const dx = p2.x * SVG_WIDTH_DEFAULT - p1.x * SVG_WIDTH_DEFAULT;
        const dy = p2.y * SVG_HEIGHT_DEFAULT - p1.y * SVG_HEIGHT_DEFAULT;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len === 0) return null;
        
        // Perpendicular vector for thickness
        const px = -dy / len;
        const py = dx / len;
        
        const points = [
          `${(p1.x*SVG_WIDTH_DEFAULT) - px*w1} ${(p1.y*SVG_HEIGHT_DEFAULT) - py*w1}`,
          `${(p1.x*SVG_WIDTH_DEFAULT) + px*w1} ${(p1.y*SVG_HEIGHT_DEFAULT) + py*w1}`,
          `${(p2.x*SVG_WIDTH_DEFAULT) + px*w2} ${(p2.y*SVG_HEIGHT_DEFAULT) + py*w2}`,
          `${(p2.x*SVG_WIDTH_DEFAULT) - px*w2} ${(p2.y*SVG_HEIGHT_DEFAULT) - py*w2}`
        ].join(' ');

        return <polygon key={`segment-${index}`} points={points} className="fill-gray-600/70" />;
      })}

      {/* Render Joints */}
      {Object.keys(ALL_JOINTS_MAP).map((jointAbbrev) => {
        const pos = getPosition(jointAbbrev);
        const isHighlighted = highlightJoint === jointAbbrev;
        const zScale = getZScale(jointAbbrev);
        
        if (jointAbbrev === 'H') return null; // Draw head last

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

      {/* Render Head Last to be on top */}
      <g onClick={(e) => { e.stopPropagation(); onJointClick('H'); }}>
         <circle
            key="joint-H"
            cx={getPosition('H').x * SVG_WIDTH_DEFAULT}
            cy={getPosition('H').y * SVG_HEIGHT_DEFAULT}
            r={DEFAULT_JOINT_CIRCLE_RADIUS * HEAD_RADIUS_MULTIPLIER * getZScale('H') * (highlightJoint === 'H' ? 1.5 : 1)}
            className={`transition-all duration-150 cursor-pointer ${highlightJoint === 'H' ? 'fill-yellow-400 stroke-white' : 'fill-gray-400 stroke-gray-700'}`}
            strokeWidth="1.5"
          />
          <HeadIndicator />
      </g>
    </svg>
  );
};

SkeletalPoseVisualizer2D.propTypes = {
  jointInfoData: PropTypes.object,
  highlightJoint: PropTypes.string,
  onJointClick: PropTypes.func, 
  basePositions: PropTypes.object,
};

export default SkeletalPoseVisualizer2D;
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    BODY_SEGMENTS,
    DEFAULT_POSITIONS_2D,
    Z_DEPTH_JOINT_SCALES,
    DEFAULT_JOINT_CIRCLE_RADIUS,
    SVG_WIDTH_DEFAULT,
    SVG_HEIGHT_DEFAULT,
    POSE_DEFAULT_VECTOR // <--- ADD THIS IMPORT
} from '../../../utils/constants';

const SkeletalPoseVisualizer2D = ({
  jointInfoData = {},
  viewBoxWidth = SVG_WIDTH_DEFAULT,
  viewBoxHeight = SVG_HEIGHT_DEFAULT,
  highlightJoint = null,
  showLines = true,
  className = "",
}) => {

  const getJointPos = useCallback((jointAbbrev) => {
    const jointData = jointInfoData?.[jointAbbrev];
    const defaultPos = DEFAULT_POSITIONS_2D[jointAbbrev];

    if (!defaultPos) return { x: NaN, y: NaN, z: 0 };

    // Use default vector if specific joint data or its vector is missing
    const vector = jointData?.vector || POSE_DEFAULT_VECTOR;

    const spreadFactor = (viewBoxWidth + viewBoxHeight) / 160;
    
    const xVec = typeof vector.x === 'number' ? vector.x : 0;
    const yVec = typeof vector.y === 'number' ? vector.y : 0;
    const zVec = typeof vector.z === 'number' ? vector.z : 0;

    let x = (xVec * spreadFactor) + (viewBoxWidth / 2);
    let y = (-yVec * spreadFactor) + (viewBoxHeight / 2);
    
    return { x, y, z: zVec };
  }, [jointInfoData, viewBoxWidth, viewBoxHeight]);

  const renderedSegments = useMemo(() => {
    if (!showLines) return null;
    return BODY_SEGMENTS.map((seg, index) => {
      const p1 = getJointPos(seg.from);
      const p2 = getJointPos(seg.to);
      if (isNaN(p1.x) || isNaN(p2.x)) return null;
      let strokeColor = (highlightJoint && (seg.from === highlightJoint || seg.to === highlightJoint)) ? "rgba(250, 204, 21, 0.9)" : "rgba(107, 114, 128, 0.5)";
      return <line key={`seg-${index}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round"/>;
    });
  }, [getJointPos, highlightJoint, showLines]);

  const renderedJointDots = useMemo(() =>
    Object.keys(DEFAULT_POSITIONS_2D).map((jointAbbrev) => {
      const pos = getJointPos(jointAbbrev);
      if (isNaN(pos.x)) return null;

      const isActive = jointAbbrev === highlightJoint;
      const zScale = pos.z === 1 ? Z_DEPTH_JOINT_SCALES.FAR : (pos.z === -1 ? Z_DEPTH_JOINT_SCALES.NEAR : Z_DEPTH_JOINT_SCALES.NEUTRAL);
      const radius = DEFAULT_JOINT_CIRCLE_RADIUS * zScale * (isActive ? 1.5 : 1);
      
      let fill = "rgba(107, 114, 128, 0.7)";
      if (isActive) {
        fill = "rgba(250, 204, 21, 0.9)";
      } else if (jointInfoData?.[jointAbbrev]?.orientation === 'IN') {
        fill = "rgba(96, 165, 250, 0.8)";
      } else if (jointInfoData?.[jointAbbrev]?.orientation === 'OUT') {
        fill = "rgba(251, 146, 60, 0.8)";
      }

      return (
        <g key={`joint-group-${jointAbbrev}`} transform={`translate(${pos.x}, ${pos.y})`} >
          <circle cx={0} cy={0} r={radius} fill={fill} stroke={isActive ? "white" : "black"} strokeWidth={isActive ? 1.5 : 0.5} />
        </g>
      );
  }), [getJointPos, highlightJoint, jointInfoData]);

  return (
    <div className={`bg-gray-800/20 rounded-lg shadow-inner border border-gray-700/30 overflow-hidden ${className}`}>
      <svg width="100%" height="100%" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet" >
        {showLines && <g>{renderedSegments}</g>}
        <g>{renderedJointDots}</g>
      </svg>
    </div>
  );
};

SkeletalPoseVisualizer2D.propTypes = {
  jointInfoData: PropTypes.object,
  viewBoxWidth: PropTypes.number,
  viewBoxHeight: PropTypes.number,
  highlightJoint: PropTypes.string,
  showLines: PropTypes.bool,
  className: PropTypes.string,
};

export default React.memo(SkeletalPoseVisualizer2D);
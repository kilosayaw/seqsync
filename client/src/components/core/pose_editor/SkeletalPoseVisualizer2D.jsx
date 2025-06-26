// SEGSYNC/client/src/components/core/pose_editor/SkeletalPoseVisualizer2D.jsx
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    BODY_SEGMENTS,
    DEFAULT_POSITIONS_2D,
} from '../../../utils/constants';
import { ALL_JOINTS_MAP } from '../../../utils/sounds'; // For tooltips if needed
import { Z_DEPTH_JOINT_SCALES, DEFAULT_JOINT_CIRCLE_RADIUS } from '../../../utils/constants';

const SkeletalPoseVisualizer2D = ({
  jointInfoData = {},
  width = 220, // Slightly increased default width to accommodate larger circles
  height = 300, // Slightly increased default height
  highlightJoint,
  showLines = true,
  className = "",
  // onJointClick, // Add for Phase 2
  // onJointDragStart, // Add for Phase 3
}) => {

  const getJointPos = useCallback((jointAbbrev) => {
    // ... (getJointPos logic remains the same as your previous correct version)
    const jointData = jointInfoData?.[jointAbbrev];
    const defaultPos = DEFAULT_POSITIONS_2D[jointAbbrev];
    if (!defaultPos) return null;
    if (jointData?.vector) {
      const scaleFactorX = width / 2.5; // Adjusted for potentially wider spread with bigger circles
      const scaleFactorY = height / 2.5;
      return {
        x: (jointData.vector.x * scaleFactorX) + (width / 2),
        y: (-jointData.vector.y * scaleFactorY) + (height / 2),
        z: jointData.vector.z ?? 0,
      };
    }
    return { x: defaultPos.x * width, y: defaultPos.y * height, z: 0 };
  }, [jointInfoData, width, height]);

  const renderedSegments = useMemo(() => {
    // ... (renderedSegments logic remains the same)
    if (!showLines || !BODY_SEGMENTS) return null;
    return BODY_SEGMENTS.map((seg, index) => {
      const p1 = getJointPos(seg.from); const p2 = getJointPos(seg.to);
      if (!p1 || !p2) return null;
      let strokeColor = "rgba(107, 114, 128, 0.4)"; let currentStrokeWidth = 1.5;
      const proximalJointData = jointInfoData?.[seg.from];
      if (proximalJointData?.orientation === 'IN') strokeColor = "rgba(59, 130, 246, 0.6)";
      else if (proximalJointData?.orientation === 'OUT') strokeColor = "rgba(249, 115, 22, 0.6)";
      if (seg.from === highlightJoint || seg.to === highlightJoint) {
        strokeColor = "rgba(250, 204, 21, 0.8)"; currentStrokeWidth = 2.5;
      }
      const avgZ = (p1.z + p2.z) / 2; let zOpacityFactor = 1.0;
      if (avgZ >= 0.5) { currentStrokeWidth *= Z_DEPTH_JOINT_SCALES.FAR; zOpacityFactor = 0.6; }
      else if (avgZ <= -0.5) { currentStrokeWidth *= Z_DEPTH_JOINT_SCALES.NEAR; }
      if (strokeColor.startsWith('rgba')) { strokeColor = strokeColor.replace(/[\d\.]+\)$/g, `${parseFloat(strokeColor.match(/[\d\.]+\)$/)[0].slice(0,-1)) * zOpacityFactor})`);}
      return ( <line key={`seg-${index}-${seg.from}-${seg.to}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={strokeColor} strokeWidth={Math.max(0.5, currentStrokeWidth)} strokeLinecap="round" /> );
    });
  }, [getJointPos, highlightJoint, jointInfoData, showLines, width, height]);

  const INCREASED_JOINT_CIRCLE_BASE_RADIUS = DEFAULT_JOINT_CIRCLE_RADIUS * 2.5; // e.g., 4 * 2.5 = 10

  const renderedJointDots = useMemo(() =>
    Object.keys(DEFAULT_POSITIONS_2D)
    .map((jointAbbrev) => {
      const pos = getJointPos(jointAbbrev);
      if (!pos) return null;
      const jointDataForThisDot = jointInfoData?.[jointAbbrev];
      const isActive = jointAbbrev === highlightJoint;
      const jointZ = pos.z;
      let zScale = Z_DEPTH_JOINT_SCALES.NEUTRAL;
      let fontSize;

      if (jointZ >= 0.5) { // Far (+1Z)
        zScale = Z_DEPTH_JOINT_SCALES.FAR;
        fontSize = 10; // Smallest font
      } else if (jointZ <= -0.5) { // Near (-1Z)
        zScale = Z_DEPTH_JOINT_SCALES.NEAR;
        fontSize = 14; // Largest font
      } else { // Mid (0Z)
        zScale = Z_DEPTH_JOINT_SCALES.NEUTRAL;
        fontSize = 12; // Medium font
      }

      const baseRadius = isActive ? INCREASED_JOINT_CIRCLE_BASE_RADIUS * 1.2 : INCREASED_JOINT_CIRCLE_BASE_RADIUS;
      const radius = Math.max(5, baseRadius * zScale); // Increased min radius
      const initials = jointAbbrev.replace(/[^A-Z0-9]/gi, '').substring(0, 3).toUpperCase(); // Up to 3 initials
      
      let fill = "rgba(107, 114, 128, 0.6)"; // Default gray-500/60
      let textColor = "rgba(229, 231, 235, 0.9)"; // gray-200
      let stroke = isActive ? "rgba(250, 204, 21, 0.9)" : "rgba(75, 85, 99, 0.7)"; // slate-600
      let strokeW = isActive ? 1.5 : 1;

      if(isActive) {
        fill = "rgba(250, 204, 21, 0.85)"; // pos-yellow
        textColor = "rgba(0,0,0,0.85)";
      } else if (jointDataForThisDot && Object.keys(jointDataForThisDot).length > 0) {
         // Check for specific orientations for coloring
        if (jointDataForThisDot.orientation === 'IN' || jointDataForThisDot.orientation_frontal === 'INVERT' || jointDataForThisDot.orientation_transverse === 'ADDUCT_F') {
            fill = "rgba(59, 130, 246, 0.7)"; // Blue for IN-like
        } else if (jointDataForThisDot.orientation === 'OUT' || jointDataForThisDot.orientation_frontal === 'EVERT' || jointDataForThisDot.orientation_transverse === 'ABDUCT_F') {
            fill = "rgba(249, 115, 22, 0.7)"; // Orange for OUT-like
        } else {
            fill = "rgba(156, 163, 175, 0.75)"; // gray-400 if has data but not specific IN/OUT
        }
        textColor = "rgba(255,255,255,0.9)";
      }

      return (
        <g key={`joint-group-${jointAbbrev}`} transform={`translate(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`}
           className="cursor-pointer" // For future draggable/clickable
           // onClick={() => onJointClick && onJointClick(jointAbbrev)} // Phase 2
           // onMouseDown={(e) => onJointDragStart && onJointDragStart(e, jointAbbrev)} // Phase 3
        >
          <circle
            cx={0} cy={0} r={radius.toFixed(2)}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeW}
          />
          <text
            x={0} y={0}
            dominantBaseline="middle" textAnchor="middle"
            fontSize={`${fontSize}px`} // Apply dynamic font size
            className="font-mono select-none pointer-events-none"
            fill={textColor}
            fontWeight={isActive ? "bold" : "normal"}
          >
            {initials}
          </text>
        </g>
      );
  }), [getJointPos, highlightJoint, jointInfoData, width, height]);

  return (
    <div className={`p-1 sm:p-2 bg-gray-700/30 rounded-lg shadow-inner border border-gray-600/50 ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="2D Skeletal Pose Visualization">
        {showLines && <g>{renderedSegments}</g>}
        <g>{renderedJointDots}</g>
      </svg>
    </div>
  );
};

SkeletalPoseVisualizer2D.propTypes = {
  jointInfoData: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  highlightJoint: PropTypes.string,
  showLines: PropTypes.bool,
  className: PropTypes.string,
  // onJointClick: PropTypes.func, // For Phase 2
  // onJointDragStart: PropTypes.func, // For Phase 3
};

// Default props remain same
SkeletalPoseVisualizer2D.defaultProps = {
  jointInfoData: {},
  width: 220, // Increased default
  height: 300, // Increased default
  showLines: true,
  className: "",
};


export default React.memo(SkeletalPoseVisualizer2D);
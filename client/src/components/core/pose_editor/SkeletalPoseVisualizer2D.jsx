// src/components/core/pose_editor/SkeletalPoseVisualizer2D.jsx
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    BODY_SEGMENTS,
    DEFAULT_POSITIONS_2D,
    Z_DEPTH_JOINT_SCALES,
    DEFAULT_JOINT_CIRCLE_RADIUS,
    SKELETAL_VIZ_MODAL_DOT_RADIUS,
    SKELETAL_VIZ_MODAL_HIGHLIGHT_MULTIPLIER
} from '../../../utils/constants';
// ALL_JOINTS_MAP could be used for tooltips on dots if desired in future
// import { ALL_JOINTS_MAP } from '../../../utils/sounds';

const SkeletalPoseVisualizer2D = ({
  jointInfoData = {},
  width = 220,
  height = 300,
  highlightJoint, // The joint to highlight (e.g., activeEditingJoint)
  showLines = true,
  className = "",
  useDotsInModal = false, // If true, renders small dots, no abbreviations unless highlighted
  onJointClick, // Optional: (jointAbbrev) => void
}) => {

  const getJointPos = useCallback((jointAbbrev) => {
    const jointData = jointInfoData?.[jointAbbrev];
    const defaultPos = DEFAULT_POSITIONS_2D[jointAbbrev];
    if (!defaultPos) {
      // console.warn(`[SkeletalPoseVisualizer2D] No default position for joint: ${jointAbbrev}`);
      return null;
    }

    let x = defaultPos.x * width;
    let y = defaultPos.y * height;
    let z = 0;

    if (jointData?.vector) {
      const spreadFactor = 2.8; // Adjust for desired spread from center
      x = (jointData.vector.x * (width / spreadFactor)) + (width / 2);
      y = (-jointData.vector.y * (height / spreadFactor)) + (height / 2); // Y is inverted for screen
      z = jointData.vector.z ?? 0;
    }
    return { x, y, z };
  }, [jointInfoData, width, height]);

  const renderedSegments = useMemo(() => {
    if (!showLines || !BODY_SEGMENTS) return null;
    return BODY_SEGMENTS.map((seg, index) => {
      const p1 = getJointPos(seg.from);
      const p2 = getJointPos(seg.to);
      if (!p1 || !p2) return null;

      let strokeColor = "rgba(107, 114, 128, 0.5)"; // gray-500 with opacity
      let currentStrokeWidth = 1.5;
      const proximalJointData = jointInfoData?.[seg.from];

      if (proximalJointData?.orientation === 'IN') strokeColor = "rgba(59, 130, 246, 0.7)"; // blue-500
      else if (proximalJointData?.orientation === 'OUT') strokeColor = "rgba(249, 115, 22, 0.7)"; // orange-500
      
      if (highlightJoint && (seg.from === highlightJoint || seg.to === highlightJoint)) {
        strokeColor = "rgba(250, 204, 21, 0.9)"; // yellow-400
        currentStrokeWidth = 2.5;
      }
      
      const avgZ = (p1.z + p2.z) / 2;
      let zOpacityFactor = 1.0;
      let zWidthScale = 1.0;

      // Apply scaling and opacity based on Z-depth
      if (avgZ >= 0.75) { zWidthScale = Z_DEPTH_JOINT_SCALES.FAR; zOpacityFactor = 0.4; }
      else if (avgZ >= 0.25) { zWidthScale = (Z_DEPTH_JOINT_SCALES.FAR + Z_DEPTH_JOINT_SCALES.NEUTRAL) / 2 ; zOpacityFactor = 0.65; }
      else if (avgZ <= -0.75) { zWidthScale = Z_DEPTH_JOINT_SCALES.NEAR; zOpacityFactor = 1.0; }
      else if (avgZ <= -0.25) { zWidthScale = (Z_DEPTH_JOINT_SCALES.NEAR + Z_DEPTH_JOINT_SCALES.NEUTRAL) / 2 ; zOpacityFactor = 1.0; }
      
      currentStrokeWidth *= zWidthScale;
      if (strokeColor.startsWith('rgba')) {
        const parts = strokeColor.match(/[\d\.]+/g);
        if (parts && parts.length === 4) { // e.g., rgba(r,g,b,a)
          strokeColor = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parseFloat(parts[3]) * zOpacityFactor})`;
        }
      }
      return (
        <line
          key={`seg-${index}-${seg.from}-${seg.to}`}
          x1={p1.x} y1={p1.y}
          x2={p2.x} y2={p2.y}
          stroke={strokeColor}
          strokeWidth={Math.max(0.5, currentStrokeWidth)}
          strokeLinecap="round"
        />
      );
    });
  }, [getJointPos, highlightJoint, jointInfoData, showLines]);

  const renderedJointDots = useMemo(() =>
    Object.keys(DEFAULT_POSITIONS_2D).map((jointAbbrev) => {
      const pos = getJointPos(jointAbbrev);
      if (!pos) return null;

      const isActive = jointAbbrev === highlightJoint;
      const jointZ = pos.z;
      const jointData = jointInfoData?.[jointAbbrev];

      let zScale = Z_DEPTH_JOINT_SCALES.NEUTRAL;
      if (jointZ >= 0.75) zScale = Z_DEPTH_JOINT_SCALES.FAR;
      else if (jointZ >= 0.25) zScale = (Z_DEPTH_JOINT_SCALES.FAR + Z_DEPTH_JOINT_SCALES.NEUTRAL) / 2;
      else if (jointZ <= -0.75) zScale = Z_DEPTH_JOINT_SCALES.NEAR;
      else if (jointZ <= -0.25) zScale = (Z_DEPTH_JOINT_SCALES.NEAR + Z_DEPTH_JOINT_SCALES.NEUTRAL) / 2;
      
      const baseRadius = useDotsInModal ? SKELETAL_VIZ_MODAL_DOT_RADIUS : DEFAULT_JOINT_CIRCLE_RADIUS;
      const radiusMultiplier = isActive ? (useDotsInModal ? SKELETAL_VIZ_MODAL_HIGHLIGHT_MULTIPLIER : 1.5) : 1;
      let radius = Math.max(useDotsInModal ? 3 : 4, baseRadius * zScale * radiusMultiplier);

      // Apply energy scaling if energy data exists and not in modal simple dot mode (unless highlighted)
      if (jointData?.energy !== undefined && (!useDotsInModal || isActive)) {
        const energyScale = 0.8 + ( (jointData.energy / 100) * 0.4 ); // Scale from 0.8 to 1.2 based on energy
        radius *= energyScale;
      }
      radius = Math.max(useDotsInModal ? 3 : 4, radius); // Ensure min radius

      let fill = "rgba(107, 114, 128, 0.7)"; // Default gray
      let stroke = isActive ? "rgba(250, 204, 21, 1)" : "rgba(55, 65, 81, 0.9)"; // Darker gray
      let strokeW = isActive ? 1.5 : 0.5;
      let textColor = isActive ? "rgba(0,0,0,0.85)" : "rgba(209, 213, 219, 0.9)"; // Default: gray-300

      if (isActive) {
        fill = "rgba(250, 204, 21, 0.9)"; // Bright yellow for active
      } else if (jointData && Object.keys(jointData).length > 0) { // Programmed but not active
        fill = "rgba(156, 163, 175, 0.8)"; // A slightly more prominent gray for programmed
        if (jointData.orientation === 'IN') fill = "rgba(96, 165, 250, 0.8)"; // Lighter Blue for IN
        else if (jointData.orientation === 'OUT') fill = "rgba(251, 146, 60, 0.8)"; // Lighter Orange for OUT
      }

      const initials = jointAbbrev.replace(/[^A-Z0-9]/gi, '').substring(0, useDotsInModal ? 0 : 2).toUpperCase(); // No initials in modal unless we change logic
      let fontSize = useDotsInModal ? 0 : (10 * zScale * radiusMultiplier); // No text by default in modal dot mode
      if (isActive && useDotsInModal) { // Maybe show abbreviation if active in modal
          // fontSize = SKELETAL_VIZ_MODAL_DOT_RADIUS * 0.8; // Small text for active dot in modal
          // initials = jointAbbrev.substring(0,1); // Single initial if active in modal
      }


      return (
        <g
          key={`joint-group-${jointAbbrev}`}
          transform={`translate(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`}
          className={onJointClick ? "cursor-pointer hover:opacity-80" : ""}
          onClick={(e) => {
            if (onJointClick) {
              e.stopPropagation(); // Prevent clicks on underlying elements if necessary
              onJointClick(jointAbbrev);
            }
          }}
        >
          <circle
            cx={0}
            cy={0}
            r={radius.toFixed(2)}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeW}
          />
          {initials && fontSize > 0 && (
            <text
              x={0}
              y={0}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={`${Math.max(6, fontSize.toFixed(1))}px`}
              className="font-mono select-none pointer-events-none"
              fill={textColor}
              fontWeight={isActive ? "bold" : "normal"}
            >
              {initials}
            </text>
          )}
        </g>
      );
  }), [getJointPos, highlightJoint, jointInfoData, width, height, useDotsInModal, onJointClick]);

  return (
    <div className={`p-1 sm:p-2 bg-gray-800/20 rounded-lg shadow-inner border border-gray-700/30 ${className}`}>
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
  useDotsInModal: PropTypes.bool,
  onJointClick: PropTypes.func,
};

SkeletalPoseVisualizer2D.defaultProps = {
  jointInfoData: {},
  width: 220,
  height: 300,
  showLines: true,
  className: "",
  useDotsInModal: false,
};

export default React.memo(SkeletalPoseVisualizer2D);
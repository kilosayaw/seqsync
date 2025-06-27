// src/components/core/pose_editor/P5SkeletalVisualizer.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Sketch from 'react-p5';

// [UPGRADED] Add SVG_WIDTH_DEFAULT and SVG_HEIGHT_DEFAULT to the import
import {
    BODY_SEGMENTS,
    DEFAULT_POSITIONS_2D,
    Z_DEPTH_JOINT_SCALES,
    DEFAULT_JOINT_CIRCLE_RADIUS,
    POSE_DEFAULT_VECTOR,
    SVG_WIDTH_DEFAULT,
    SVG_HEIGHT_DEFAULT
} from '../../../utils/constants';

/**
 * A P5.js-based skeletal visualizer capable of rendering "ribbon" limbs
 * to show rotational torsion, which is not possible with simple SVG lines.
 *
 * --- HOW TO USE IN PARENT COMPONENT ---
 * This component requires an animation loop managed by its parent.
 *
 * const [currentPose, setCurrentPose] = useState(initialPose);
 * const [targetPose, setTargetPose] = useState(initialPose);
 * const [lerpAmount, setLerpAmount] = useState(1);
 *
 * // When the pose changes:
 * useEffect(() => {
 *   setTargetPose(newPoseData); // Set the destination
 *   setLerpAmount(0); // Reset the animation progress
 * }, [newPoseData]);
 *
 * // Animation loop:
 * useEffect(() => {
 *   if (lerpAmount >= 1) return;
 *   const animationFrame = requestAnimationFrame(() => {
 *     setLerpAmount(prev => Math.min(prev + 0.05, 1)); // Animate over ~20 frames
 *   });
 *   return () => cancelAnimationFrame(animationFrame);
 * }, [lerpAmount]);
 *
 * <P5SkeletalVisualizer
 *   fullPoseState={currentPose} // The pose object for the *start* of the lerp
 *   targetPose={targetPose}     // The pose object for the *end* of the lerp
 *   lerpAmount={lerpAmount}     // The progress of the animation [0, 1]
 *   highlightJoint={activeJoint}
 * />
 */
const P5SkeletalVisualizer = ({
    fullPoseState = {},
    targetPose = {},
    lerpAmount = 1,
    highlightJoint = null,
    className = "",
}) => {

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    const setup = (p, canvasParentRef) => {
        p.createCanvas(SVG_WIDTH_DEFAULT, SVG_HEIGHT_DEFAULT).parent(canvasParentRef);
        p.angleMode(p.DEGREES); // Use degrees to match our data model
    };

    const draw = (p) => {
        p.background(24, 32, 42); // A slightly different dark blue
        p.translate(p.width / 2, p.height / 2);

        if (!fullPoseState || Object.keys(fullPoseState).length === 0) return;
        
        // --- 1. Interpolate the entire pose for this frame ---
        const interpolatedPose = {};
        for (const jointAbbrev in DEFAULT_POSITIONS_2D) {
            const startJoint = fullPoseState[jointAbbrev] || {};
            const endJoint = targetPose[jointAbbrev] || startJoint;
            
            const startVec = startJoint.vector || POSE_DEFAULT_VECTOR;
            const endVec = endJoint.vector || POSE_DEFAULT_VECTOR;
            const startRot = startJoint.rotation || 0;
            const endRot = endJoint.rotation || startRot;
            
            interpolatedPose[jointAbbrev] = {
                vector: {
                    x: lerp(startVec.x, endVec.x, lerpAmount),
                    y: lerp(startVec.y, endVec.y, lerpAmount),
                    z: lerp(startVec.z, endVec.z, lerpAmount),
                },
                rotation: lerp(startRot, endRot, lerpAmount),
                // Lerp other properties as needed (e.g., orientation for color)
                orientation: lerpAmount < 0.5 ? startJoint.orientation : endJoint.orientation,
            };
        }

        // --- 2. Calculate Screen Positions for all interpolated joints ---
        const jointPositions = {};
        for (const jointAbbrev in interpolatedPose) {
            const defaultPos = DEFAULT_POSITIONS_2D[jointAbbrev];
            if (!defaultPos) continue;

            const { vector } = interpolatedPose[jointAbbrev];
            const spreadFactor = (p.width + p.height) / 160;

            jointPositions[jointAbbrev] = {
                x: (vector.x * spreadFactor),
                y: (-vector.y * spreadFactor),
                z: vector.z,
            };
        }

        // --- 3. Draw Segments as Ribbons ---
        BODY_SEGMENTS.forEach((seg, index) => {
            const p1Data = interpolatedPose[seg.from];
            const p2Data = interpolatedPose[seg.to];
            const p1Pos = jointPositions[seg.from];
            const p2Pos = jointPositions[seg.to];

            if (!p1Data || !p2Data || !p1Pos || !p2Pos) return;

            const isHighlighted = highlightJoint && (seg.from === highlightJoint || seg.to === highlightJoint);
            
            drawRibbonLimb(
                p,
                p.createVector(p1Pos.x, p1Pos.y), // startVec
                p.createVector(p2Pos.x, p2Pos.y), // endVec
                p1Data.rotation,                  // startRot
                p2Data.rotation,                  // endRot
                12,                               // width
                isHighlighted
            );
        });

        // --- 4. Draw Joints (Dots) ---
        for (const jointAbbrev in interpolatedPose) {
            const pos = jointPositions[jointAbbrev];
            if (!pos) continue;

            const jointData = interpolatedPose[jointAbbrev];
            const isActive = jointAbbrev === highlightJoint;
            
            const zScale = jointData.vector.z === 1 ? Z_DEPTH_JOINT_SCALES.FAR : (jointData.vector.z === -1 ? Z_DEPTH_JOINT_SCALES.NEAR : Z_DEPTH_JOINT_SCALES.NEUTRAL);
            const radius = DEFAULT_JOINT_CIRCLE_RADIUS * zScale * (isActive ? 1.7 : 1.2);
            
            let fill = p.color(107, 114, 128, 200); // Default gray
            if (isActive) {
                fill = p.color(250, 204, 21, 230); // Highlight yellow
            } else if (jointData.orientation === 'IN') {
                fill = p.color(96, 165, 250, 220); // Blue for IN
            } else if (jointData.orientation === 'OUT') {
                fill = p.color(251, 146, 60, 220); // Orange for OUT
            }
            
            p.noStroke();
            p.fill(fill);
            if (isActive) {
                p.stroke(255);
                p.strokeWeight(2);
            }
            p.ellipse(pos.x, pos.y, radius, radius);
        }
    };

    /**
     * Helper function to draw a limb as a twisting two-tone ribbon.
     */
    const drawRibbonLimb = (p, startVec, endVec, startRot, endRot, width = 10, isHighlighted) => {
        const limbVec = p5.Vector.sub(endVec, startVec);
        const perpVec = limbVec.copy().rotate(p.HALF_PI).normalize();
        
        const w_half = width / 2;
        
        // Calculate the four corner vectors of the ribbon relative to the start/end points
        const p1_offset = perpVec.copy().mult(w_half).rotate(startRot);
        const p2_offset = perpVec.copy().mult(-w_half).rotate(startRot);
        const p3_offset = perpVec.copy().mult(-w_half).rotate(endRot);
        const p4_offset = perpVec.copy().mult(w_half).rotate(endRot);

        // Calculate the absolute positions of the four corners
        const p1 = p5.Vector.add(startVec, p1_offset);
        const p2 = p5.Vector.add(startVec, p2_offset);
        const p3 = p5.Vector.add(endVec, p3_offset);
        const p4 = p5.Vector.add(endVec, p4_offset);

        p.noStroke();

        // Front Face (e.g., Cyan/Blue for 'IN' rotation tendency)
        const frontColor = isHighlighted ? p.color(250, 204, 21, 200) : p.color(96, 165, 250, 150);
        p.fill(frontColor);
        p.quad(p1.x, p1.y, p4.x, p4.y, p3.x, p3.y, p2.x, p2.y);
        
        // Back Face (e.g., Orange/Red for 'OUT' rotation tendency)
        // We can draw this with a slight offset or just not draw it to keep it simple,
        // but for a true ribbon effect, we draw it. The twisting quad will reveal it.
        // const backColor = isHighlighted ? p.color(255, 255, 255, 200) : p.color(251, 146, 60, 150);
        // p.fill(backColor);
        // p.quad(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, p1.x, p1.y); // Drawing in reverse order
    };

    return (
        <div className={`bg-gray-900/50 rounded-lg shadow-inner border border-gray-700/30 overflow-hidden ${className}`}>
            <Sketch setup={setup} draw={draw} />
        </div>
    );
};

P5SkeletalVisualizer.propTypes = {
    // The starting pose for the animation frame
    fullPoseState: PropTypes.object,
    // The destination pose for the animation
    targetPose: PropTypes.object,
    // The progress of the animation, from 0 to 1
    lerpAmount: PropTypes.number,
    // The abbreviation of the currently selected joint to highlight
    highlightJoint: PropTypes.string,
    // Additional classes for the container
    className: PropTypes.string,
};

export default React.memo(P5SkeletalVisualizer);
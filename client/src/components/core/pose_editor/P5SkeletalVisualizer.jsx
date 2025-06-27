import React from 'react';
import PropTypes from 'prop-types';
import Sketch from 'react-p5';

import {
    BODY_SEGMENTS,
    DEFAULT_POSITIONS_2D,
    Z_DEPTH_JOINT_SCALES,
    DEFAULT_JOINT_CIRCLE_RADIUS,
    POSE_DEFAULT_VECTOR,
    SVG_WIDTH_DEFAULT,
    SVG_HEIGHT_DEFAULT
} from '../../../utils/constants';

const P5SkeletalVisualizer = ({
    fullPoseState = {},
    targetPose = {},
    lerpAmount = 1,
    highlightJoint = null,
    kineticFlow = { path: [], momentum: 0 },
    centerOfMass = POSE_DEFAULT_VECTOR,
    grounding = {}, // <-- Accept grounding prop
    className = "",
}) => {

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    const spreadFactor = (SVG_WIDTH_DEFAULT + SVG_HEIGHT_DEFAULT) / 10;

    const setup = (p, canvasParentRef) => {
        p.createCanvas(SVG_WIDTH_DEFAULT, SVG_HEIGHT_DEFAULT).parent(canvasParentRef);
        p.angleMode(p.DEGREES);
    };

    const draw = (p) => {
        p.clear();
        p.translate(p.width / 2, p.height / 2);

        if (!fullPoseState || Object.keys(fullPoseState).length === 0) return;
        
        const interpolatedPose = {};
        const jointPositions = {};
        
        for (const jointAbbrev in DEFAULT_POSITIONS_2D) {
            const startJoint = fullPoseState[jointAbbrev] || {};
            const endJoint = targetPose[jointAbbrev] || startJoint;
            const startVec = startJoint.vector || POSE_DEFAULT_VECTOR;
            const endVec = endJoint.vector || POSE_DEFAULT_VECTOR;
            const startRot = startJoint.rotation || 0;
            const endRot = endJoint.rotation || startRot;
            
            interpolatedPose[jointAbbrev] = {
                vector: { x: lerp(startVec.x, endVec.x, lerpAmount), y: lerp(startVec.y, endVec.y, lerpAmount), z: lerp(startVec.z, endVec.z, lerpAmount) },
                rotation: lerp(startRot, endRot, lerpAmount),
                orientation: lerpAmount < 0.5 ? startJoint.orientation : endJoint.orientation,
            };
            const { vector } = interpolatedPose[jointAbbrev];
            jointPositions[jointAbbrev] = { x: (vector.x * spreadFactor), y: (-vector.y * spreadFactor), z: vector.z };
        }
        
        const kineticPath = kineticFlow?.path || [];
        const momentum = kineticFlow?.momentum || 0;

        BODY_SEGMENTS.forEach((seg) => {
            const p1Data = interpolatedPose[seg.from], p2Data = interpolatedPose[seg.to];
            const p1Pos = jointPositions[seg.from], p2Pos = jointPositions[seg.to];
            if (!p1Data || !p2Data || !p1Pos || !p2Pos) return;
            const isHighlighted = highlightJoint && (seg.from === highlightJoint || seg.to === highlightJoint);
            const isInKineticPath = kineticPath.includes(seg.from) && kineticPath.includes(seg.to);
            drawRibbonLimb(p, p.createVector(p1Pos.x, p1Pos.y), p.createVector(p2Pos.x, p2Pos.y), p1Data.rotation, p2Data.rotation, 12, isHighlighted, isInKineticPath, momentum);
        });

        for (const jointAbbrev in interpolatedPose) {
            const pos = jointPositions[jointAbbrev];
            if (!pos) continue;
            const jointData = interpolatedPose[jointAbbrev];
            const isActive = jointAbbrev === highlightJoint;
            const isInKineticPath = kineticPath.includes(jointAbbrev);
            const zScale = jointData.vector.z > 0.1 ? Z_DEPTH_JOINT_SCALES.FAR : (jointData.vector.z < -0.1 ? Z_DEPTH_JOINT_SCALES.NEAR : Z_DEPTH_JOINT_SCALES.NEUTRAL);
            const radius = DEFAULT_JOINT_CIRCLE_RADIUS * zScale * (isActive ? 1.5 : 1);
            let fill = p.color(107, 114, 128, 180);
            if (isActive) fill = p.color(250, 204, 21);
            else if (isInKineticPath) fill = p.color(29, 255, 187);
            p.noStroke();
            p.fill(fill);
            if (isActive) { p.stroke(255); p.strokeWeight(1.5); }
            if (isInKineticPath) {
                const glowSize = radius * (1.5 + (momentum / 100));
                p.fill(29, 255, 187, 80);
                p.ellipse(pos.x, pos.y, glowSize, glowSize);
            }
            p.fill(fill);
            p.ellipse(pos.x, pos.y, radius, radius);
        }
        
        drawHeadIndicator(p, jointPositions['H'], interpolatedPose['N']?.rotation || 0);
        
        // Call new visualization functions
        drawCenterOfMass(p, centerOfMass);
        drawGroundingConnection(p, grounding, jointPositions, centerOfMass);
    };

    const drawRibbonLimb = (p, startVec, endVec, startRot, endRot, width, isHighlighted, isKinetic, momentum) => {
        const limbVec = p.constructor.Vector.sub(endVec, startVec);
        const perpVec = limbVec.copy().rotate(90).normalize();
        
        // Enhance kinetic visualization with momentum
        const kineticWidthBonus = isKinetic ? p.map(momentum, 0, 100, 0, width * 0.5, true) : 0;
        const w_half = (width + kineticWidthBonus) / 2;

        const p1_offset = perpVec.copy().mult(w_half).rotate(startRot);
        const p2_offset = perpVec.copy().mult(-w_half).rotate(startRot);
        const p3_offset = perpVec.copy().mult(-w_half).rotate(endRot);
        const p4_offset = perpVec.copy().mult(w_half).rotate(endRot);
        const p1 = p.constructor.Vector.add(startVec, p1_offset), p2 = p.constructor.Vector.add(startVec, p2_offset);
        const p3 = p.constructor.Vector.add(endVec, p3_offset), p4 = p.constructor.Vector.add(endVec, p4_offset);
        p.noStroke();
        const backColor = isHighlighted ? p.color(255, 220, 150, 200) : (isKinetic ? p.color(255, 100, 0, 150) : p.color(251, 146, 60, 100));
        p.fill(backColor);
        p.quad(p2.x, p2.y, p1.x, p1.y, p4.x, p4.y, p3.x, p3.y);
        const frontColor = isHighlighted ? p.color(250, 204, 21, 220) : (isKinetic ? p.color(29, 255, 187, 200) : p.color(96, 165, 250, 120));
        p.fill(frontColor);
        p.quad(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
    };

    const drawCenterOfMass = (p, comVector) => {
        if (!comVector) return;
        const comX = comVector.x * spreadFactor, comY = -comVector.y * spreadFactor;
        const pulse = p.sin(p.millis() / 200) * 2;
        p.noStroke();
        p.fill(255, 255, 0, 100);
        p.ellipse(comX, comY, 15 + pulse, 15 + pulse);
        p.fill(255, 255, 200);
        p.ellipse(comX, comY, 8, 8);
    };
    
    // NEW: Function to draw lines from grounded feet to the Center of Mass
    const drawGroundingConnection = (p, groundingData, jointPositions, comVector) => {
        if (!comVector || !groundingData) return;
        const comX = comVector.x * spreadFactor;
        const comY = -comVector.y * spreadFactor;

        p.strokeWeight(1.5);
        p.stroke(255, 255, 0, 70 + p.sin(p.millis() / 150) * 40); // Pulsing yellow alpha

        // Check Left Foot
        if (groundingData.L && groundingData.L.length > 0 && jointPositions.LA) {
            const ankle = jointPositions.LA;
            p.line(ankle.x, ankle.y, comX, comY);
        }

        // Check Right Foot
        if (groundingData.R && groundingData.R.length > 0 && jointPositions.RA) {
            const ankle = jointPositions.RA;
            p.line(ankle.x, ankle.y, comX, comY);
        }
    };

    const drawHeadIndicator = (p, headPos, neckRotation) => {
        if (!headPos) return;
        const angle = neckRotation - 90, headRadius = DEFAULT_JOINT_CIRCLE_RADIUS * 1.5;
        const noseX = headPos.x + p.cos(angle) * headRadius, noseY = headPos.y + p.sin(angle) * headRadius;
        p.fill(200);
        p.noStroke();
        p.triangle(headPos.x, headPos.y, noseX + p.cos(angle - 30) * 5, noseY + p.sin(angle - 30) * 5, noseX + p.cos(angle + 30) * 5, noseY + p.sin(angle + 30) * 5);
    };

    return <div className={`w-full h-full ${className}`}><Sketch setup={setup} draw={draw} /></div>;
};

P5SkeletalVisualizer.propTypes = {
    fullPoseState: PropTypes.object,
    targetPose: PropTypes.object,
    lerpAmount: PropTypes.number,
    highlightJoint: PropTypes.string,
    kineticFlow: PropTypes.object,
    centerOfMass: PropTypes.object,
    grounding: PropTypes.object, // Add prop type
    className: PropTypes.string,
};

export default React.memo(P5SkeletalVisualizer);
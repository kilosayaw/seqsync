import React from 'react';
import PropTypes from 'prop-types';
import Sketch from 'react-p5';
import { BODY_SEGMENTS, Z_DEPTH_JOINT_SCALES, DEFAULT_JOINT_CIRCLE_RADIUS, POSE_DEFAULT_VECTOR, RIBBON_LIMB_WIDTH } from '../../../utils/constants';
import { calculateLimbPlaneNormal } from '../../../utils/biomechanics';

const P5SkeletalVisualizer = ({
    poseToRender = {},
    highlightJoint = null,
    className = "",
}) => {

    const setup = (p, canvasParentRef) => {
        if (canvasParentRef) {
            p.createCanvas(canvasParentRef.offsetWidth, canvasParentRef.offsetHeight, p.WEBGL).parent(canvasParentRef);
            p.angleMode(p.DEGREES);
        }
    };

    const windowResized = (p, canvasParentRef) => {
        if (canvasParentRef) {
            p.resizeCanvas(canvasParentRef.offsetWidth, canvasParentRef.offsetHeight);
        }
    };

    /**
     * Draws a single limb as a 3D twisted ribbon or a dashed line.
     * @param {object} p - The p5 instance.
     * @param {p5.Vector} startPos - The 3D starting position vector.
     * @param {p5.Vector} endPos - The 3D ending position vector.
     * @param {object} startJoint - The data object for the starting joint.
     * @param {object} endJoint - The data object for the ending joint.
     * @param {number} width - The width of the ribbon.
     * @param {boolean} isHighlighted - Flag to highlight the limb.
     */
    const drawRibbonLimb = (p, startPos, endPos, startJoint, endJoint, width, isHighlighted) => {
        // --- Passthrough Intent Check ---
        // If either joint has a 'PassThrough' intent, draw a simple dashed line and exit.
        const isPassThrough = startJoint.intent === 'PassThrough' || endJoint.intent === 'PassThrough';
        if (isPassThrough) {
            p.strokeWeight(2);
            p.drawingContext.setLineDash([5, 5]); // Create the dashed effect
            p.stroke(isHighlighted ? p.color(255, 220, 150, 200) : p.color(200, 220, 255, 150));
            p.line(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z);
            p.drawingContext.setLineDash([]); // Reset for other components
            return;
        }

        // --- Standard Ribbon Rendering ---
        const limbVector = p.constructor.Vector.sub(endPos, startPos);
        const limbNormal = calculateLimbPlaneNormal(startPos, endPos);
        const w_half = width / 2;

        // Calculate the rotated normals at each end of the limb
        const startNormal = limbNormal.copy().rotate(startJoint.rotation || 0, limbVector);
        const endNormal = limbNormal.copy().rotate(endJoint.rotation || 0, limbVector);

        // Calculate the 4 vertices of the ribbon quad
        const p1 = p.constructor.Vector.add(startPos, startNormal.copy().mult(w_half));
        const p2 = p.constructor.Vector.add(startPos, startNormal.copy().mult(-w_half));
        const p3 = p.constructor.Vector.add(endPos, endNormal.copy().mult(-w_half));
        const p4 = p.constructor.Vector.add(endPos, endNormal.copy().mult(w_half));

        p.noStroke();
        
        // Render the "underside" of the ribbon (darker color)
        p.fill(isHighlighted ? p.color(150, 120, 50, 200) : p.color(59, 130, 246, 80)); // blue-500
        p.beginShape();
        p.vertex(p2.x, p2.y, p2.z);
        p.vertex(p1.x, p1.y, p1.z);
        p.vertex(p4.x, p4.y, p4.z);
        p.vertex(p3.x, p3.y, p3.z);
        p.endShape(p.CLOSE);

        // Render the "topside" of the ribbon (brighter color)
        p.fill(isHighlighted ? p.color(250, 204, 21, 220) : p.color(147, 197, 253, 150)); // blue-300
        p.beginShape();
        p.vertex(p1.x, p1.y, p1.z);
        p.vertex(p2.x, p2.y, p2.z);
        p.vertex(p3.x, p3.y, p3.z);
        p.vertex(p4.x, p4.y, p4.z);
        p.endShape(p.CLOSE);
    };
    
    const draw = (p) => {
        p.clear();
        p.orbitControl(); // Allow user to rotate the view

        if (!poseToRender || Object.keys(poseToRender).length === 0) return;
        
        const spreadFactor = (p.width + p.height) / 8; // Increased spread for better 3D view
        const jointPositions = {};
        
        // First, calculate all 3D positions in the canvas space
        for (const jointAbbrev in poseToRender) {
            const jointData = poseToRender[jointAbbrev];
            const vector = jointData?.vector || POSE_DEFAULT_VECTOR;
            jointPositions[jointAbbrev] = p.createVector(vector.x * spreadFactor, -vector.y * spreadFactor, vector.z * spreadFactor);
        }

        // Then, draw all the ribbon limbs
        BODY_SEGMENTS.forEach((seg) => {
            const p1Data = poseToRender[seg.from];
            const p2Data = poseToRender[seg.to];
            if (p1Data && p2Data) {
                const p1Pos = jointPositions[seg.from];
                const p2Pos = jointPositions[seg.to];
                if (p1Pos && p2Pos) {
                    const isHighlighted = highlightJoint === seg.from || highlightJoint === seg.to;
                    drawRibbonLimb(p, p1Pos, p2Pos, p1Data, p2Data, RIBBON_LIMB_WIDTH, isHighlighted);
                }
            }
        });

        // Finally, draw all the joint spheres on top of the ribbons
        for (const jointAbbrev in poseToRender) {
            const jointData = poseToRender[jointAbbrev];
            if (jointData) {
                const pos = jointPositions[jointAbbrev];
                if (!pos) continue;
                
                p.push();
                p.translate(pos.x, pos.y, pos.z);

                const isActive = jointAbbrev === highlightJoint;
                const zValue = jointData.vector ? jointData.vector.z : 0;
                const zScale = Z_DEPTH_JOINT_SCALES[zValue > 0.1 ? 'FAR' : (zValue < -0.1 ? 'NEAR' : 'NEUTRAL')];
                const radius = DEFAULT_JOINT_CIRCLE_RADIUS * zScale * (isActive ? 1.5 : 1);
                
                p.noStroke();
                p.fill(isActive ? p.color(250, 204, 21) : p.color(200, 200, 200));

                p.sphere(radius);
                p.pop();
            }
        }
    };

    return <div className={`w-full h-full ${className}`}><Sketch setup={setup} draw={draw} windowResized={windowResized} /></div>;
};

P5SkeletalVisualizer.propTypes = {
    poseToRender: PropTypes.object,
    highlightJoint: PropTypes.string,
    className: PropTypes.string,
};

export default React.memo(P5SkeletalVisualizer);
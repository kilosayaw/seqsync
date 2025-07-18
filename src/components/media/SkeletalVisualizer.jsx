import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { POSE_CONNECTIONS } from '../../utils/constants.js';

function sketch(p5) {
    let poseData;
    let highlightJoints = [];
    let canvasSize = { width: 300, height: 300 };
    let colors = {};
    let internalZoom = 1.0;

    p5.updateWithProps = props => {
        if (props.poseData) poseData = props.poseData;
        if (props.highlightJoints) highlightJoints = props.highlightJoints;
        if (props.width && props.height) {
            if (canvasSize.width !== props.width || canvasSize.height !== props.height) {
                canvasSize = { width: props.width, height: props.height };
                p5.resizeCanvas(canvasSize.width, canvasSize.height);
            }
        }
    };

    p5.setup = () => {
        p5.createCanvas(canvasSize.width, canvasSize.height, p5.WEBGL);
        // Define new colors for the ribbon style
        colors = {
            highlight: p5.color('#FFDF00'),
            joint: p5.color(255),
            ribbonSideA: p5.color(255, 0, 150), // Magenta
            ribbonSideB: p5.color(0, 255, 255), // Cyan
        };
        const camZ = (canvasSize.height / 2.0) / p5.tan(p5.PI * 30.0 / 180.0);
        p5.camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
    };

    p5.draw = () => {
        p5.background(0, 0, 0, 0);
        p5.orbitControl(1, 1, 0.1);
        p5.scale(internalZoom);
        p5.ambientLight(200);
        p5.directionalLight(255, 255, 255, 0, 0, -1);
        if (poseData) {
            drawSkeleton();
        }
    };
    
    p5.mouseWheel = (event) => {
        internalZoom -= event.delta * 0.001;
        internalZoom = p5.constrain(internalZoom, 0.3, 4.0);
        return false;
    }

    const getCoords = (vector) => {
        const v = vector || { x: 0, y: 0, z: 0 };
        const scale = canvasSize.height / 3.5; 
        return p5.createVector(-v.x * scale, -v.y * scale, (v.z || 0) * scale);
    };
    
    // --- NEW: Ribbon Drawing Function ---
    function drawRibbonLimb(startJoint, endJoint) {
        if (!startJoint?.vector || !endJoint?.vector) return;

        const startPos = getCoords(startJoint.vector);
        const endPos = getCoords(endJoint.vector);

        const limbVector = p5.constructor.Vector.sub(endPos, startPos);
        const upVector = p5.createVector(0, 1, 0);
        
        // Use cross product to get a vector perpendicular to the limb, our "side" vector.
        let sideVector = limbVector.cross(upVector);
        sideVector.normalize();
        
        const ribbonWidth = 6; // Width of the ribbon in 3D space
        sideVector.mult(ribbonWidth);

        // Determine rotation based on sequence data
        const orientation = endJoint.rotationType || 'NEU';
        const intensity = endJoint.rotationIntensity || 0;
        let rotationAngle = 0;
        const maxRotation = p5.PI / 2; // 90 degrees max twist

        if (orientation === 'IN') {
            rotationAngle = (intensity / 100) * maxRotation;
        } else if (orientation === 'OUT') {
            rotationAngle = (intensity / 100) * -maxRotation;
        }

        // Rotate the side vector at the end joint to create the twist
        const rotatedSideVector = sideVector.copy().rotate(rotationAngle, limbVector);

        // Define the 4 vertices of the ribbon quadrilateral
        const v1 = p5.constructor.Vector.add(startPos, sideVector);
        const v2 = p5.constructor.Vector.sub(startPos, sideVector);
        const v3 = p5.constructor.Vector.add(endPos, rotatedSideVector);
        const v4 = p5.constructor.Vector.sub(endPos, rotatedSideVector);

        // Draw the ribbon as two triangles to have two different colors
        p5.noStroke();
        
        // Triangle 1 (Side A)
        p5.fill(colors.ribbonSideA);
        p5.beginShape();
        p5.vertex(v1.x, v1.y, v1.z);
        p5.vertex(v2.x, v2.y, v2.z);
        p5.vertex(v3.x, v3.y, v3.z);
        p5.endShape(p5.CLOSE);

        // Triangle 2 (Side B)
        p5.fill(colors.ribbonSideB);
        p5.beginShape();
        p5.vertex(v2.x, v2.y, v2.z);
        p5.vertex(v4.x, v4.y, v4.z);
        p5.vertex(v3.x, v3.y, v3.z);
        p5.endShape(p5.CLOSE);
    }

    function drawSkeleton() {
        if (!poseData.jointInfo) return;
        const joints = poseData.jointInfo;

        // Draw Limbs as Ribbons
        POSE_CONNECTIONS.forEach(([startKey, endKey]) => {
            drawRibbonLimb(joints[startKey], joints[endKey]);
        });

        // Draw Joints as Spheres (on top of ribbons)
        p5.noStroke();
        for (const key in joints) {
            const joint = joints[key];
            if (joint?.vector && joint.score > 0.5) {
                const pos = getCoords(joint.vector);
                const isHighlighted = highlightJoints.includes(key);
                p5.push();
                p5.translate(pos.x, pos.y, pos.z);
                p5.ambientMaterial(isHighlighted ? colors.highlight : colors.joint);
                p5.sphere(isHighlighted ? 10 : 8);
                p5.pop();
            }
        }
    }
}

const SkeletalVisualizer = (props) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
            <ReactP5Wrapper {...props} sketch={sketch} />
        </div>
    );
};

SkeletalVisualizer.propTypes = {
    // The poseData prop now needs the full joint object for rotation data.
    poseData: PropTypes.shape({
        jointInfo: PropTypes.object,
    }),
    highlightJoints: PropTypes.arrayOf(PropTypes.string),
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(SkeletalVisualizer);
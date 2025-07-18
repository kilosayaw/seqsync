import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { POSE_CONNECTIONS, CORE_CONNECTIONS } from '../../utils/constants.js';

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
        colors = {
            highlight: p5.color('#FFDF00'), line: p5.color(255, 255, 255, 150),
            joint: p5.color(255), tether: p5.color(180, 180, 200, 80)
        };
        const camZ = (canvasSize.height / 2.0) / p5.tan(p5.PI * 30.0 / 180.0);
        p5.camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
    };

    p5.draw = () => {
        p5.background(0, 0, 0, 0);
        p5.orbitControl(1, 1, 0.1);
        p5.scale(internalZoom);
        p5.ambientLight(150);
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
        // --- DEFINITIVE FIX: Use a much larger divisor to "zoom out" ---
        // This will make the rendered skeleton significantly smaller, ensuring it fits.
        const scale = canvasSize.height / 3.5; 
        return p5.createVector(-v.x * scale, -v.y * scale, (v.z || 0) * scale);
        // --- END OF FIX ---
    };

    function drawSkeleton() {
        if (!poseData.jointInfo) return;
        const joints = poseData.jointInfo;

        p5.strokeWeight(2);
        p5.stroke(colors.tether);
        CORE_CONNECTIONS.forEach(([startKey, endKey]) => {
            const startJoint = joints[startKey];
            const endJoint = joints[endKey];
            if (startJoint?.vector && endJoint?.vector) {
                const start = getCoords(startJoint.vector);
                const end = getCoords(endJoint.vector);
                p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
            }
        });

        p5.strokeWeight(3);
        p5.stroke(colors.line);
        POSE_CONNECTIONS.forEach(([startKey, endKey]) => {
            const startJoint = joints[startKey];
            const endJoint = joints[endKey];
            if (startJoint?.vector && endJoint?.vector) {
                const start = getCoords(startJoint.vector);
                const end = getCoords(endJoint.vector);
                p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
            }
        });

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
    poseData: PropTypes.object,
    highlightJoints: PropTypes.arrayOf(PropTypes.string),
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(SkeletalVisualizer);
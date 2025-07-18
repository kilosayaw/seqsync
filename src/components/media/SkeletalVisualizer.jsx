import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { POSE_CONNECTIONS, CORE_CONNECTIONS } from '../../utils/constants';

function sketch(p5) {
    let poseData;
    let highlightJoints = [];
    let canvasSize = { width: 300, height: 300 };
    let colors = {};
    let activeJointId = null;

    p5.updateWithProps = props => {
        // This is where React props are passed into the p5 sketch.
        // We assign them to the sketch's p5.props object.
        p5.props = props; 
        if (props.poseData) poseData = props.poseData;
        if (props.activeJointId) activeJointId = props.activeJointId;
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
        
        // --- DEFINITIVE FIX: Safety check for props ---
        // The draw loop can run before props are available. We must check first.
        if (p5.props && p5.props.zoom) {
            p5.scale(p5.props.zoom);
        } else {
            p5.scale(1.0); // Default zoom if props haven't arrived yet
        }
        // --- END OF FIX ---

        p5.ambientLight(150);
        p5.directionalLight(255, 255, 255, 0, 0, -1);
        if (poseData) {
            drawSkeleton();
        }
    };
    
    p5.mouseWheel = (event) => {
        // The callback to React remains the same
        if (p5.props && p5.props.onZoomChange) {
            const currentZoom = p5.props.zoom || 1.0;
            let newZoom = currentZoom - event.delta * 0.001;
            newZoom = p5.constrain(newZoom, 0.3, 4.0);
            p5.props.onZoomChange(newZoom);
        }
        return false;
    }

    const getCoords = (vector) => {
        const v = vector || { x: 0, y: 0, z: 0 };
        const scale = canvasSize.height / 2.5;
        return p5.createVector(-v.x * scale, -v.y * scale, (v.z || 0) * scale);
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
                const isHighlighted = activeJointId === key;
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
    activeJointId: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    zoom: PropTypes.number,
    onZoomChange: PropTypes.func,
};

export default React.memo(SkeletalVisualizer);
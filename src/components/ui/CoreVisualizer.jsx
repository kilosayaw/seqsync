// src/components/ui/CoreVisualizer.jsx
import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';

// This is the P5 sketch function that will handle both 2D and 3D rendering
function sketch(p5) {
    let pose, highlightedJoint, viewMode, canvasSize = { width: 300, height: 300 };
    let colors = {};

    p5.updateWithProps = props => {
        if (props.pose) pose = props.pose;
        if (props.highlightedJoint !== undefined) highlightedJoint = props.highlightedJoint;
        if (props.viewMode) viewMode = props.viewMode;
        if (props.width && props.height) {
            if (canvasSize.width !== props.width || canvasSize.height !== props.height) {
                canvasSize = { width: props.width, height: props.height };
                p5.resizeCanvas(canvasSize.width, canvasSize.height);
            }
        }
    };

    p5.setup = () => {
        p5.createCanvas(canvasSize.width, canvasSize.height, p5.WEBGL);
        p5.angleMode(p5.DEGREES);
        colors = {
            highlight: p5.color('#FFDF00'),
            line: p5.color(255, 255, 255, 200),
            joint: p5.color('#00e676'),
            core: p5.color('#00b0ff'),
        };
    };

    p5.draw = () => {
        p5.background(0, 0, 0, 0); // Transparent background

        if (!pose?.jointInfo) return;
        
        if (viewMode === '2d') {
            draw2DMode(pose.jointInfo);
        } else if (viewMode === '3d') {
            draw3DMode(pose.jointInfo);
        }
    };

    function draw2DMode(jointInfo) {
        p5.push();
        p5.ortho(); // Switch to 2D orthographic projection
        p5.translate(-canvasSize.width / 2, -canvasSize.height / 2); // Adjust for 2D coordinate system

        const getJoint = (id) => jointInfo[id] || { vector: { x: 0, y: 0 }, score: 0 };
        const joints = {
            LS: getJoint('LS'), RS: getJoint('RS'),
            LH: getJoint('LH'), RH: getJoint('RH')
        };
        
        // Calculate Core position as the average of the four joints
        const corePos = {
            x: (joints.LS.vector.x + joints.RS.vector.x + joints.LH.vector.x + joints.RH.vector.x) / 4,
            y: (joints.LS.vector.y + joints.RS.vector.y + joints.LH.vector.y + joints.RH.vector.y) / 4,
        };

        const getCoords = (vector) => ({
            x: (vector.x + 1) / 2 * canvasSize.width,
            y: (-vector.y + 1) / 2 * canvasSize.height,
        });

        const ls = getCoords(joints.LS.vector);
        const rs = getCoords(joints.RS.vector);
        const lh = getCoords(joints.LH.vector);
        const rh = getCoords(joints.RH.vector);
        const core = getCoords(corePos);
        
        // Draw connections
        p5.stroke(colors.line);
        p5.strokeWeight(2);
        p5.line(ls.x, ls.y, rs.x, rs.y); // Shoulder line
        p5.line(lh.x, lh.y, rh.x, rh.y); // Hip line
        p5.line(ls.x, ls.y, core.x, core.y);
        p5.line(rs.x, rs.y, core.x, core.y);
        p5.line(lh.x, lh.y, core.x, core.y);
        p5.line(rh.x, rh.y, core.x, core.y);

        // Draw joints
        p5.noStroke();
        Object.entries({LS: ls, RS: rs, LH: lh, RH: rh}).forEach(([id, pos]) => {
            p5.fill(id === highlightedJoint ? colors.highlight : colors.joint);
            p5.circle(pos.x, pos.y, 16);
        });

        // Draw Core
        p5.fill(highlightedJoint === 'CORE' ? colors.highlight : colors.core);
        p5.circle(core.x, core.y, 20);
        p5.pop();
    }

    function draw3DMode(jointInfo) {
        p5.orbitControl(1, 1, 0.1);
        p5.ambientLight(150);
        p5.pointLight(255, 255, 255, 0, -200, 200);
        
        const getJoint = (id) => jointInfo[id] || { vector: { x: 0, y: 0, z: 0 }, score: 0 };
        const joints = {
            LS: getJoint('LS'), RS: getJoint('RS'),
            LH: getJoint('LH'), RH: getJoint('RH')
        };
        
        const corePos = {
            x: (joints.LS.vector.x + joints.RS.vector.x + joints.LH.vector.x + joints.RH.vector.x) / 4,
            y: (joints.LS.vector.y + joints.RS.vector.y + joints.LH.vector.y + joints.RH.vector.y) / 4,
            z: (joints.LS.vector.z + joints.RS.vector.z + joints.LH.vector.z + joints.RH.vector.z) / 4,
        };

        const getCoords = (vector) => ({
            x: vector.x * (canvasSize.width / 3),
            y: -vector.y * (canvasSize.height / 3),
            z: (vector.z || 0) * (canvasSize.width / 3),
        });

        const ls = getCoords(joints.LS.vector);
        const rs = getCoords(joints.RS.vector);
        const lh = getCoords(joints.LH.vector);
        const rh = getCoords(joints.RH.vector);
        const core = getCoords(corePos);

        // Draw connections
        p5.stroke(colors.line);
        p5.strokeWeight(3);
        p5.line(ls.x, ls.y, ls.z, core.x, core.y, core.z);
        p5.line(rs.x, rs.y, rs.z, core.x, core.y, core.z);
        p5.line(lh.x, lh.y, lh.z, core.x, core.y, core.z);
        p5.line(rh.x, rh.y, rh.z, core.x, core.y, core.z);

        // Draw joints
        p5.noStroke();
        Object.entries({LS: ls, RS: rs, LH: lh, RH: rh}).forEach(([id, pos]) => {
            const zValue = jointInfo[id].vector.z || 0;
            // DEFINITIVE: Scale sphere size based on Z-depth
            const sphereSize = 10 * (1 + zValue * 0.5); // Base size 10, scales up/down by 50%
            p5.push();
            p5.translate(pos.x, pos.y, pos.z);
            p5.ambientMaterial(id === highlightedJoint ? colors.highlight : colors.joint);
            p5.sphere(sphereSize);
            p5.pop();
        });

        // Draw Core
        p5.push();
        p5.translate(core.x, core.y, core.z);
        p5.ambientMaterial(highlightedJoint === 'CORE' ? colors.highlight : colors.core);
        p5.sphere(12);
        p5.pop();
    }
}

const CoreVisualizer = ({ pose, highlightedJoint, viewMode, width, height }) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
            <ReactP5Wrapper 
                sketch={sketch}
                pose={pose}
                highlightedJoint={highlightedJoint}
                viewMode={viewMode}
                width={width}
                height={height}
            />
        </div>
    );
};

CoreVisualizer.propTypes = {
    pose: PropTypes.object,
    highlightedJoint: PropTypes.string,
    viewMode: PropTypes.oneOf(['2d', '3d']).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(CoreVisualizer);
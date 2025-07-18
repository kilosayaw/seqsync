import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { CORE_CONNECTIONS } from '../../utils/constants'; // Use the specific connections

function sketch(p5) {
    let poseData;
    let highlightJoints = [];
    let canvasSize = { width: 300, height: 300 };
    let colors = {};
    let weightDistribution = 0;

    p5.updateWithProps = props => {
        if (props.poseData) poseData = props.poseData;
        if (props.highlightJoints) highlightJoints = props.highlightJoints;
        if (props.weightDistribution !== undefined) weightDistribution = props.weightDistribution;
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
            joint: p5.color(255), tether: p5.color(255, 255, 255, 100),
            core: p5.color('#00e676'), highlight: p5.color('#FFDF00'),
        };
        const camZ = (canvasSize.height / 2.0) / p5.tan(p5.PI * 30.0 / 180.0);
        p5.camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
    };

    p5.draw = () => {
        p5.background(0, 0, 0, 0);
        p5.orbitControl(1, 1, 0.1);
        p5.ambientLight(150);
        p5.directionalLight(255, 255, 255, 0, 0, -1);
        drawCoreHourglass();
    };

    const getCoords = (vector) => {
        const v = vector || { x: 0, y: 0, z: 0 };
        const scale = canvasSize.height / 3; // Adjusted scale for better default zoom
        return p5.createVector(v.x * scale, -v.y * scale, (v.z || 0) * scale);
    };

    function drawCoreHourglass() {
        if (!poseData || !poseData.jointInfo) return;
        const j = poseData.jointInfo;
        const coreJointKeys = ['LS', 'RS', 'LH', 'RH', 'C'];
        const coreJoints = {};
        for (const key of coreJointKeys) {
            if (!j[key]?.vector) return; // Abort if any required joint is missing
            coreJoints[key] = j[key].vector;
        }

        const coords = {
            LS: getCoords(coreJoints.LS), RS: getCoords(coreJoints.RS),
            LH: getCoords(coreJoints.LH), RH: getCoords(coreJoints.RH),
            C: getCoords(coreJoints.C)
        };
        
        p5.stroke(colors.tether);
        p5.strokeWeight(2);
        CORE_CONNECTIONS.forEach(([startKey, endKey]) => {
            const start = coords[startKey];
            const end = coords[endKey];
            if (start && end) p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
        });

        p5.noStroke();
        [ 'LS', 'RS', 'LH', 'RH' ].forEach(key => {
            const pos = coords[key];
            const isHighlighted = highlightJoints.includes(key);
            p5.push();
            p5.translate(pos.x, pos.y, pos.z);
            p5.ambientMaterial(isHighlighted ? colors.highlight : colors.joint);
            p5.sphere(isHighlighted ? 10 : 8);
            p5.pop();
        });

        const isCoreHighlighted = highlightJoints.includes('C');
        p5.push();
        p5.translate(coords.C.x, coords.C.y, coords.C.z);
        p5.ambientMaterial(isCoreHighlighted ? colors.highlight : colors.core);
        p5.sphere(isCoreHighlighted ? 12 : 10);
        p5.pop();
    }
}

const CoreVisualizer = (props) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto', zIndex: 10 }}>
            <ReactP5Wrapper {...props} sketch={sketch} />
        </div>
    );
};

CoreVisualizer.propTypes = {
    poseData: PropTypes.object,
    highlightJoints: PropTypes.arrayOf(PropTypes.string),
    weightDistribution: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(CoreVisualizer);
import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';

function sketch(p5) {
    let poseData;
    let canvasSize = { width: 300, height: 300 };
    let colors = {};
    // PHOENIX PROTOCOL: Initialize weightDistribution.
    let weightDistribution = 0;

    p5.updateWithProps = props => {
        if (props.poseData) poseData = props.poseData;
        // PHOENIX PROTOCOL: Update weightDistribution from props.
        if (props.weightDistribution !== undefined) {
            weightDistribution = props.weightDistribution;
        }
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
            joint: p5.color(255),
            tether: p5.color(255, 255, 255, 100),
            core: p5.color('#00e676'),
        };
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
        return {
            x: v.x * (canvasSize.width / 4),
            y: -v.y * (canvasSize.height / 3),
            z: v.z * (canvasSize.width / 4),
        };
    }

    function drawCoreHourglass() {
        if (!poseData || !poseData.jointInfo) return;
        
        const j = poseData.jointInfo;
        const coreJoints = { LS: j.LS?.vector, RS: j.RS?.vector, LH: j.LH?.vector, RH: j.RH?.vector };

        if (Object.values(coreJoints).some(v => !v)) return;

        const coords = {
            LS: getCoords(coreJoints.LS), RS: getCoords(coreJoints.RS),
            LH: getCoords(coreJoints.LH), RH: getCoords(coreJoints.RH)
        };

        // PHOENIX PROTOCOL: Weighted average calculation for the core center.
        const leftWeight = (1 - weightDistribution) / 2.0;
        const rightWeight = (1 + weightDistribution) / 2.0;

        const coreCenter = {
            x: (coords.LS.x + coords.LH.x) * leftWeight + (coords.RS.x + coords.RH.x) * rightWeight,
            y: (coords.LS.y + coords.RS.y + coords.LH.y + coords.RH.y) / 4,
            z: (coords.LS.z + coords.LH.z) * leftWeight + (coords.RS.z + coords.RH.z) * rightWeight,
        };

        p5.stroke(colors.tether);
        p5.strokeWeight(2);
        const connections = [
            [coords.LS, coords.RS], [coords.LH, coords.RH],
            [coords.LS, coords.LH], [coords.RS, coords.RH],
            [coords.LS, coords.RH], [coords.RS, coords.LH]
        ];
        connections.forEach(([start, end]) => p5.line(start.x, start.y, start.z, end.x, end.y, end.z));

        p5.noStroke();
        Object.values(coords).forEach(pos => {
            p5.push();
            p5.translate(pos.x, pos.y, pos.z);
            p5.ambientMaterial(colors.joint);
            p5.sphere(8);
            p5.pop();
        });

        p5.push();
        p5.translate(coreCenter.x, coreCenter.y, coreCenter.z);
        p5.ambientMaterial(colors.core);
        p5.sphere(10);
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
    // PHOENIX PROTOCOL: Add new prop type for validation.
    weightDistribution: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(CoreVisualizer);
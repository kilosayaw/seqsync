// src/components/media/P5SkeletalVisualizer.jsx

import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';

function sketch(p5) {
    let poseData = null;
    let highlightJoint = null;
    let canvasSize = { width: 640, height: 360 };

    const connections = [
        ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'], ['RS', 'RE'], ['RE', 'RW'],
        ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'], ['LH', 'LK'], ['LK', 'LA'],
        ['RH', 'RK'], ['RK', 'RA']
    ];
    
    p5.updateWithProps = props => {
        if (props.poseData) poseData = props.poseData;
        if (props.highlightJoint !== undefined) highlightJoint = props.highlightJoint;
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
    };

    p5.draw = () => {
        p5.clear();
        if (!poseData || !poseData.jointInfo) return;

        const jointInfo = poseData.jointInfo;
        
        const getCoords = (vector) => ({
            x: vector.x * (canvasSize.width / 2),
            y: vector.y * (canvasSize.height / 2),
            z: (vector.z || 0) * 100
        });

        p5.stroke(0, 255, 255, 200);
        p5.strokeWeight(4);
        connections.forEach(([startKey, endKey]) => {
            const startJoint = jointInfo[startKey];
            const endJoint = jointInfo[endKey];
            if (startJoint?.score > 0.6 && endJoint?.score > 0.6) {
                const start = getCoords(startJoint.vector);
                const end = getCoords(endJoint.vector);
                p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
            }
        });

        p5.noStroke();
        for (const key in jointInfo) {
            const joint = jointInfo[key];
            if (joint?.score > 0.6) {
                const pos = getCoords(joint.vector);
                const isActive = key === highlightJoint;
                const radius = isActive ? 12 : 8;
                
                let jointColor = isActive ? p5.color(255, 255, 0) : p5.color(0, 255, 255);
                const orientation = joint.orientation || 'NEU';
                if (orientation === 'IN') jointColor = p5.color(255, 100, 100);
                if (orientation === 'OUT') jointColor = p5.color(100, 150, 255);

                p5.push();
                p5.translate(pos.x, pos.y, pos.z);
                p5.fill(jointColor);
                p5.sphere(radius);
                p5.pop();
            }
        }
    };
}

const P5SkeletalVisualizer = ({ poseData, highlightJoint, width, height }) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <ReactP5Wrapper 
                sketch={sketch} 
                poseData={poseData} 
                highlightJoint={highlightJoint}
                width={width}
                height={height}
            />
        </div>
    );
};

P5SkeletalVisualizer.propTypes = {
    poseData: PropTypes.object,
    highlightJoint: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(P5SkeletalVisualizer);
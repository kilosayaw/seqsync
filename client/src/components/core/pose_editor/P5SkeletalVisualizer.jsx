import React from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import PropTypes from 'prop-types';

function sketch(p5) {
    // These variables will be updated by props
    let poseData = null;
    let highlightJoint = null;
    let mode = '2D'; // Default to 2D

    const connections = [
        ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'], ['RS', 'RE'], ['RE', 'RW'],
        ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'], ['LH', 'LK'], ['LK', 'LA'],
        ['RH', 'RK'], ['RK', 'RA']
    ];
    
    p5.updateWithProps = props => {
        if (props.poseData) poseData = props.poseData;
        if (props.highlightJoint !== undefined) highlightJoint = props.highlightJoint;
        if (props.mode) mode = props.mode;
    };

    p5.setup = () => {
        // Create a single canvas that can handle both 2D and 3D
        p5.createCanvas(640, 360, p5.WEBGL);
        p5.angleMode(p5.DEGREES);
    };

    p5.draw = () => {
        p5.clear();
        if (!poseData || !poseData.jointInfo) return;

        if (mode === '3D') {
            p5.orbitControl();
            // Implement 3D drawing logic here later
        }

        const jointInfo = poseData.jointInfo;
        const width = p5.width;
        const height = p5.height;
        
        // --- This logic works for both 2D and 3D (orthographic) views ---
        const getCoords = (vector) => ({
            x: vector.x * (width / 2.5),
            y: -vector.y * (height / 2.5), // Invert Y for screen coordinates
            z: (vector.z || 0) * 100 // Scale Z for depth
        });

        // Draw bones
        p5.stroke(255, 255, 255, 150);
        p5.strokeWeight(2);
        connections.forEach(([startKey, endKey]) => {
            const startJoint = jointInfo[startKey];
            const endJoint = jointInfo[endKey];
            if (startJoint?.vector && endJoint?.vector) {
                const start = getCoords(startJoint.vector);
                const end = getCoords(endJoint.vector);
                p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
            }
        });

        // Draw joints
        for (const key in jointInfo) {
            const joint = jointInfo[key];
            if (joint?.vector) {
                const pos = getCoords(joint.vector);
                const isActive = key === highlightJoint;
                
                const zDisplacement = joint.gridMovement?.z || 0;
                let radius = isActive ? 15 : 10;
                if (zDisplacement === 1) radius *= 1.5;
                if (zDisplacement === -1) radius *= 0.5;

                const orientation = joint.orientation || 'NEU';
                let jointColor = isActive ? p5.color(255, 255, 0) : p5.color(0, 255, 255);
                if (orientation === 'IN') jointColor = p5.color(255, 100, 100);
                if (orientation === 'OUT') jointColor = p5.color(100, 150, 255);

                p5.push();
                p5.translate(pos.x, pos.y, pos.z);
                p5.noStroke();
                p5.fill(jointColor);
                p5.sphere(radius);
                p5.pop();
            }
        }
    };
}

const P5SkeletalVisualizer = ({ poseData, highlightJoint, mode }) => {
    return <ReactP5Wrapper 
        sketch={sketch} 
        poseData={poseData} 
        highlightJoint={highlightJoint} 
        mode={mode} 
    />;
};

P5SkeletalVisualizer.propTypes = {
    poseData: PropTypes.object,
    highlightJoint: PropTypes.string,
    mode: PropTypes.oneOf(['2D', '3D']).isRequired,
};

export default React.memo(P5SkeletalVisualizer);
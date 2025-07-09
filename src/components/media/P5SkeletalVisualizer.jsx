// src/components/media/P5SkeletalVisualizer.jsx
import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { POSE_CONNECTIONS, JOINT_LIST } from '../../utils/constants';

function sketch(p5) {
    // --- State Variables ---
    let startPose = null;
    let endPose = null;
    let animationState = 'idle';
    let highlightJoint = null;
    let canvasSize = { width: 300, height: 300 };
    let animationProgress = 0;
    const animationDuration = 0.5; // in seconds

    // --- OPTIMIZATION: Pre-calculated Colors ---
    let colors = {};

    // --- Core P5 Functions ---
    p5.updateWithProps = props => {
        if (props.startPose) startPose = props.startPose;
        if (props.endPose) endPose = props.endPose;
        if (props.animationState) {
            if (props.animationState === 'playing' && animationState === 'idle') {
                animationProgress = 0;
            }
            animationState = props.animationState;
        }
        if (props.highlightJoint !== undefined) highlightJoint = props.highlightJoint;
        if (props.width && props.height) {
            if (canvasSize.width !== props.width || canvasSize.height !== props.height) {
                canvasSize = { width: props.width, height: props.height };
                p5.resizeCanvas(canvasSize.width, canvasSize.height);
            }
        }
    };

    p5.setup = () => {
        // DEFINITIVE: Create a 3D WebGL canvas
        p5.createCanvas(canvasSize.width, canvasSize.height, p5.WEBGL);
        p5.angleMode(p5.DEGREES);
        
        // OPTIMIZATION: Create color objects once.
        colors = {
            highlight: p5.color('#FFDF00'), // Gold
            in: p5.color('#ff5252'),         // Red
            out: p5.color('#00b0ff'),        // Blue
            neu: p5.color('#00e676'),        // Green
            line: p5.color(255, 255, 255, 150)
        };
    };

    p5.draw = () => {
        p5.background(0, 0, 0, 0); // Transparent background
        p5.orbitControl(1, 1, 0.1); // Allows mouse dragging to rotate the 3D view
        p5.ambientLight(150);
        p5.pointLight(255, 255, 255, 0, -200, 200);
        
        const poseToDraw = calculateCurrentPose();
        if (!poseToDraw) return;

        drawSkeleton(poseToDraw);
    };
    
    function calculateCurrentPose() {
        if (animationState === 'playing' && startPose?.jointInfo && endPose?.jointInfo) {
            animationProgress += p5.deltaTime / 1000;
            const t = p5.constrain(animationProgress / animationDuration, 0, 1);
            
            const interpolatedPose = { jointInfo: {} };
            JOINT_LIST.forEach(({ id }) => {
                const startJ = startPose.jointInfo[id] || endPose.jointInfo[id];
                const endJ = endPose.jointInfo[id] || startPose.jointInfo[id];

                if (startJ && endJ) {
                    interpolatedPose.jointInfo[id] = {
                        vector: {
                            x: p5.lerp(startJ.vector.x, endJ.vector.x, t),
                            y: p5.lerp(startJ.vector.y, endJ.vector.y, t),
                            z: p5.lerp(startJ.vector.z || 0, endJ.vector.z || 0, t),
                        },
                        score: p5.lerp(startJ.score, endJ.score, t),
                        orientation: endJ.orientation,
                    };
                }
            });
            
            if (t >= 1) animationState = 'idle';
            return interpolatedPose;
        }
        return endPose || startPose;
    }

    function drawSkeleton(pose) {
        if (!pose?.jointInfo) return;
        const { jointInfo } = pose;

        // Map normalized [-1, 1] space to a larger 3D drawing space
        const getCoords = (vector) => ({
            x: vector.x * (canvasSize.width / 4), // Use smaller scalar for better 3D depth
            y: -vector.y * (canvasSize.height / 3),
            z: (vector.z || 0) * (canvasSize.width / 4)
        });

        // Draw connections
        p5.stroke(colors.line);
        p5.strokeWeight(3);
        POSE_CONNECTIONS.forEach(([startKey, endKey]) => {
            const startJ = jointInfo[startKey];
            const endJ = jointInfo[endKey];
            if (startJ?.score > 0.5 && endJ?.score > 0.5) {
                const start = getCoords(startJ.vector);
                const end = getCoords(endJ.vector);
                p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
            }
        });

        // Draw joints
        p5.noStroke();
        for (const key in jointInfo) {
            const joint = jointInfo[key];
            if (joint?.score > 0.5) {
                const pos = getCoords(joint.vector);
                const isHighlighted = highlightJoint === key;
                
                let jointColor = colors.neu;
                if (isHighlighted) {
                    jointColor = colors.highlight;
                } else {
                    const orientation = joint.orientation || 'NEU';
                    if (orientation === 'IN') jointColor = colors.in;
                    else if (orientation === 'OUT') jointColor = colors.out;
                }
                
                p5.push();
                p5.translate(pos.x, pos.y, pos.z);
                p5.ambientMaterial(jointColor); // Use material for 3D lighting
                p5.sphere(isHighlighted ? 10 : 6); // Use sphere for 3D
                p5.pop();
            }
        }
    }
}

const P5SkeletalVisualizer = ({ startPose, endPose, animationState, highlightJoint, width, height }) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
            <ReactP5Wrapper 
                sketch={sketch} 
                startPose={startPose}
                endPose={endPose}
                animationState={animationState}
                highlightJoint={highlightJoint}
                width={width}
                height={height}
            />
        </div>
    );
};

P5SkeletalVisualizer.propTypes = {
    startPose: PropTypes.object,
    endPose: PropTypes.object,
    animationState: PropTypes.string,
    highlightJoint: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(P5SkeletalVisualizer);
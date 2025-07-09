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
                animationProgress = 0; // Reset animation on new play command
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
        p5.createCanvas(canvasSize.width, canvasSize.height);
        p5.angleMode(p5.DEGREES);
        
        // OPTIMIZATION: Create color objects once to avoid recalculation in draw loop.
        colors = {
            highlight: p5.color('#FFDF00'), // Gold
            in: p5.color('#ff5252'),         // Red
            out: p5.color('#00b0ff'),        // Blue
            neu: p5.color('#00e676'),        // Green
            line: p5.color(255, 255, 255, 150) // White, semi-transparent
        };
    };

    p5.draw = () => {
        p5.clear();
        
        const poseToDraw = calculateCurrentPose();
        if (!poseToDraw) return;

        drawSkeleton(poseToDraw);
    };
    
    // --- Helper Functions ---
    
    function calculateCurrentPose() {
        if (animationState === 'playing' && startPose?.jointInfo && endPose?.jointInfo) {
            animationProgress += p5.deltaTime / 1000;
            const t = p5.constrain(animationProgress / animationDuration, 0, 1);
            
            const interpolatedPose = { jointInfo: {} };
            JOINT_LIST.forEach(({ id }) => {
                // OPTIMIZATION & BUG FIX: Gracefully handle missing joints in either pose.
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
                        orientation: endJ.orientation, // Snap to the target orientation
                    };
                }
            });
            
            if (t >= 1) animationState = 'idle'; // End the animation
            return interpolatedPose;
        }
        // When not animating, prioritize drawing the end pose (the active pad)
        return endPose || startPose;
    }

    function drawSkeleton(pose) {
        if (!pose?.jointInfo) return;
        const { jointInfo } = pose;

        const getCoords = (vector) => ({
            x: (vector.x + 1) / 2 * canvasSize.width,
            y: (-vector.y + 1) / 2 * canvasSize.height,
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
                p5.line(start.x, start.y, end.x, end.y);
            }
        });

        // Draw joints
        p5.noStroke();
        for (const key in jointInfo) {
            const joint = jointInfo[key];
            if (joint?.score > 0.5) {
                const pos = getCoords(joint.vector);
                const isHighlighted = key === highlightJoint;
                
                let jointColor = colors.neu; // Default to neutral
                if (isHighlighted) {
                    jointColor = colors.highlight;
                } else {
                    const orientation = joint.orientation || 'NEU';
                    if (orientation === 'IN') jointColor = colors.in;
                    else if (orientation === 'OUT') jointColor = colors.out;
                }
                
                p5.fill(jointColor);
                p5.circle(pos.x, pos.y, isHighlighted ? 16 : 10);
            }
        }
    }
}

const P5SkeletalVisualizer = ({ startPose, endPose, animationState, highlightJoint, width, height }) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
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
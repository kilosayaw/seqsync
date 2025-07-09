// src/components/media/P5SkeletalVisualizer.jsx
import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { POSE_CONNECTIONS, JOINT_LIST } from '../../utils/constants';

function sketch(p5) {
    let startPose = null;
    let endPose = null;
    let animationState = 'idle';
    let highlightJoint = null;
    let canvasSize = { width: 300, height: 300 };
    let animationProgress = 0;
    const animationDuration = 0.5; // seconds

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
        p5.createCanvas(canvasSize.width, canvasSize.height);
        p5.angleMode(p5.DEGREES);
    };

    p5.draw = () => {
        p5.clear();
        
        let poseToDraw;
        if (animationState === 'playing' && startPose && endPose) {
            animationProgress += p5.deltaTime / 1000;
            const t = p5.constrain(animationProgress / animationDuration, 0, 1);
            
            poseToDraw = { jointInfo: {} };
            JOINT_LIST.forEach(({ id }) => {
                const startJ = startPose.jointInfo?.[id];
                const endJ = endPose.jointInfo?.[id];
                if (startJ && endJ) {
                    poseToDraw.jointInfo[id] = {
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
        } else {
            poseToDraw = endPose || startPose;
        }

        if (!poseToDraw || !poseToDraw.jointInfo) return;

        const { jointInfo } = poseToDraw;
        const getCoords = (vector) => ({
            x: (vector.x + 1) / 2 * canvasSize.width,
            y: (-vector.y + 1) / 2 * canvasSize.height,
        });

        p5.stroke(255, 255, 255, 150);
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

        p5.noStroke();
        for (const key in jointInfo) {
            const joint = jointInfo[key];
            if (joint?.score > 0.5) {
                const pos = getCoords(joint.vector);
                const isHighlighted = key === highlightJoint;
                let jointColor;
                if (isHighlighted) {
                    jointColor = p5.color('#FFDF00');
                } else {
                    const orientation = joint.orientation || 'NEU';
                    if (orientation === 'IN') jointColor = p5.color('#ff5252');
                    else if (orientation === 'OUT') jointColor = p5.color('#00b0ff');
                    else jointColor = p5.color('#00e676');
                }
                p5.fill(jointColor);
                p5.circle(pos.x, pos.y, isHighlighted ? 16 : 10);
            }
        }
    };
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
import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { POSE_CONNECTIONS, JOINT_LIST } from '../../utils/constants';

function sketch(p5) {
    // --- State Variables ---
    let startPose, endPose, animationState = 'idle';
    // DEFINITIVE: Changed to highlightJoints (plural) to accept an array
    let highlightJoints = []; 
    let canvasSize = { width: 300, height: 300 };
    let animationProgress = 0;
    const animationDuration = 0.5;
    let colors = {};

    p5.updateWithProps = props => {
        if (props.startPose) startPose = props.startPose;
        if (props.endPose) endPose = props.endPose;
        if (props.animationState) {
            if (props.animationState === 'playing' && animationState === 'idle') {
                animationProgress = 0;
            }
            animationState = props.animationState;
        }
        // DEFINITIVE: Update with the array of joints to highlight
        if (props.highlightJoints !== undefined) {
            highlightJoints = props.highlightJoints;
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
            highlight: p5.color('#FFDF00'),
            line: p5.color(255, 255, 255, 150),
            mover: p5.color('#ff5252'),
            stabilizer: p5.color('#00e676'),
            frame: p5.color('#FFFFFF'),
            coiled: p5.color('#00b0ff'),
        };
    };

    p5.draw = () => {
        p5.background(0, 0, 0, 0);
        p5.orbitControl(1, 1, 0.1);
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
                        ...startJ, ...endJ,
                        vector: {
                            x: p5.lerp(startJ.vector.x, endJ.vector.x, t),
                            y: p5.lerp(startJ.vector.y, endJ.vector.y, t),
                            z: p5.lerp(startJ.vector.z || 0, endJ.vector.z || 0, t),
                        },
                        score: p5.lerp(startJ.score, endJ.score, t),
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
        
        let processedJointInfo = JSON.parse(JSON.stringify(pose.jointInfo));
        
        const leftFootGrounded = pose.jointInfo.LF?.grounding?.includes('3');
        const rightFootGrounded = pose.jointInfo.RF?.grounding?.includes('3');

        if (!leftFootGrounded && processedJointInfo.LA && processedJointInfo.L3) {
            processedJointInfo.L3.vector.y = processedJointInfo.LA.vector.y + 0.05;
            processedJointInfo.LK.vector.y = processedJointInfo.LA.vector.y - 0.25;
            processedJointInfo.LH.vector.y = processedJointInfo.LK.vector.y + 0.4;
        }
        if (!rightFootGrounded && processedJointInfo.RA && processedJointInfo.R3) {
            processedJointInfo.R3.vector.y = processedJointInfo.RA.vector.y + 0.05;
            processedJointInfo.RK.vector.y = processedJointInfo.RA.vector.y - 0.25;
            processedJointInfo.RH.vector.y = processedJointInfo.RK.vector.y + 0.4;
        }
        
        const getCoords = (vector) => ({
            x: vector.x * (canvasSize.width / 4),
            y: -vector.y * (canvasSize.height / 3),
            z: (vector.z || 0) * (canvasSize.width / 4)
        });

        p5.stroke(colors.line);
        p5.strokeWeight(3);
        POSE_CONNECTIONS.forEach(([startKey, endKey]) => {
            const startJ = processedJointInfo[startKey];
            const endJ = processedJointInfo[endKey];
            if (startJ?.score > 0.5 && endJ?.score > 0.5) {
                const start = getCoords(startJ.vector);
                const end = getCoords(endJ.vector);
                p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
            }
        });

        p5.noStroke();
        for (const key in processedJointInfo) {
            const joint = processedJointInfo[key];
            if (!joint?.score || joint.score < 0.5 || !joint.vector) continue;

            const pos = getCoords(joint.vector);
            // DEFINITIVE: Check if the current joint's key is in the highlight array
            const isHighlighted = highlightJoints.includes(key); 
            
            let jointColor = colors.frame;
            if (isHighlighted) {
                jointColor = colors.highlight;
            } else if (joint.role && colors[joint.role]) {
                jointColor = colors[joint.role];
            }
            
            p5.push();
            p5.translate(pos.x, pos.y, pos.z);
            p5.ambientMaterial(jointColor);
            p5.sphere(isHighlighted ? 10 : 8);
            p5.pop();
        }
    }
}

const P5SkeletalVisualizer = (props) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
            <ReactP5Wrapper {...props} sketch={sketch} />
        </div>
    );
};

P5SkeletalVisualizer.propTypes = {
    startPose: PropTypes.object,
    endPose: PropTypes.object,
    animationState: PropTypes.string,
    highlightJoints: PropTypes.arrayOf(PropTypes.string),
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default React.memo(P5SkeletalVisualizer);
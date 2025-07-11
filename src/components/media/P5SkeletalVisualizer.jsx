import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import PropTypes from 'prop-types';
import { POSE_CONNECTIONS, JOINT_LIST } from '../../utils/constants';

const LIMB_CONNECTIONS = new Set([
    'LS-LE', 'LE-LW', 'RS-RE', 'RE-RW',
    'LH-LK', 'LK-LA', 'RH-RK', 'RK-RA',
]);

function sketch(p5) {
    // --- Component State ---
    let startPose, endPose, animationState = 'idle', highlightJoints = [];
    let canvasSize = { width: 300, height: 300 };
    let animationProgress = 0;
    const animationDuration = 0.5;
    let colors = {};

    // --- DEFINITIVE: New Camera Control State ---
    let zoom = 1.0; // Initial zoom level
    let pan = 0;    // Left-right rotation
    let tilt = -20; // Up-down rotation
    let isDragging = false;
    let lastMouseX, lastMouseY;

    function rotateVectorAroundAxis(vec, axis, angle) {
        // ... (function is unchanged)
        const a = p5.radians(angle);
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const u = axis.x; const v = axis.y; const w = axis.z;
        const x = vec.x; const y = vec.y; const z = vec.z;
        const dot = u * x + v * y + w * z;
        const x_rot = u * dot * (1 - cosA) + x * cosA + (-w * y + v * z) * sinA;
        const y_rot = v * dot * (1 - cosA) + y * cosA + (w * x - u * z) * sinA;
        const z_rot = w * dot * (1 - cosA) + z * cosA + (-v * x + u * y) * sinA;
        return p5.createVector(x_rot, y_rot, z_rot);
    }

    p5.updateWithProps = props => {
        // ... (prop updates are unchanged)
        if (props.startPose) startPose = props.startPose;
        if (props.endPose) endPose = props.endPose;
        if (props.animationState) {
            if (props.animationState === 'playing' && animationState === 'idle') animationProgress = 0;
            animationState = props.animationState;
        }
        if (props.highlightJoints !== undefined) highlightJoints = props.highlightJoints;
        if (props.width && props.height) {
            if (canvasSize.width !== props.width || canvasSize.height !== props.height) {
                canvasSize = { width: props.width, height: props.height };
                p5.resizeCanvas(canvasSize.width, canvasSize.height);
            }
        }
    };

    p5.setup = () => {
        const canvas = p5.createCanvas(canvasSize.width, canvasSize.height, p5.WEBGL);
        p5.angleMode(p5.DEGREES);
        
        // DEFINITIVE: Register new mouse handlers for our custom camera
        canvas.mousePressed(p5.myMousePressed);
        canvas.mouseReleased(p5.myMouseReleased);
        canvas.mouseDragged(p5.myMouseDragged);
        canvas.mouseWheel(p5.myMouseWheel);
        
        colors = {
            highlight: p5.color('#FFDF00'),
            line: p5.color(255, 255, 255, 150),
            mover: p5.color('#ff5252'),
            stabilizer: p5.color('#00e676'),
            frame: p5.color('#FFFFFF'),
            coiled: p5.color('#00b0ff'),
            ribbonEdge1: p5.color(0, 175, 255),
            ribbonEdge2: p5.color(255, 0, 175),
        };
    };

    p5.draw = () => {
        p5.background(0, 0, 0, 0);

        // DEFINITIVE: Replace orbitControl() with our manual camera setup
        p5.push(); // Isolate camera transformations
        const camDist = 800 * zoom;
        const camX = camDist * p5.cos(pan);
        const camZ = camDist * p5.sin(pan);
        const camY = camDist * p5.sin(tilt);
        p5.camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);

        p5.ambientLight(150);
        p5.pointLight(255, 255, 255, 0, -200, 200);
        
        const poseToDraw = calculateCurrentPose();
        if (poseToDraw) drawSkeleton(poseToDraw);
        
        p5.pop(); // End camera transformations
    };

    p5.myMousePressed = () => {
        if (p5.mouseButton === p5.LEFT) {
            isDragging = true;
            lastMouseX = p5.mouseX;
            lastMouseY = p5.mouseY;
        }
    }
    
    p5.myMouseReleased = () => {
        isDragging = false;
    }
    
    p5.myMouseDragged = () => {
        if (isDragging) {
            const dx = p5.mouseX - lastMouseX;
            const dy = p5.mouseY - lastMouseY;
            pan -= dx * 0.5; // Adjust sensitivity as needed
            tilt += dy * 0.5;
            tilt = p5.constrain(tilt, -90, 90); // Prevent flipping upside down
            lastMouseX = p5.mouseX;
            lastMouseY = p5.mouseY;
        }
    }

    p5.myMouseWheel = (event) => {
        zoom -= event.deltaY * 0.001; // Adjust sensitivity
        zoom = p5.constrain(zoom, 0.2, 5.0); // Set min/max zoom levels
        return false; // Prevent page scrolling
    }

    function drawRibbonLimb(startVec, endVec, rotationType = 'NEU') {
        const ribbonWidth = 15;
        const segments = 10;
        let totalTwist = 0;
        if (rotationType === 'IN') totalTwist = -90;
        if (rotationType === 'OUT') totalTwist = 90;

        const limbVector = p5.constructor.Vector.sub(endVec, startVec).normalize();
        let perp = p5.createVector(0, 1, 0);
        if (Math.abs(limbVector.dot(perp)) > 0.99) {
            perp = p5.createVector(1, 0, 0);
        }
        let edgeVector = limbVector.cross(perp).normalize().mult(ribbonWidth / 2);

        p5.noStroke();
        p5.beginShape(p5.TRIANGLE_STRIP);

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const centerPoint = p5.constructor.Vector.lerp(startVec, endVec, t);
            const twistAngle = p5.lerp(0, totalTwist, t);
            
            // DEFINITIVE FIX: Use the new, correct rotation function.
            const rotatedEdge = rotateVectorAroundAxis(edgeVector, limbVector, twistAngle);

            const v1 = p5.constructor.Vector.add(centerPoint, rotatedEdge);
            const v2 = p5.constructor.Vector.sub(centerPoint, rotatedEdge);

            p5.fill(colors.ribbonEdge1);
            p5.vertex(v1.x, v1.y, v1.z);
            p5.fill(colors.ribbonEdge2);
            p5.vertex(v2.x, v2.y, v2.z);
        }
        p5.endShape();
    }

    function drawSkeleton(pose) {
        if (!pose?.jointInfo) return;
        const joints = pose.jointInfo;

        const getCoords = (vector) => p5.createVector(
            vector.x * (canvasSize.width / 4),
            -vector.y * (canvasSize.height / 3),
            (vector.z || 0) * (canvasSize.width / 4)
        );

        POSE_CONNECTIONS.forEach(([startKey, endKey]) => {
            const startJ = joints[startKey];
            const endJ = joints[endKey];
            if (startJ?.score > 0.5 && endJ?.score > 0.5) {
                const start = getCoords(startJ.vector);
                const end = getCoords(endJ.vector);
                const connectionId = `${startKey}-${endKey}`;

                if (LIMB_CONNECTIONS.has(connectionId)) {
                    drawRibbonLimb(start, end, endJ.rotationType);
                } else {
                    p5.stroke(colors.line);
                    p5.strokeWeight(3);
                    p5.line(start.x, start.y, start.z, end.x, end.y, end.z);
                }
            }
        });

        p5.noStroke();
        for (const key in joints) {
            const joint = joints[key];
            if (!joint?.score || joint.score < 0.5 || !joint.vector) continue;
            const pos = getCoords(joint.vector);
            const isHighlighted = highlightJoints.includes(key);
            let jointColor = isHighlighted ? colors.highlight : (joint.role && colors[joint.role] ? colors[joint.role] : colors.frame);
            
            p5.push();
            p5.translate(pos.x, pos.y, pos.z);
            p5.ambientMaterial(jointColor);
            p5.sphere(isHighlighted ? 10 : 8);
            p5.pop();
        }
    }

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
import React from 'react';
import Sketch from 'react-p5';

// These connections are for the BlazePose 'full' model with 33 keypoints.
const POSE_CONNECTIONS = [
    [11, 12], [11, 23], [12, 24], [23, 24], [11, 13], [13, 15], [12, 14], [14, 16],
    [15, 17], [15, 19], [15, 21], [17, 19], [16, 18], [16, 20], [16, 22], [18, 20],
    [23, 25], [25, 27], [27, 29], [27, 31], [29, 31], [24, 26], [26, 28], [28, 30],
    [28, 32], [30, 32]
];

const SkeletalRenderer = ({ poseData, selectedJointId, width, height }) => {

    const setup = (p, canvasParentRef) => {
        p.createCanvas(width, height).parent(canvasParentRef);
    };

    const draw = (p) => {
        p.clear();
        if (!poseData?.keypoints) return;
        
        const { keypoints } = poseData;

        // Find bounding box to auto-zoom and center the pose
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        keypoints.forEach(k => {
            if (k && k.score > 0.3) {
                minX = Math.min(minX, k.x); minY = Math.min(minY, k.y);
                maxX = Math.max(maxX, k.x); maxY = Math.max(maxY, k.y);
            }
        });

        if (!isFinite(minX)) return; // Don't draw if no valid points

        const poseWidth = maxX - minX;
        const poseHeight = maxY - minY;
        const scale = Math.min(width / (poseWidth * 1.2), height / (poseHeight * 1.2));
        const offsetX = (width / 2) - (scale * (minX + poseWidth / 2));
        const offsetY = (height / 2) - (scale * (minY + poseHeight / 2));

        p.translate(offsetX, offsetY);
        p.scale(scale);

        // Draw segments
        p.strokeWeight(2 / scale); // Keep stroke width consistent when zoomed
        p.stroke('rgba(255, 255, 255, 0.7)');
        POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const start = keypoints[startIdx];
            const end = keypoints[endIdx];
            if (start && end && start.score > 0.3 && end.score > 0.3) {
                p.line(start.x, start.y, end.x, end.y);
            }
        });

        // Draw keypoints
        keypoints.forEach((point, i) => {
            if (point && point.score > 0.3) {
                if (i === selectedJointId) {
                    p.strokeWeight(8 / scale);
                    p.stroke(0, 255, 170); // Highlight color
                } else {
                    p.strokeWeight(6 / scale);
                    p.stroke(255);
                }
                p.point(point.x, point.y);
            }
        });
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default SkeletalRenderer;
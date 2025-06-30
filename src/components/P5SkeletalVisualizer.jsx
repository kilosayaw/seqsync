import React from 'react';
import Sketch from 'react-p5';
import * as p5 from 'p5';

const P5SkeletalVisualizer = ({ livePoseData }) => {

    const setup = (p, canvasParentRef) => {
        const { width, height } = canvasParentRef.getBoundingClientRect();
        p.createCanvas(width, height).parent(canvasParentRef);
    };

    const draw = (p) => {
        p.clear(); // Clear the canvas on each frame
        if (!livePoseData || !livePoseData.keypoints) return;

        // Draw keypoints
        p.strokeWeight(8);
        p.stroke('rgba(0, 255, 170, 0.8)'); // --color-accent-secondary
        livePoseData.keypoints.forEach(point => {
            if (point.score > 0.5) { // Only draw confident points
                p.point(point.x, point.y);
            }
        });

        // Define body segments to draw lines
        const segments = [
            ['nose', 'left_eye'], ['nose', 'right_eye'],
            ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
            ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
            ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
            ['left_hip', 'right_hip'],
            ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
            ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'],
        ];

        const keypointsMap = new Map(livePoseData.keypoints.map(k => [k.name, k]));

        p.strokeWeight(3);
        p.stroke('rgba(255, 255, 255, 0.7)');

        segments.forEach(([startName, endName]) => {
            const startPoint = keypointsMap.get(startName);
            const endPoint = keypointsMap.get(endName);
            if (startPoint && endPoint && startPoint.score > 0.5 && endPoint.score > 0.5) {
                p.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
            }
        });
    };

    const windowResized = (p) => {
        const { width, height } = p.canvas.parentElement.getBoundingClientRect();
        p.resizeCanvas(width, height);
    };

    return <Sketch setup={setup} draw={draw} windowResized={windowResized} className="p5-canvas" />;
};

export default P5SkeletalVisualizer;
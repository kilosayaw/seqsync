import React from 'react';
import './PoseThumbnail.css';

// These are the connections for the BlazePose model's 33 keypoints.
const POSE_CONNECTIONS = [
    // Torso
    [11, 12], [11, 23], [12, 24], [23, 24],
    // Arms
    [11, 13], [13, 15], [12, 14], [14, 16],
    // Legs
    [23, 25], [25, 27], [24, 26], [26, 28]
];

const PoseThumbnail = ({ poseData }) => {
    if (!poseData || !poseData.keypoints) {
        return null;
    }

    const { keypoints } = poseData;

    // Find the bounding box of the pose to normalize it
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    keypoints.forEach(p => {
        if (p.score > 0.3) { // Only consider reasonably confident points
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
    });

    const width = maxX - minX;
    const height = maxY - minY;
    
    // Add padding to the bounding box
    const padding = Math.max(width, height) * 0.15;
    const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
    
    return (
        <div className="pose-thumbnail-container">
            <svg className="pose-thumbnail-svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                {POSE_CONNECTIONS.map(([startIdx, endIdx], i) => {
                    const start = keypoints[startIdx];
                    const end = keypoints[endIdx];

                    // Draw the line only if both points are reasonably confident
                    if (start && end && start.score > 0.3 && end.score > 0.3) {
                        return (
                            <line
                                key={i}
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                            />
                        );
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};

export default PoseThumbnail;
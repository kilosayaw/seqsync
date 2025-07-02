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
    // Safety check for null or malformed data
    if (!poseData || !poseData.keypoints || !Array.isArray(poseData.keypoints)) {
        return null;
    }

    const { keypoints } = poseData;
    
    // Find valid keypoints with a reasonable confidence score
    const validKeypoints = keypoints.filter(p => p && typeof p.score === 'number' && p.score > 0.3);

    // KEY FIX: If there are no valid keypoints, don't try to render anything.
    if (validKeypoints.length === 0) {
        return null; 
    }

    // Find the bounding box of ONLY the valid points
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    validKeypoints.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    });

    // This check is now redundant because of the length check above, but it's a good failsafe.
    if (!isFinite(minX)) {
        return null;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    // Handle case where pose might be a single point (width/height is 0)
    const padding = Math.max(width, height, 50) * 0.2; // Add a minimum padding
    const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
    
    return (
        <div className="pose-thumbnail-container">
            <svg className="pose-thumbnail-svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                {POSE_CONNECTIONS.map(([startIdx, endIdx], i) => {
                    const start = keypoints[startIdx];
                    const end = keypoints[endIdx];

                    // Draw the line only if both points are valid
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
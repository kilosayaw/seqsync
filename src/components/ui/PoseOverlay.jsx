// src/components/ui/PoseOverlay.jsx
import React from 'react';
import { useMotion } from '../../context/MotionContext';
import { POSE_CONNECTIONS } from '../../utils/constants';
import './PoseOverlay.css';

const PoseOverlay = () => {
    const { livePoseData } = useMotion();

    if (!livePoseData || !livePoseData.keypoints) {
        return null; // Don't render anything if there's no pose data
    }

    return (
        <svg className="pose-overlay-svg" viewBox="0 0 640 480">
            {/* Draw connections */}
            {POSE_CONNECTIONS.map(([start, end], i) => {
                const kp1 = livePoseData.keypoints.find(k => k.name === start);
                const kp2 = livePoseData.keypoints.find(k => k.name === end);
                if (kp1 && kp2 && kp1.score > 0.5 && kp2.score > 0.5) {
                    return (
                        <line
                            key={`line-${i}`}
                            x1={kp1.x} y1={kp1.y}
                            x2={kp2.x} y2={kp2.y}
                            className="pose-line"
                        />
                    );
                }
                return null;
            })}
            {/* Draw keypoints */}
            {livePoseData.keypoints.map((kp, i) => {
                if (kp.score > 0.5) {
                    return (
                        <circle
                            key={`kp-${i}`}
                            cx={kp.x} cy={kp.y} r="5"
                            className="pose-keypoint"
                        />
                    );
                }
                return null;
            })}
        </svg>
    );
};
export default PoseOverlay;
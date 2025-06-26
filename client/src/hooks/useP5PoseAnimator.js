import { useState, useEffect, useRef, useCallback } from 'react';
import { lerp, lerpVector } from '../utils/helpers'; // Assuming lerpVector also exists or we build it in helpers
import { ALL_JOINTS_MAP, POSE_DEFAULT_VECTOR } from '../utils/constants';

// A stable, empty pose object to prevent re-renders.
const EMPTY_JOINT_INFO = Object.keys(ALL_JOINTS_MAP).reduce((acc, key) => {
    acc[key] = { vector: POSE_DEFAULT_VECTOR, rotation: 0, score: 0 };
    return acc;
}, {});

// Interpolates between two full jointInfo objects, preserving all properties.
const interpolatePoseData = (start, end, fraction) => {
    const interpolated = {};
    const allJointKeys = Object.keys(ALL_JOINTS_MAP);

    for (const key of allJointKeys) {
        const startJoint = start[key] || end[key] || EMPTY_JOINT_INFO[key];
        const endJoint = end[key] || start[key] || EMPTY_JOINT_INFO[key];

        interpolated[key] = {
            ...endJoint, // Carry over all properties from the target pose by default
            vector: lerpVector(startJoint.vector || POSE_DEFAULT_VECTOR, endJoint.vector || POSE_DEFAULT_VECTOR, fraction),
            rotation: lerp(startJoint.rotation || 0, endJoint.rotation || 0, fraction),
            score: endJoint.score || 0,
        };
    }
    return interpolated;
};

export const useP5PoseAnimator = (targetPoseData, isLive = false) => {
    const [animatedJointInfo, setAnimatedJointInfo] = useState(() => targetPoseData || EMPTY_JOINT_INFO);
    
    const animationFrameRef = useRef(null);
    const currentPoseRef = useRef(animatedJointInfo);
    const targetPoseRef = useRef(targetPoseData || EMPTY_JOINT_INFO);
    
    useEffect(() => {
        targetPoseRef.current = targetPoseData || EMPTY_JOINT_INFO;
        if (!isLive) {
            currentPoseRef.current = targetPoseRef.current;
            setAnimatedJointInfo(targetPoseRef.current);
        }
    }, [targetPoseData, isLive]);

    const animationLoop = useCallback(() => {
        const animationSpeed = 0.25;
        
        const interpolated = interpolatePoseData(
            currentPoseRef.current,
            targetPoseRef.current,
            animationSpeed
        );

        currentPoseRef.current = interpolated;
        setAnimatedJointInfo(interpolated);

        animationFrameRef.current = requestAnimationFrame(animationLoop);
    }, []);

    useEffect(() => {
        if (isLive) {
            animationFrameRef.current = requestAnimationFrame(animationLoop);
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isLive, animationLoop]);

    return { animatedPose: { jointInfo: animatedJointInfo } };
};
import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook to manage the state for animating between two poses.
 * @param {object} targetPose The destination pose we want to animate to.
 * @returns {object} { animatedPose, lerpAmount }
 */
export const useP5PoseAnimator = (targetPose) => {
    const [animatedPose, setAnimatedPose] = useState(targetPose);
    const [lerpAmount, setLerpAmount] = useState(1);
    const previousPoseRef = useRef(targetPose);

    useEffect(() => {
        // When the target pose changes, store the *current* animated pose as the starting point
        // and reset the animation progress.
        previousPoseRef.current = animatedPose;
        setLerpAmount(0);
    }, [targetPose]);

    useEffect(() => {
        if (lerpAmount >= 1) {
            // Animation is complete, ensure the final state is exact.
            setAnimatedPose(targetPose);
            return;
        }

        // Animation loop using requestAnimationFrame
        const animationFrame = requestAnimationFrame(() => {
            const newLerpAmount = Math.min(lerpAmount + 0.08, 1); // Animation speed
            setLerpAmount(newLerpAmount);
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [lerpAmount, targetPose]);
    
    // On every render, calculate the interpolated pose if an animation is in progress.
    // This is cheap because lerpAmount is 1 most of the time.
    if (lerpAmount < 1) {
        // This is a placeholder for a more complex interpolation logic that would live
        // in a utils file. For now, it just returns the target.
        // A real implementation would lerp vectors and rotations.
        // setAnimatedPose(interpolatePoses(previousPoseRef.current, targetPose, lerpAmount));
    }

    return { animatedPose: targetPose, lerpAmount }; // Return the target directly for now
};
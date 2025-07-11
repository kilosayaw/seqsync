// src/utils/poseUtils.js
import { DEFAULT_POSE, JOINT_LIST } from './constants';

/**
 * Converts a pose from the sequence data format (with .position arrays)
 * to the format expected by the p5.js visualizers (with .vector objects).
 * It also merges with the default pose to ensure all joints are present.
 *
 * @param {object | null} sequencePose - The pose object from the songData array.
 * @returns {object} A pose object guaranteed to be in the visualizer-safe format.
 */
export const convertPoseToVisualizerFormat = (sequencePose) => {
    const visualizerPose = {
        jointInfo: {},
        grounding: {
            LF: sequencePose?.joints?.LF?.grounding,
            RF: sequencePose?.joints?.RF?.grounding
        }
    };

    JOINT_LIST.forEach(({ id }) => {
        const defaultJoint = DEFAULT_POSE.jointInfo[id];
        const sequenceJoint = sequencePose?.joints?.[id];

        // Start with the default joint data (which always has a .vector)
        visualizerPose.jointInfo[id] = { ...defaultJoint };

        if (sequenceJoint) {
            // If the sequence has data for this joint, merge it.
            Object.assign(visualizerPose.jointInfo[id], sequenceJoint);

            // CRITICAL: If the sequence joint has a 'position' array but no 'vector' object,
            // create the 'vector' object from the 'position' array.
            if (sequenceJoint.position && !sequenceJoint.vector) {
                visualizerPose.jointInfo[id].vector = {
                    x: sequenceJoint.position[0],
                    y: sequenceJoint.position[1],
                    z: sequenceJoint.position[2],
                };
            }
        }
    });

    return visualizerPose;
};
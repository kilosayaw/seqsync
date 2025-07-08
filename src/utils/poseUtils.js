// src/utils/poseUtils.js

// Maps BlazePose's keypoint names to our internal SĒQsync abbreviations.
const BLAZEPOSE_TO_SEQSYNC_MAP = {
    'nose': 'N',
    'left_eye_inner': 'LEI',
    'left_eye': 'LE',
    'left_eye_outer': 'LEO',
    'right_eye_inner': 'REI',
    'right_eye': 'RE',
    'right_eye_outer': 'REO',
    'left_ear': 'LEAR',
    'right_ear': 'REAR',
    'mouth_left': 'ML',
    'mouth_right': 'MR',
    'left_shoulder': 'LS',
    'right_shoulder': 'RS',
    'left_elbow': 'LE',
    'right_elbow': 'RE',
    'left_wrist': 'LW',
    'right_wrist': 'RW',
    'left_pinky': 'LPF',
    'right_pinky': 'RPF',
    'left_index': 'LIF',
    'right_index': 'RIF',
    'left_thumb': 'LTF',
    'right_thumb': 'RTF',
    'left_hip': 'LH',
    'right_hip': 'RH',
    'left_knee': 'LK',
    'right_knee': 'RK',
    'left_ankle': 'LA',
    'right_ankle': 'RA',
    'left_heel': 'LF3',
    'right_heel': 'RF3',
    'left_foot_index': 'LFT1',
    'right_foot_index': 'RFT1'
};

/**
 * Transforms raw pose data from TensorFlow's BlazePose model into the
 * standardized SĒQsync format required by the rest of the application.
 * @param {object} blazePose - The pose object from detector.estimatePoses().
 * @param {number} videoWidth - The width of the video element being analyzed.
 * @param {number} videoHeight - The height of the video element being analyzed.
 * @returns {object|null} A SĒQsync-formatted pose object or null if input is invalid.
 */
export const transformBlazePoseToSEQSour = (blazePose, videoWidth, videoHeight) => {
    if (!blazePose || !blazePose.keypoints || !videoWidth || !videoHeight) {
        return null;
    }

    const jointInfo = {};

    blazePose.keypoints.forEach(keypoint => {
        const jointName = BLAZEPOSE_TO_SEQSYNC_MAP[keypoint.name];
        
        if (jointName) {
            const normalizedVector = {
                x: -( (keypoint.x / videoWidth) * 2 - 1 ),
                y: -( (keypoint.y / videoHeight) * 2 - 1 ),
                z: keypoint.z || 0,
            };

            jointInfo[jointName] = {
                vector: normalizedVector,
                score: keypoint.score,
                orientation: 'NEU',
            };
        }
    });
    
    return {
        id: `pose_${Date.now()}`,
        timestamp: performance.now(),
        jointInfo: jointInfo,
        score: blazePose.score
    };
};
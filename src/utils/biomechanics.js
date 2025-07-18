import { POSE_DEFAULT_VECTOR } from './constants';

// --- ROBUST 3D VECTOR MATH HELPERS ---
const getVector = (jointInfo, key) => jointInfo?.[key]?.vector || POSE_DEFAULT_VECTOR;
const v_sub = (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
const v_mag = (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
const v_dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
const v_normalize = (v) => {
    const mag = v_mag(v);
    if (mag === 0) return { ...POSE_DEFAULT_VECTOR };
    return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
};
const v_angle = (v1, v2) => {
    const mag1 = v_mag(v1);
    const mag2 = v_mag(v2);
    if (mag1 === 0 || mag2 === 0) return 0;
    const cosTheta = v_dot(v1, v2) / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cosTheta))) * (180 / Math.PI);
};

/**
 * Calculates the normal vector for the plane of a limb for 3D ribbon rendering.
 * @param {object} p1 - The 3D vector of the starting joint.
 * @param {object} p2 - The 3D vector of the ending joint.
 * @returns {object} A normalized 3D vector perpendicular to the limb.
 */
export function calculateLimbPlaneNormal(p1, p2) {
    const viewVector = { x: 0, y: 0, z: 1 };
    const limbVector = v_normalize(v_sub(p2, p1));
    if (v_mag(limbVector) === 0) return { x: 1, y: 0, z: 0 };
    const normal = {
        x: limbVector.y * viewVector.z - limbVector.z * viewVector.y,
        y: limbVector.z * viewVector.x - limbVector.x * viewVector.z,
        z: limbVector.x * viewVector.y - limbVector.y * viewVector.x,
    };
    return v_normalize(normal);
}

// ... (calculateValidKneePolygon remains the same)
export function calculateValidKneePolygon(poseData = {}, side = 'L') {
    // ... your existing logic ...
}

// =======================================================================================
// == EXPORTED BIOMECHANICAL CALCULATIONS ==
// =======================================================================================

/**
 * Calculates a simplified Center of Mass.
 */
export function calculateCenterOfMass(jointInfo = {}) {
    // Using a more stable set of core body joints
    const keypoints = [ getVector(jointInfo, 'LS'), getVector(jointInfo, 'RS'), getVector(jointInfo, 'LH'), getVector(jointInfo, 'RH') ];
    const validPoints = keypoints.filter(v => v !== POSE_DEFAULT_VECTOR);
    if (validPoints.length === 0) return { ...POSE_DEFAULT_VECTOR };
    
    const sum = validPoints.reduce((acc, vec) => ({
        x: acc.x + vec.x, y: acc.y + vec.y, z: acc.z + vec.z,
    }), { x: 0, y: 0, z: 0 });

    return { x: sum.x / validPoints.length, y: sum.y / validPoints.length, z: sum.z / validPoints.length };
}

/**
 * Calculates true 3D torsional load between shoulder and hip girdles.
 */
export function calculateTorsionalLoad(jointInfo = {}) {
    const ls = getVector(jointInfo, 'LS');
    const rs = getVector(jointInfo, 'RS');
    const lh = getVector(jointInfo, 'LH');
    const rh = getVector(jointInfo, 'RH');
    
    const shoulderCenter = { x: (ls.x + rs.x)/2, y: (ls.y + rs.y)/2, z: (ls.z + rs.z)/2 };
    const hipCenter = { x: (lh.x + rh.x)/2, y: (lh.y + rh.y)/2, z: (lh.z + rh.z)/2 };

    const shoulderVector = v_sub(rs, ls);
    const hipVector = v_sub(rh, lh);
    
    const spineAxis = v_normalize(v_sub(shoulderCenter, hipCenter));
    if (v_mag(spineAxis) === 0) return 0;

    const shoulderProj = v_sub(shoulderVector, {
        x: spineAxis.x * v_dot(shoulderVector, spineAxis),
        y: spineAxis.y * v_dot(shoulderVector, spineAxis),
        z: spineAxis.z * v_dot(shoulderVector, spineAxis),
    });

    const hipProj = v_sub(hipVector, {
        x: spineAxis.x * v_dot(hipVector, spineAxis),
        y: spineAxis.y * v_dot(hipVector, spineAxis),
        z: spineAxis.z * v_dot(hipVector, spineAxis),
    });

    if (v_mag(shoulderProj) < 0.01 || v_mag(hipProj) < 0.01) return 0;

    let angle = v_angle(shoulderProj, hipProj);

    const crossProd = {
        x: shoulderProj.y * hipProj.z - shoulderProj.z * hipProj.y,
        y: shoulderProj.z * hipProj.x - shoulderProj.x * hipProj.z,
        z: shoulderProj.x * hipProj.y - shoulderProj.y * hipProj.x,
    };

    if (v_dot(crossProd, spineAxis) < 0) {
        angle = -angle;
    }
    return angle;
}

/**
 * Calculates the vertical "pop" or "emphasis" of a movement.
 */
export function calculateUpbeatEmphasis(prevJointInfo, currentJointInfo, timeDelta) {
    if (!prevJointInfo || !currentJointInfo || !timeDelta || timeDelta <= 0) return 0;
    const com_prev = calculateCenterOfMass(prevJointInfo);
    const com_curr = calculateCenterOfMass(currentJointInfo);
    const verticalDisplacement = com_curr.y - com_prev.y;
    return (verticalDisplacement / timeDelta) * 100;
}

// <<< NEWLY INTEGRATED FUNCTION >>>
/**
 * Calculates the Z-axis displacement (+1, 0, -1) for each joint based on the change from the previous pose,
 * aware of the user's head orientation.
 * @param {object} currentJointInfo - The jointInfo object for the current pose.
 * @param {object} previousJointInfo - The jointInfo object from the previous frame.
 * @param {boolean} isFaceVisible - A flag indicating if the user's face is oriented towards the camera.
 * @returns {object} An object mapping each joint abbreviation to its Z-displacement value (+1, 0, -1).
 */
export const calculateZDisplacement = (currentJointInfo, previousJointInfo, isFaceVisible = true) => {
    const displacement = {};
    if (!currentJointInfo || !previousJointInfo) {
        return {}; // Not enough data to compare
    }

    const Z_THRESHOLD = 0.02; // A threshold to prevent noise from triggering a change. Can be tuned.

    for (const key in currentJointInfo) {
        const currentJoint = currentJointInfo[key];
        const previousJoint = previousJointInfo[key];

        if (currentJoint?.vector && previousJoint?.vector) {
            // Compare the z-coordinates. A smaller z is closer to the camera.
            const zChange = currentJoint.vector.z - previousJoint.vector.z;
            
            let zDirection = 0;
            if (zChange < -Z_THRESHOLD) {
                // Joint moved closer to the camera.
                zDirection = 1; // Forward relative to camera
            } else if (zChange > Z_THRESHOLD) {
                // Joint moved further from the camera.
                zDirection = -1; // Backward relative to camera
            }

            // If the user is facing away, a forward movement relative to them
            // is a backward movement relative to the camera. So we flip the sign.
            if (!isFaceVisible) {
                zDirection *= -1;
            }

            displacement[key] = zDirection;
        } else {
            displacement[key] = 0; // No change if joint is missing in either frame
        }
    }
    return displacement;
};


/**
 * [UPGRADED] The main analysis orchestrator.
 * Now includes Z-axis displacement calculation.
 * @returns {object} A comprehensive object of calculated biomechanical metrics.
 */
export const analyzePoseDynamics = (currentBeatData = {}, prevBeatData = {}, timeDelta = 1) => {
    const { jointInfo: currentJointInfo, isFaceVisible } = currentBeatData;
    const prevJointInfo = prevBeatData?.jointInfo;

    if (!currentJointInfo) {
        return {
            torsionalLoad: 0,
            upbeatEmphasis: 0,
            zDisplacements: {},
        };
    }
    
    const torsionalLoad = calculateTorsionalLoad(currentJointInfo);
    const upbeatEmphasis = calculateUpbeatEmphasis(prevJointInfo, currentJointInfo, timeDelta);
    const zDisplacements = calculateZDisplacement(currentJointInfo, prevJointInfo, isFaceVisible);

    return { torsionalLoad, upbeatEmphasis, zDisplacements };
};
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
 * @param {p5.Vector} p1 - The 3D vector of the starting joint.
 * @param {p5.Vector} p2 - The 3D vector of the ending joint.
 * @returns {object} A normalized 3D vector perpendicular to the limb.
 */
export function calculateLimbPlaneNormal(p1, p2) {
    const viewVector = { x: 0, y: 0, z: 1 }; // Assume camera is looking along the Z axis
    const limbVector = v_normalize(v_sub(p2, p1));
    if (v_mag(limbVector) === 0) return { x: 1, y: 0, z: 0 };
    const normal = {
        x: limbVector.y * viewVector.z - limbVector.z * viewVector.y,
        y: limbVector.z * viewVector.x - limbVector.x * viewVector.z,
        z: limbVector.x * viewVector.y - limbVector.y * viewVector.x,
    };
    return v_normalize(normal);
}

export const getRotationalLimits = (groundingNotation) => {
    // --- THIS IS THE SOCKET FOR YOUR DOMAIN EXPERTISE ---
    // For now, we will return placeholder values.
    // In the future, you will provide the precise calculations here based on your system.

    if (!groundingNotation || groundingNotation.endsWith('0')) {
        // Ungrounded - full rotation
        return { minAngle: -360, maxAngle: 360 }; 
    }
    if (groundingNotation.endsWith('123T12345')) {
        // Fully planted foot - most restricted
        return { minAngle: -45, maxAngle: 45 };
    }
    if (groundingNotation.includes('3')) {
        // Heel is down - more stable
        return { minAngle: -90, maxAngle: 90 };
    }

    // Default for any other partial grounding
    return { minAngle: -180, maxAngle: 180 };
};


/**
 * [UPGRADED] The "brain" for the Angle of Attack controller.
 * Calculates a convex polygon representing the biomechanically "safe zone" for the knee,
 * considering constraints from both the hip and the foot.
 * @param {object} poseData - The jointInfo object for the current pose.
 * @param {string} side - 'L' or 'R'.
 * @returns {array} An array of {x, y} points (from -1 to 1) defining the valid polygon.
 */
export function calculateValidKneePolygon(poseData = {}, side = 'L') {
    const hipAbbrev = `${side}H`;
    const footAbbrev = `${side}A`;

    // --- Inputs from the Kinetic Chain ---
    // Hip determines the primary direction/intent. Rotation is around Y-axis.
    const hipRotation = poseData[hipAbbrev]?.rotation || 0; 
    // Foot determines the hard boundary based on ground contact.
    const footRotation = poseData[footAbbrev]?.rotation || 0;

    // --- Biomechanical Constraints (in degrees) ---
    const KNEE_TOLERANCE = 25; // How far the knee can deviate from the hip's direction.
    const FOOT_CONSTRAINT = 40; // How far the knee can deviate from the foot's direction.

    // 1. Define the ideal range based on the hip's intention.
    const hipMinAngle = hipRotation - KNEE_TOLERANCE;
    const hipMaxAngle = hipRotation + KNEE_TOLERANCE;

    // 2. Define the absolute boundary based on the foot's grounded position.
    const footMinAngle = footRotation - FOOT_CONSTRAINT;
    const footMaxAngle = footRotation + FOOT_CONSTRAINT;

    // 3. The true valid range is the *intersection* of these two ranges.
    const finalMinAngle = Math.max(hipMinAngle, footMinAngle);
    const finalMaxAngle = Math.min(hipMaxAngle, footMaxAngle);

    // 4. Generate the polygon points for the "pie slice" shape.
    const polygon = [];
    // The "heel" point of the safe zone, slightly behind center.
    polygon.push({ x: 0, y: -0.2 }); 

    // Generate points along the arc of the safe zone.
    const steps = 10; // Number of points to define the curve.
    const angleStep = (finalMaxAngle - finalMinAngle) / steps;

    for (let i = 0; i <= steps; i++) {
        const angle = finalMinAngle + (i * angleStep);
        const rad = angle * (Math.PI / 180);
        // The y-coordinate is pushed forward, representing knee extension over the foot.
        // A max extension of 0.9 keeps it within the "wheel".
        polygon.push({
            x: 0.9 * Math.sin(rad),
            y: 0.9 * Math.cos(rad)
        });
    }

    // The function now returns a complete polygon path.
    return polygon;
}

// =======================================================================================
// == EXPORTED BIOMECHANICAL CALCULATIONS ==
// =======================================================================================

/**
 * Calculates a simplified Center of Mass. For professional use, this could be
 * replaced with a model using weighted body part masses.
 */
export function calculateCenterOfMass(jointInfo = {}) {
    const keypoints = [ getVector(jointInfo, 'CHEST'), getVector(jointInfo, 'PELV'), getVector(jointInfo, 'H') ];
    const validPoints = keypoints.filter(v => v !== POSE_DEFAULT_VECTOR);
    if (validPoints.length === 0) return { ...POSE_DEFAULT_VECTOR };
    
    const sum = validPoints.reduce((acc, vec) => ({
        x: acc.x + vec.x, y: acc.y + vec.y, z: acc.z + vec.z,
    }), { x: 0, y: 0, z: 0 });

    return { x: sum.x / validPoints.length, y: sum.y / validPoints.length, z: sum.z / validPoints.length };
}

/**
 * [UPGRADED] Calculates true 3D torsional load between shoulder and hip girdles.
 * Returns a signed angle in degrees representing the twist.
 * Positive values indicate a clockwise twist (right shoulder back).
 * Negative values indicate a counter-clockwise twist (left shoulder back).
 */
export function calculateTorsionalLoad(jointInfo = {}) {
    const ls = getVector(jointInfo, 'LS');
    const rs = getVector(jointInfo, 'RS');
    const lh = getVector(jointInfo, 'LH');
    const rh = getVector(jointInfo, 'RH');
    const pelvis = getVector(jointInfo, 'PELV');
    const chest = getVector(jointInfo, 'CHEST');

    const shoulderVector = v_sub(rs, ls);
    const hipVector = v_sub(rh, lh);
    
    // Use the spine vector as the primary axis of rotation.
    const spineAxis = v_normalize(v_sub(chest, pelvis));
    if (v_mag(spineAxis) === 0) return 0; // Not enough data to define an axis.

    // Project shoulder and hip vectors onto the plane perpendicular to the spine axis.
    // Projection of v onto plane with normal n is: v' = v - (v . n) * n
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

    // Determine the sign of the angle by checking if the twist is along the spine axis.
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
 * [NEW] Calculates the vertical "pop" or "emphasis" of a movement between two poses.
 * This is a measure of vertical acceleration of the Center of Mass.
 * @returns {number} A score representing upward (positive) or downward (negative) emphasis.
 */
export function calculateUpbeatEmphasis(prevJointInfo, currentJointInfo, timeDelta) {
    if (!prevJointInfo || !currentJointInfo || !timeDelta || timeDelta <= 0) return 0;

    const com_prev = calculateCenterOfMass(prevJointInfo);
    const com_curr = calculateCenterOfMass(currentJointInfo);

    // Using a simple difference in vertical position as a proxy for emphasis.
    // A true acceleration calculation would require a third data point (the pose before the previous).
    // This provides a good, stable approximation.
    const verticalDisplacement = com_curr.y - com_prev.y;

    // Scale the result to make it a more intuitive number. This factor can be tuned.
    // The division by timeDelta normalizes it, akin to velocity.
    return (verticalDisplacement / timeDelta) * 100;
}


/**
 * [UPGRADED] The main analysis orchestrator.
 * Takes data for the current and previous beat to perform time-based analysis.
 * @param {object} currentBeatData The full data object for the current beat.
 * @param {object} prevBeatData The full data object for the previous beat.
 * @param {number} timeDelta The time elapsed between beats in seconds.
 * @returns {object} A comprehensive object of calculated biomechanical metrics.
 */
export const analyzePoseDynamics = (currentBeatData = {}, prevBeatData = {}, timeDelta = 1) => {
    if (!currentBeatData || !currentBeatData.jointInfo) {
        return {
            torsionalLoad: 0,
            upbeatEmphasis: 0,
        };
    }
    const { jointInfo: currentJointInfo } = currentBeatData;
    const prevJointInfo = prevBeatData?.jointInfo;

    const torsionalLoad = calculateTorsionalLoad(currentJointInfo);
    const upbeatEmphasis = calculateUpbeatEmphasis(prevJointInfo, currentJointInfo, timeDelta);

    return { torsionalLoad, upbeatEmphasis };
};
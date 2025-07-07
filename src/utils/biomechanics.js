// src/utils/biomechanics.js

import { POSE_DEFAULT_VECTOR } from './constants';

// --- Vector Math Helpers ---
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
 * Calculates a simplified Center of Mass.
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
 * Calculates the rotational limits based on grounding. This is a placeholder
 * for your more complex domain logic.
 */
export const getRotationalLimits = (groundingNotation) => {
    if (!groundingNotation || groundingNotation.endsWith('0')) {
        return { minAngle: -360, maxAngle: 360 }; 
    }
    if (groundingNotation.endsWith('123T12345')) {
        return { minAngle: -45, maxAngle: 45 };
    }
    if (groundingNotation.includes('3')) {
        return { minAngle: -90, maxAngle: 90 };
    }
    return { minAngle: -180, maxAngle: 180 };
};
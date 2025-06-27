import { POSE_DEFAULT_VECTOR, DEFAULT_POSITIONS_2D } from './constants';

/**
 * A collection of pure functions for advanced biomechanical analysis.
 * This is the scientific kernel of SĒQsync.
 */

/**
 * Calculates the Center of Mass (CoM) for a given pose.
 * NOTE: This is a simplified model assuming equal mass for all joints.
 * A more advanced version would use anthropometric data.
 * @param {object} jointInfo - Object mapping joint abbreviations to their data.
 * @returns {object} A {x, y, z} vector for the CoM.
 */
function calculateCenterOfMass(jointInfo = {}) {
    const vectors = Object.values(jointInfo).map(j => j.vector).filter(Boolean);
    if (vectors.length === 0) return { ...POSE_DEFAULT_VECTOR };

    const sum = vectors.reduce((acc, vec) => ({
        x: acc.x + (vec.x || 0),
        y: acc.y + (vec.y || 0),
        z: acc.z + (vec.z || 0),
    }), { x: 0, y: 0, z: 0 });

    return {
        x: sum.x / vectors.length,
        y: sum.y / vectors.length,
        z: sum.z / vectors.length,
    };
}

/**
 * Determines the kinetic flow path from a grounding point to an expressing joint.
 * NOTE: This is a placeholder for a more complex future implementation.
 * @param {object} jointInfo - The full pose data.
 * @param {object} grounding - The grounding data.
 * @returns {object} An object with { path, driver, momentum }.
 */
function calculateKineticFlow(jointInfo = {}, grounding = {}) {
    // Placeholder logic: Find the highest joint and assume it's the driver.
    // Assume grounding is the left foot if available, otherwise right.
    let driver = 'H';
    let max_y = -Infinity;
    Object.entries(jointInfo).forEach(([key, val]) => {
        if (val?.vector?.y > max_y) {
            max_y = val.vector.y;
            driver = key;
        }
    });

    const anchor = (grounding.L && grounding.L.length > 0) ? 'LA' : 'RA';

    // A very basic path for demonstration
    const path = ['C', 'N', 'LS', 'LE', 'LW'];
    const momentum = (jointInfo[driver]?.vector?.y || 0) * 50;

    return { path, driver, anchor, terminus: driver, momentum };
}


/**
 * Calculates the stability of a pose based on the relationship between the
 * Center of Mass (CoM) and the Base of Support (BoS).
 * @param {object} centerOfMass - The {x,y,z} vector of the CoM.
 * @param {object} grounding - The grounding data {L:[], R:[]}.
 * @param {object} jointInfo - The full pose data, to get ankle positions.
 * @returns {number} A stability score from 0 (unstable) to 100 (very stable).
 */
function calculateStability(centerOfMass, grounding, jointInfo) {
    if (!centerOfMass || !grounding || !jointInfo) return 0;

    const leftAnklePos = jointInfo.LA?.vector;
    const rightAnklePos = jointInfo.RA?.vector;

    const isLeftGrounded = grounding.L && grounding.L.length > 0 && leftAnklePos;
    const isRightGrounded = grounding.R && grounding.R.length > 0 && rightAnklePos;

    // Project CoM to 2D plane (X, Z) for stability calculation
    const com_x = centerOfMass.x;
    const com_z = centerOfMass.z;

    // Case 1: Both feet grounded - BoS is area between feet
    if (isLeftGrounded && isRightGrounded) {
        const la_x = leftAnklePos.x;
        const ra_x = rightAnklePos.x;
        const la_z = leftAnklePos.z;
        const ra_z = rightAnklePos.z;
        
        const bos_center_x = (la_x + ra_x) / 2;
        const bos_center_z = (la_z + ra_z) / 2;
        
        const bos_radius = Math.sqrt(Math.pow(la_x - bos_center_x, 2) + Math.pow(la_z - bos_center_z, 2));
        
        if (bos_radius < 0.01) return 100; // Feet are together, very stable point
        
        const com_dist = Math.sqrt(Math.pow(com_x - bos_center_x, 2) + Math.pow(com_z - bos_center_z, 2));

        const score = 100 * Math.max(0, 1 - (com_dist / bos_radius));
        return Math.round(score);
    }

    // Case 2: One foot grounded - BoS is small area around that foot
    if (isLeftGrounded || isRightGrounded) {
        const anchorAnklePos = isLeftGrounded ? leftAnklePos : rightAnklePos;
        const ankle_x = anchorAnklePos.x;
        const ankle_z = anchorAnklePos.z;
        
        const bos_radius = 0.2;
        
        const com_dist = Math.sqrt(Math.pow(com_x - ankle_x, 2) + Math.pow(com_z - ankle_z, 2));
        
        const score = 100 * Math.max(0, 1 - (com_dist / bos_radius));
        return Math.round(score);
    }
    
    // Case 3: No feet grounded (in air)
    return 0;
}

/**
 * Placeholder function to satisfy import in CoreDynamicsVisualizer.
 * Its real logic can be implemented when we focus on that component.
 * @param {object} jointInfo
 * @returns {object} A default or calculated state for core dynamics.
 */
export const getCoreState = (jointInfo = {}) => {
  // Return a default state that the component can safely render
  return {
    hipTilt: 0,
    spineBend: 0,
    coreTwist: 0,
  };
};


/**
 * The main analysis function that aggregates all biomechanical calculations.
 * @param {object} beatData - The data object for a single beat.
 * @returns {object} A comprehensive analysis object.
 */
export const analyzePoseDynamics = (beatData = {}) => {
    const jointInfo = beatData.jointInfo || {};
    const grounding = beatData.grounding || {};

    const centerOfMass = calculateCenterOfMass(jointInfo);
    const kineticPathData = calculateKineticFlow(jointInfo, grounding);
    const stability = calculateStability(centerOfMass, grounding, jointInfo);

    return {
        centerOfMass,
        ...kineticPathData,
        stability,
        // Future metrics can be added here
    };
};
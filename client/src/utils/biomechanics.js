// src/utils/biomechanics.js

/**
 * Calculates the permissible movement bounds for a knee based on the grounding of the corresponding foot.
 * The bounds are returned as a simple object { x, y, z } where each value represents the
 * maximum deviation from the center point (0,0,0) in that axis.
 * A value of 0 would mean no movement is allowed on that axis.
 *
 * @param {Array<string> | null} groundPoints - An array of grounding points like ['L1', 'L2', 'L3', 'T1'...] or null.
 * @returns {{x: number, y: number, z: number}} An object defining the movement boundaries.
 */
export const calculateKneeBounds = (groundPoints) => {
  // Default bounds for when the foot is off the ground (e.g., in the air during a kick)
  // This allows for a wide range of motion.
  const defaultBounds = { x: 1, y: 1, z: 1 };

  if (!groundPoints || groundPoints.length === 0) {
    return defaultBounds;
  }

  // Check for the presence of key foot sections
  const hasHeel = groundPoints.some(p => p.includes('3')); // Heel is section 3
  const hasBall = groundPoints.some(p => p.includes('1') || p.includes('2')); // Ball is sections 1 and 2
  const hasToes = groundPoints.some(p => p.startsWith('T'));

  // Scenario 1: Full Plant (Heel and Ball grounded)
  // The knee is stable and has limited, controlled forward and lateral movement.
  if (hasHeel && hasBall) {
    return {
      x: 0.5, // Limited side-to-side movement
      y: 0,   // No vertical movement relative to the foot
      z: 0.7, // Can move forward over the toes, but not excessively
    };
  }

  // Scenario 2: Heel Up, on Ball of Foot (e.g., L12T12345)
  // This is a dynamic, mobile stance. Allows for significant forward knee travel (lunge).
  if (!hasHeel && hasBall) {
    return {
      x: 0.6, // Decent lateral mobility for pivots
      y: 0,   // No vertical movement
      z: 1.0, // Maximum forward travel is allowed
    };
  }
  
  // Scenario 3: On Heel only (e.g., preparing for a side kick chamber)
  // Very specific stance, limits forward travel but allows some pivot/lateral shift.
  if (hasHeel && !hasBall) {
    return {
      x: 0.7, // Allows for some lateral hip opening
      y: 0,
      z: 0.2, // Very little forward travel is stable here
    };
  }

  // Fallback to default if no specific case matches
  return defaultBounds;
};

/**
 * Clamps a vector's values based on the provided bounds.
 * @param {{x: number, y: number, z: number}} vector - The vector to clamp.
 * @param {{x: number, y: number, z: number}} bounds - The max deviation for each axis.
 * @returns {{x: number, y: number, z: number}} The clamped vector.
 */
export const clampVector = (vector, bounds) => {
    return {
        x: Math.max(-bounds.x, Math.min(bounds.x, vector.x)),
        y: Math.max(-bounds.y, Math.min(bounds.y, vector.y)),
        z: Math.max(-bounds.z, Math.min(bounds.z, vector.z)),
    };
};
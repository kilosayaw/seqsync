/**
 * Calculates a curved crossfader value. This function adjusts the response of a
 * linear input (like a slider) to be either very sharp (quick change near the ends)
 * or smoother (more linear).
 * @param {number} linearValue - The raw fader value (0-100).
 * @param {number} curve - The curve setting (0 for sharpest, 100 for smoothest/linear).
 * @returns {number} The adjusted value after applying the curve.
 */
export const calculateCurvedValue = (linearValue, curve) => {
  // Treat near-max curve values as perfectly linear to avoid floating point issues.
  if (curve >= 98) {
    return linearValue;
  }

  // Normalize inputs to a 0-1 range for mathematical operations.
  const x = linearValue / 100;
  // Map the curve setting (0-100) to a mathematical exponent.
  // A low exponent (e.g., 0.1) creates a very sharp curve.
  // An exponent of 1.0 creates a linear response.
  const exponent = 0.1 + (curve / 100) * 0.9;

  let curvedX;
  if (x < 0.5) {
    // Apply the power curve to the first half of the fader's travel.
    curvedX = 0.5 * Math.pow(x * 2, exponent);
  } else {
    // Apply a mirrored power curve to the second half for symmetry.
    curvedX = 1 - 0.5 * Math.pow((1 - x) * 2, exponent);
  }
  
  // Convert the result back to the 0-100 range.
  return curvedX * 100;
};



/**
 * Linearly interpolates between two numbers. This is a fundamental building block
 * for creating smooth transitions.
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} fraction - The fraction (0.0 to 1.0) to interpolate by.
 * @returns {number} The interpolated value.
 */
export const lerp = (start, end, fraction) => start + (end - start) * fraction;

/**
 * Linearly interpolates between two 3D vectors by applying `lerp` to each axis.
 * This is used to smoothly move a joint from one position to another over several beats.
 * @param {object} startVec - The starting vector {x, y, z}.
 * @param {object} endVec - The ending vector {x, y, z}.
 * @param {number} fraction - The fraction (0.0 to 1.0) to interpolate by.
 * @returns {object} The new interpolated vector {x, y, z}.
 */
export const lerpVector = (startVec, endVec, fraction) => ({
  x: lerp(startVec.x || 0, endVec.x || 0, fraction),
  y: lerp(startVec.y || 0, endVec.y || 0, fraction),
  z: lerp(startVec.z || 0, endVec.z || 0, fraction),
});
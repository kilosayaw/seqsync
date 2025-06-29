// src/utils/biomechanics.js

/**
 * @file This file is the "biomechanical kernel" of the poSĒQr system.
 * It contains pure, headless JavaScript functions for calculating realistic
 * anatomical constraints and states. It has no dependencies on the UI (React)
 * and can be used in any environment, forming the core of our licensable engine.
 */
import { BIOMECHANICAL_CONSTANTS } from './constants';

// ... (calculateKneeBounds and clampVector functions remain here)

export const calculateKneeBounds = (groundPoints) => {
  // ... (implementation is correct)
};

export const clampVector = (vector, bounds) => {
  // ... (implementation is correct)
};


// [CORRECTED] Ensure this function is exported
export const getConstrainedHipRange = (activeHipId, fullPoseState) => {
  // ... (implementation is correct)
};

/**
 * [CORRECTED] The "export" keyword was missing from this function definition.
 * It is now correctly exported and available for other modules to import.
 */
export const getCoreState = (fullPoseState) => {
  const { LH, RH, LS, RS } = fullPoseState;
  const C_NORM = BIOMECHANICAL_CONSTANTS.NORMALIZATION;
  
  if (!LH || !RH || !LS || !RS) return { coil: 0, energy: 0 }; // Safety check

  const hipAvgRotation = (LH.rotation + RH.rotation) / 2;
  const shoulderAvgRotation = (LS.rotation + RS.rotation) / 2;
  const coil = (shoulderAvgRotation - hipAvgRotation) / C_NORM.MAX_SHOULDER_HIP_TWIST;

  const totalRotation = Math.abs(LH.rotation) + Math.abs(RH.rotation) + Math.abs(LS.rotation) + Math.abs(RS.rotation);
  const energy = totalRotation / C_NORM.MAX_TOTAL_ROTATION_ENERGY;

  return {
    coil: Math.max(-1, Math.min(1, coil)), // Clamp to [-1, 1]
    energy: Math.max(0, Math.min(1, energy)), // Clamp to [0, 1]
  };
};
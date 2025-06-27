// src/utils/biomechanics.js

/**
 * @file This file is the "biomechanical kernel" of the poSĒQr system.
 * It contains pure, headless JavaScript functions for calculating realistic
 * anatomical constraints, states, and energy flow. It has no dependencies 
 * on the UI and can be used in any environment.
 */
import { BIOMECHANICAL_CONSTANTS } from './constants';

/**
 * Calculates the permissible movement bounds for a knee based on the grounding of the corresponding foot.
 * @param {Array<string> | null} groundPoints - An array of grounding points like ['L1', 'T1'] or null.
 * @returns {{x: number, y: number, z: number}} An object defining the movement boundaries.
 */
export const calculateKneeBounds = (groundPoints) => {
  const C = BIOMECHANICAL_CONSTANTS.KNEE_BOUNDS;
  if (!groundPoints || groundPoints.length === 0) {
    return C.DEFAULT;
  }

  const hasHeel = groundPoints.some(p => p.includes('3'));
  const hasBall = groundPoints.some(p => p.includes('1') || p.includes('2'));

  if (hasHeel && hasBall) return C.FULL_PLANT;
  if (!hasHeel && hasBall) return C.HEEL_UP;
  if (hasHeel && !hasBall) return C.HEEL_ONLY;

  return C.DEFAULT;
};

/**
 * Clamps a vector's values based on the provided bounds (max deviation from center).
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

/**
 * Calculates the constrained range of motion for a hip based on the opposing hip's state.
 * @param {string} activeHipId - 'LH' or 'RH'.
 * @param {object} fullPoseState - The current state object for the entire pose.
 * @returns {{rotation: {min: number, max: number}, flexion: {min: number, max: number}}}
 */
export const getConstrainedHipRange = (activeHipId, fullPoseState) => {
  const C_ROT = BIOMECHANICAL_CONSTANTS.HIP_ROTATION;
  const C_FLEX = BIOMECHANICAL_CONSTANTS.HIP_FLEXION;
  const C_THRESH = BIOMECHANICAL_CONSTANTS.THRESHOLDS;

  const opposingHipId = activeHipId === 'LH' ? 'RH' : 'LH';
  const opposingHip = fullPoseState[opposingHipId];

  const ranges = {
    rotation: { min: C_ROT.DEFAULT_MIN, max: C_ROT.DEFAULT_MAX },
    flexion: { min: C_FLEX.DEFAULT_MIN, max: C_FLEX.DEFAULT_MAX },
  };
  
  if (!opposingHip) return ranges;

  if (opposingHip.rotation <= -C_THRESH.NEAR_MAX_ROTATION) {
    ranges.rotation.min = C_ROT.CONSTRAINED_MIN;
  }
  if (opposingHip.rotation >= C_THRESH.NEAR_MAX_ROTATION) {
    ranges.rotation.max = C_ROT.CONSTRAINED_MAX;
  }

  if (opposingHip.flexion > C_THRESH.DEEP_FLEXION) {
    ranges.flexion.min = C_FLEX.CONSTRAINED_MIN;
  }

  return ranges;
};

/**
 * Calculates the state of the core "energy ball" based on pelvic and shoulder girdle relationships.
 * @param {object} fullPoseState - The current state object for the entire pose.
 * @returns {{coil: number, energy: number}} An object with coil [-1, 1] and energy [0, 1].
 */
export const getCoreState = (fullPoseState) => {
  const { LH, RH, LS, RS } = fullPoseState || {};
  const C_NORM = BIOMECHANICAL_CONSTANTS.NORMALIZATION;
  
  if (!LH?.rotation || !RH?.rotation || !LS?.rotation || !RS?.rotation) return { coil: 0, energy: 0 };

  const hipAvgRotation = (LH.rotation + RH.rotation) / 2;
  const shoulderAvgRotation = (LS.rotation + RS.rotation) / 2;
  const coil = (shoulderAvgRotation - hipAvgRotation) / C_NORM.MAX_SHOULDER_HIP_TWIST;

  const totalRotation = Math.abs(LH.rotation) + Math.abs(RH.rotation) + Math.abs(LS.rotation) + Math.abs(RS.rotation);
  const energy = totalRotation / C_NORM.MAX_TOTAL_ROTATION_ENERGY;

  return {
    coil: Math.max(-1, Math.min(1, coil)),
    energy: Math.max(0, Math.min(1, energy)),
  };
};

/**
 * [IMPLEMENTED] Analyzes a pose to determine the current path of kinetic energy and suggests the next logical joint for transfer.
 * This is the foundational logic for the "Spider-Man" energy flow visualization.
 * @param {object} pose - The complete pose object for a single beat, containing jointInfo and grounding.
 * @returns {{path: string[], nextBestJoint: string|null, momentum: number}}
 */
export const getNextEnergyTransfer = (pose) => {
  const { jointInfo, grounding } = pose || {};
  
  // If there's no pose info or no grounding, there's no energy flow from the ground.
  if (!jointInfo || !grounding) {
    return { path: [], nextBestJoint: null, momentum: 0 };
  }

  const groundedSide = grounding.L?.length > 0 ? 'L' : (grounding.R?.length > 0 ? 'R' : null);
  if (!groundedSide) {
    return { path: [], nextBestJoint: null, momentum: 0 };
  }

  const { ROTATION_THRESHOLD, ENERGY_VALUES } = BIOMECHANICAL_CONSTANTS.KINETIC_CHAIN;

  let path = [];
  let momentum = 0;
  let nextBestJoint = null;
  let currentJointId;

  // 1. Foot to Ankle (Grounding initiates the chain)
  path.push(`${groundedSide}F`);
  momentum += ENERGY_VALUES.GROUNDING;
  currentJointId = `${groundedSide}A`;
  
  // 2. Ankle to Knee
  const ankle = jointInfo[currentJointId];
  if (ankle && Math.abs(ankle.rotation) > ROTATION_THRESHOLD.ANKLE) {
    path.push(currentJointId);
    momentum += ENERGY_VALUES.ANKLE;
    nextBestJoint = `${groundedSide}K`;
    currentJointId = nextBestJoint;
  } else {
    return { path, nextBestJoint: currentJointId, momentum }; // Flow stops if ankle isn't "loaded"
  }

  // 3. Knee to Hip
  const knee = jointInfo[currentJointId];
  if (knee && Math.abs(knee.rotation) > ROTATION_THRESHOLD.KNEE) {
    path.push(currentJointId);
    momentum += ENERGY_VALUES.KNEE;
    nextBestJoint = `${groundedSide}H`;
    currentJointId = nextBestJoint;
  } else {
    return { path, nextBestJoint: currentJointId, momentum };
  }

  // 4. Hip to Core/Shoulders
  const hip = jointInfo[currentJointId];
  if (hip && Math.abs(hip.rotation) > ROTATION_THRESHOLD.HIP) {
    path.push(currentJointId);
    momentum += ENERGY_VALUES.HIP;
    path.push('PELV'); // Energy passes through the pelvis
    momentum += ENERGY_VALUES.CORE;
    // Energy is now in the core. The next move could be to either shoulder.
    // We can suggest the contralateral (opposite) shoulder for a cross-body strike.
    const contralateralShoulder = `${groundedSide === 'L' ? 'R' : 'L'}S`;
    nextBestJoint = contralateralShoulder;
    currentJointId = nextBestJoint;
  } else {
    return { path, nextBestJoint: currentJointId, momentum };
  }

  // 5. Shoulder to Elbow (Finalizing the suggestion)
  const shoulder = jointInfo[currentJointId];
  if (shoulder && Math.abs(shoulder.rotation) > ROTATION_THRESHOLD.SHOULDER) {
      path.push(currentJointId);
      momentum += ENERGY_VALUES.SHOULDER;
      // If the shoulder is "loaded", the natural next step is the elbow.
      nextBestJoint = `${currentJointId.charAt(0)}E`; // e.g., 'RE' from 'RS'
  }

  return { path, nextBestJoint, momentum };
};
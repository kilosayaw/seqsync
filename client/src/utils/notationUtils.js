/**
 * @file notationUtils.js
 * The definitive notation engine for SĒQsync.
 * This utility translates a raw beat data object into comprehensive, multi-layered
 * textual representations: shorthand, plain English, and medical/scientific analysis.
 * This implementation is based on the user's detailed, original logic.
 */

import { getSoundNameFromPath } from './soundUtils'; // Assuming this exists and works
import {
  DEFAULT_ANKLE_SAGITTAL, DEFAULT_ANKLE_FRONTAL, DEFAULT_ANKLE_TRANSVERSE,
  DEFAULT_JOINT_ENERGY, DEFAULT_GENERAL_ORIENTATION, DEFAULT_INTENT,
  POSE_DEFAULT_VECTOR
} from './constants';
import {
  getVerboseJointName,
  getVerboseOrientation,
  getVerboseIntent,
  getVerboseHeadOverTarget,
  GROUNDING_POINT_VERBOSE_MAP
} from './notationMaps';


const describeGroundingForSideDetail = (sideAbbrev, groundingPointsInput, type = 'plain') => {
  const fullSideNamePlain = sideAbbrev === 'L' ? 'Left Foot' : 'Right Foot';
  const fullSideNameMedical = sideAbbrev === 'L' ? 'Left Pes' : 'Right Pes';

  if (!groundingPointsInput || (Array.isArray(groundingPointsInput) && groundingPointsInput.length === 0)) {
    return type === 'plain' ? `${fullSideNamePlain} lifted` : `${fullSideNameMedical} non-weight bearing / swing phase`;
  }

  const pointsToProcess = Array.isArray(groundingPointsInput) ? groundingPointsInput : [groundingPointsInput];
  const pointDescriptions = pointsToProcess
    .map(pointKey => GROUNDING_POINT_VERBOSE_MAP[pointKey]?.[type] || pointKey)
    .filter(Boolean); 

  if (pointDescriptions.length === 0) {
    return type === 'plain' ? `${fullSideNamePlain} state unclear` : `${fullSideNameMedical} contact undetermined`;
  }
  
  const combinedDesc = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(pointDescriptions);
  const basePhrase = type === 'plain' ? fullSideNamePlain : fullSideNameMedical;
  return `${basePhrase}: ${combinedDesc}${type === 'plain' ? ' contacting ground' : ' in ground contact phase'}.`;
};

/**
 * Creates a description of a joint's vector movement, aware of camera perspective.
 * @param {object} vector - The {x, y, z} vector object.
 * @param {'plain' | 'medical'} type - The desired output format.
 * @param {boolean} isFacingAway - True if the subject is facing away from the camera.
 * @returns {string} The movement description.
 */
const describeVectorMovement = (vector, type = 'plain', isFacingAway = false) => {
  const safeVector = (vector && typeof vector === 'object') ? vector : POSE_DEFAULT_VECTOR;
  const x = typeof safeVector.x === 'number' ? safeVector.x : 0;
  const y = typeof safeVector.y === 'number' ? safeVector.y : 0;
  const z = typeof safeVector.z === 'number' ? safeVector.z : 0;

  const descriptions = [];
  const medicalTerm = 'Displacement';
  const plainTerm = 'movement';
  const threshold = 0.05;

  // X-axis (Lateral/Medial) - This is generally relative to the body's midline.
  // We assume 'Leftward'/'Rightward' is relative to the screen for simplicity, as
  // anatomical left/right gets very complex without full body orientation context.
  if (x > threshold) descriptions.push(`Leftward ${type === 'plain' ? plainTerm : medicalTerm}`);
  else if (x < -threshold) descriptions.push(`Rightward ${type === 'plain' ? plainTerm : medicalTerm}`);

  // Y-axis (Superior/Inferior)
  if (y > threshold) descriptions.push(`Upward ${type === 'plain' ? plainTerm : medicalTerm}`);
  else if (y < -threshold) descriptions.push(`Downward ${type === 'plain' ? plainTerm : medicalTerm}`);

  // Z-axis (Anterior/Posterior) - This is where facing direction is critical.
  const forwardTerm = isFacingAway ? 'forward (away from camera)' : 'forward (towards camera)';
  const backwardTerm = isFacingAway ? 'backward (towards camera)' : 'backward (away from camera)';
  
  if (z > threshold) descriptions.push(`${forwardTerm} ${type === 'plain' ? plainTerm : medicalTerm}`);
  else if (z < -threshold) descriptions.push(`${backwardTerm} ${type === 'plain' ? plainTerm : medicalTerm}`);

  if (descriptions.length === 0) {
    return type === 'plain' ? "No significant movement" : "Position maintained";
  }

  return descriptions.join(type === 'plain' ? ', ' : '; ');
};


export const generateNotationForBeat = (barNum, beatIdxInBar, currentBeatData, currentTimecodeParts) => {
  const { mm = '00', ss = '00', cs = '00' } = currentTimecodeParts || {};
  const timeStr = `${mm}:${ss}:${cs}`;
  const barDisplayNum = barNum + 1;
  const beatDisplayNum = beatIdxInBar + 1;

  if (!currentBeatData || typeof currentBeatData.id !== 'number') {
    return {
      shorthand: `B${barDisplayNum}:S${beatDisplayNum} @${timeStr} | No Data`,
      plainEnglish: `Bar ${barDisplayNum}, Beat ${beatDisplayNum}: No data available for this step.`,
      analysis: `Bar ${barDisplayNum}, Beat ${beatDisplayNum}: Biomechanical state unknown due to missing data.`
    };
  }
  
  // Determine if the subject is facing away based on Neck rotation
  const neckRotation = currentBeatData.jointInfo?.N?.rotation || 0;
  const isFacingAway = Math.abs(neckRotation) > 90;

  let shorthandParts = [`B${barDisplayNum}:S${beatDisplayNum}`, `@${timeStr}`];
  let plainEnglishLines = [`Bar ${barDisplayNum}, Beat ${beatDisplayNum} (${timeStr}):`];
  let medicalLines = [`Bar ${barDisplayNum}, Beat ${beatDisplayNum} (${timeStr}) - Medical/Scientific Analysis:`];
  let hasMeaningfulData = false;

  if (currentBeatData.syllable?.trim()) {
    shorthandParts.push(`SYL(${currentBeatData.syllable.substring(0, 10).replace(/[|()\[\]{};]/g, '')})`);
    plainEnglishLines.push(`• Vocal Cue: "${currentBeatData.syllable}".`);
    medicalLines.push(`• Annotation/Syllable: "${currentBeatData.syllable}".`);
    hasMeaningfulData = true;
  }

  if (currentBeatData.headOver && currentBeatData.headOver !== 'None') {
    shorthandParts.push(`HO(${currentBeatData.headOver})`);
    plainEnglishLines.push(`• Head aligned over ${getVerboseHeadOverTarget(currentBeatData.headOver, 'plain')}.`);
    medicalLines.push(`• Cephalic Alignment: Relative to ${getVerboseHeadOverTarget(currentBeatData.headOver, 'medical')} (Ref: ${currentBeatData.headOver}).`);
    hasMeaningfulData = true;
  }

  if (currentBeatData.sounds?.length > 0) {
    const soundNames = currentBeatData.sounds.map(getSoundNameFromPath);
    shorthandParts.push(`SND(${soundNames.map(s => s.substring(0, 4)).join(',')})`);
    plainEnglishLines.push(`• Sounds: ${soundNames.join(', ')}.`);
    medicalLines.push(`• Auditory Events: Triggered [${soundNames.join(', ')}].`);
    hasMeaningfulData = true;
  }

  const groundingData = currentBeatData.grounding || {};
  const { L: groundL, R: groundR, L_weight } = groundingData;
  const hasGrounding = (groundL && groundL.length > 0) || (groundR && groundR.length > 0) || (typeof L_weight === 'number');
  if (hasGrounding) {
    hasMeaningfulData = true;
    const lPlain = describeGroundingForSideDetail('L', groundL, 'plain');
    plainEnglishLines.push(`• ${lPlain}`);
    medicalLines.push(`• ${describeGroundingForSideDetail('L', groundL, 'medical')}`);
    
    const rPlain = describeGroundingForSideDetail('R', groundR, 'plain');
    plainEnglishLines.push(`• ${rPlain}`);
    medicalLines.push(`• ${describeGroundingForSideDetail('R', groundR, 'medical')}`);
    
    if (typeof L_weight === 'number') {
        const lWeight = L_weight ?? 50;
        plainEnglishLines.push(`• Weight Distribution: ${lWeight.toFixed(0)}% Left / ${(100 - lWeight).toFixed(0)}% Right.`);
        medicalLines.push(`• Load Distribution: ${lWeight.toFixed(0)}% Left Pes / ${(100 - lWeight).toFixed(0)}% Right Pes.`);
    }
  }

  const jointInfo = currentBeatData.jointInfo || {};
  const jointEntries = Object.entries(jointInfo);
  if (jointEntries.length > 0) {
    let jointSectionStartedPlain = false;
    let jointSectionStartedMedical = false;

    jointEntries.forEach(([jointAbbrev, details]) => {
      if (!details || typeof details !== 'object') return;

      const { vector, rotation, orientation, orientation_sagittal, orientation_frontal, orientation_transverse, intent, energy, in_ex_rotation } = details;
      const safeVector = (vector && typeof vector === 'object') ? vector : POSE_DEFAULT_VECTOR;
      const hasVector = Math.abs(safeVector.x) > 0.01 || Math.abs(safeVector.y) > 0.01 || Math.abs(safeVector.z) > 0.01;
      const hasRotation = rotation !== undefined && parseFloat(rotation) !== 0;
      const hasInExRotation = in_ex_rotation !== undefined && parseFloat(in_ex_rotation) !== 0;
      const hasOrientation = orientation && orientation !== DEFAULT_GENERAL_ORIENTATION;
      const hasAnkleOrientation = (orientation_sagittal && orientation_sagittal !== DEFAULT_ANKLE_SAGITTAL) || (orientation_frontal && orientation_frontal !== DEFAULT_ANKLE_FRONTAL) || (orientation_transverse && orientation_transverse !== DEFAULT_ANKLE_TRANSVERSE);
      const hasIntent = intent && intent !== DEFAULT_INTENT;
      const hasEnergy = energy !== undefined && parseFloat(energy) !== DEFAULT_JOINT_ENERGY;

      if (hasVector || hasRotation || hasInExRotation || hasOrientation || hasAnkleOrientation || hasIntent || hasEnergy) {
        hasMeaningfulData = true;
        if (!jointSectionStartedPlain) { plainEnglishLines.push(`• Joint Actions:`); jointSectionStartedPlain = true; }
        if (!jointSectionStartedMedical) { medicalLines.push(`• Joint Kinematics:`); jointSectionStartedMedical = true; }

        let plainDetails = [];
        let medicalDetails = [];
        
        if (hasVector) {
            plainDetails.push(describeVectorMovement(safeVector, 'plain', isFacingAway));
            medicalDetails.push(`Vector: ${describeVectorMovement(safeVector, 'medical', isFacingAway)}`);
        }
        if (hasRotation) {
            plainDetails.push(`global rotation ${parseFloat(rotation).toFixed(0)}°`);
            medicalDetails.push(`Global Angular Displacement: ${parseFloat(rotation).toFixed(0)}°`);
        }
        if (hasInExRotation) {
            plainDetails.push(`ankle rotation ${parseFloat(in_ex_rotation).toFixed(0)}°`);
            medicalDetails.push(`Ankle Internal/External Rotation: ${parseFloat(in_ex_rotation).toFixed(0)}°`);
        }
        if (hasOrientation) {
            plainDetails.push(getVerboseOrientation(orientation, 'plain'));
            medicalDetails.push(getVerboseOrientation(orientation, 'medical'));
        }
        if (hasAnkleOrientation) {
          if (orientation_sagittal && orientation_sagittal !== DEFAULT_ANKLE_SAGITTAL) { medicalDetails.push(getVerboseOrientation(orientation_sagittal, 'medical', true, 'sagittal')); }
          if (orientation_frontal && orientation_frontal !== DEFAULT_ANKLE_FRONTAL) { medicalDetails.push(getVerboseOrientation(orientation_frontal, 'medical', true, 'frontal')); }
          if (orientation_transverse && orientation_transverse !== DEFAULT_ANKLE_TRANSVERSE) { medicalDetails.push(getVerboseOrientation(orientation_transverse, 'medical', true, 'transverse')); }
        }
        if (hasIntent) {
            plainDetails.push(`with intent: ${getVerboseIntent(intent, 'plain')}`);
            medicalDetails.push(`Kinetic Intent: ${getVerboseIntent(intent, 'medical')}`);
        }
        
        plainEnglishLines.push(`  - ${getVerboseJointName(jointAbbrev, 'plain')}: ${plainDetails.join(', ')}.`);
        medicalLines.push(`  * ${getVerboseJointName(jointAbbrev, 'medical')} (${jointAbbrev}): ${medicalDetails.join('; ')}.`);
      }
    });
  }

  if (!hasMeaningfulData) {
    plainEnglishLines.push("• Neutral State: No specific actions defined.");
    medicalLines.push("• Biomechanical State: Assumed neutral; no specific parameters defined.");
  }

  return {
    shorthand: shorthandParts.join(' | ').trim(),
    plainEnglish: plainEnglishLines.join('\n').trim(),
    analysis: medicalLines.join('\n').trim(),
  };
};
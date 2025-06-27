import { getSoundNameFromPath } from './sounds';
import {
  DEFAULT_ANKLE_SAGITTAL, DEFAULT_ANKLE_FRONTAL, DEFAULT_ANKLE_TRANSVERSE,
  DEFAULT_JOINT_ENERGY, DEFAULT_GENERAL_ORIENTATION, DEFAULT_INTENT,
  POSE_DEFAULT_VECTOR
} from './constants';

import {
  JOINT_VERBOSE_MAP,
  getVerboseJointName,
  getVerboseOrientation,
  getVerboseIntent,
  getVerboseHeadOverTarget,
  GROUNDING_POINT_VERBOSE_MAP
} from './notationMaps';

// --- Helper Function for Grounding Description ---
const describeGroundingForSideDetail = (sideAbbrev, groundingPointsInput, type = 'plain') => {
  const fullSideNamePlain = sideAbbrev === 'L' ? 'Left Foot' : 'Right Foot';
  const fullSideNameMedical = sideAbbrev === 'L' ? 'Left Pes' : 'Right Pes';

  if (!groundingPointsInput || (Array.isArray(groundingPointsInput) && groundingPointsInput.length === 0)) {
    return type === 'plain' ? `${fullSideNamePlain} lifted` : `${fullSideNameMedical} non-weight bearing / swing phase`;
  }

  const pointsToProcess = Array.isArray(groundingPointsInput) ? groundingPointsInput : [groundingPointsInput];
  const pointDescriptions = pointsToProcess.map(pointKey => {
    return GROUNDING_POINT_VERBOSE_MAP[pointKey]?.[type] || pointKey;
  });

  if (pointDescriptions.length === 0) {
    return type === 'plain' ? `${fullSideNamePlain} state unclear` : `${fullSideNameMedical} contact undetermined`;
  }

  const combinedDesc = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(pointDescriptions);
  const basePhrase = type === 'plain' ? fullSideNamePlain : fullSideNameMedical;
  return `${basePhrase}: ${combinedDesc}${type === 'plain' ? ' contacting ground' : ' in ground contact phase'}.`;
};

// --- Helper Function for Vector Description ---
const describeVectorMovement = (vector, type = 'plain') => {
  const safeVector = (vector && typeof vector === 'object') ? vector : POSE_DEFAULT_VECTOR;
  const x = typeof safeVector.x === 'number' ? safeVector.x : 0;
  const y = typeof safeVector.y === 'number' ? safeVector.y : 0;
  const z = typeof safeVector.z === 'number' ? safeVector.z : 0;

  const descriptions = [];
  const medicalTerm = type === 'medical' ? 'Displacement' : 'by';

  if (x > 0.05) descriptions.push(`Leftward ${medicalTerm} ${x.toFixed(1)}`);
  else if (x < -0.05) descriptions.push(`Rightward ${medicalTerm} ${Math.abs(x).toFixed(1)}`);

  if (y > 0.05) descriptions.push(`Upward ${medicalTerm} ${y.toFixed(1)}`);
  else if (y < -0.05) descriptions.push(`Downward ${medicalTerm} ${Math.abs(y).toFixed(1)}`);

  if (z > 0.05) descriptions.push(`Forward ${medicalTerm} ${z.toFixed(1)}`);
  else if (z < -0.05) descriptions.push(`Backward ${medicalTerm} ${Math.abs(z).toFixed(1)}`);

  if (descriptions.length === 0) {
    return type === 'plain' ? "No significant movement" : "Position maintained";
  }

  return descriptions.join(type === 'plain' ? ', ' : '; ');
};


// --- Main Notation Generation Function ---
export const generateNotationForBeat = (barNum, beatIdxInBar, currentBeatData, currentTimecodeParts) => {
  // Safeguard: Ensure currentTimecodeParts is an object before destructuring
  const { mm = '00', ss = '00', cs = '00' } = currentTimecodeParts || {};
  const timeStr = `${mm}:${ss}:${cs}`;

  const beatDisplayNum = beatIdxInBar + 1;
  const barDisplayNum = (currentBeatData?.barNumber ?? barNum) + 1;

  if (!currentBeatData || typeof currentBeatData.id !== 'number') {
    return {
      shorthand: `B${barDisplayNum}:S${beatDisplayNum} @${timeStr} | No Data`,
      plainEnglish: `Bar ${barDisplayNum}, Beat ${beatDisplayNum}: No data available for this step.`,
      analysis: `Bar ${barDisplayNum}, Beat ${beatDisplayNum}: Biomechanical state unknown due to missing data.`
    };
  }

  let shorthandParts = [`B${barDisplayNum}:S${beatDisplayNum}`, `@${timeStr}`];
  let plainEnglishLines = [`Bar ${barDisplayNum}, Beat ${beatDisplayNum} (${timeStr}):`];
  let medicalLines = [`Bar ${barDisplayNum}, Beat ${beatDisplayNum} (${timeStr}) - Medical/Scientific Analysis:`];
  let hasMeaningfulData = false;

  // Syllable
  if (currentBeatData.syllable?.trim()) {
    shorthandParts.push(`SYL(${currentBeatData.syllable.substring(0, 10).replace(/[|()\[\]{};]/g, '')})`);
    plainEnglishLines.push(`• Vocal Cue: "${currentBeatData.syllable}".`);
    medicalLines.push(`• Annotation/Syllable: "${currentBeatData.syllable}".`);
    hasMeaningfulData = true;
  }

  // Head Over
  if (currentBeatData.headOver && currentBeatData.headOver !== 'None') {
    shorthandParts.push(`HO(${currentBeatData.headOver})`);
    plainEnglishLines.push(`• Head aligned over ${getVerboseHeadOverTarget(currentBeatData.headOver, 'plain')}.`);
    medicalLines.push(`• Cephalic Alignment: Relative to ${getVerboseHeadOverTarget(currentBeatData.headOver, 'medical')} (Ref: ${currentBeatData.headOver}).`);
    hasMeaningfulData = true;
  }

  // Sounds
  if (currentBeatData.sounds?.length > 0) {
    const soundNames = currentBeatData.sounds.map(getSoundNameFromPath);
    shorthandParts.push(`SND(${soundNames.map(s => s.substring(0, 4)).join(',')})`);
    plainEnglishLines.push(`• Sounds: ${soundNames.join(', ')}.`);
    medicalLines.push(`• Auditory Events: Triggered [${soundNames.join(', ')}].`);
    hasMeaningfulData = true;
  }

  // Grounding & Weight
  const groundingData = currentBeatData.grounding || {};
  const { L: groundL, R: groundR, L_weight } = groundingData;
  const hasGrounding = (Array.isArray(groundL) && groundL.length > 0) || (Array.isArray(groundR) && groundR.length > 0);
  if (hasGrounding) {
    hasMeaningfulData = true;
    const lPlain = describeGroundingForSideDetail('L', groundL, 'plain');
    if (!lPlain.includes("lifted")) {
      plainEnglishLines.push(`• ${lPlain}`);
      medicalLines.push(`• ${describeGroundingForSideDetail('L', groundL, 'medical')}`);
    }
    const rPlain = describeGroundingForSideDetail('R', groundR, 'plain');
    if (!rPlain.includes("lifted")) {
      plainEnglishLines.push(`• ${rPlain}`);
      medicalLines.push(`• ${describeGroundingForSideDetail('R', groundR, 'medical')}`);
    }
    const lWeight = L_weight ?? 50;
    plainEnglishLines.push(`• Weight Distribution: ${lWeight}% Left / ${100 - lWeight}% Right.`);
    medicalLines.push(`• Load Distribution: ${lWeight}% Left Pes / ${100 - lWeight}% Right Pes.`);
  }

  // Joint Info
  const jointInfo = currentBeatData.jointInfo || {};
  const jointEntries = Object.entries(jointInfo);
  if (jointEntries.length > 0) {
    let jointSectionStartedPlain = false;
    let jointSectionStartedMedical = false;

    jointEntries.forEach(([jointAbbrev, details]) => {
      if (!details || typeof details !== 'object') return;

      const {
        vector, rotation, orientation,
        orientation_sagittal, orientation_frontal, orientation_transverse,
        intent, energy
      } = details;
      
      const safeVector = (vector && typeof vector === 'object') ? vector : POSE_DEFAULT_VECTOR;
      
      const hasVector = safeVector.x !== 0 || safeVector.y !== 0 || safeVector.z !== 0;
      const hasRotation = rotation !== undefined && parseFloat(rotation) !== 0;
      const hasOrientation = orientation && orientation !== DEFAULT_GENERAL_ORIENTATION;
      const hasAnkleOrientation = (orientation_sagittal && orientation_sagittal !== DEFAULT_ANKLE_SAGITTAL) || (orientation_frontal && orientation_frontal !== DEFAULT_ANKLE_FRONTAL) || (orientation_transverse && orientation_transverse !== DEFAULT_ANKLE_TRANSVERSE);
      const hasIntent = intent && intent !== DEFAULT_INTENT;
      const hasEnergy = energy !== undefined && parseFloat(energy) !== DEFAULT_JOINT_ENERGY;

      if (hasVector || hasRotation || hasOrientation || hasAnkleOrientation || hasIntent || hasEnergy) {
        hasMeaningfulData = true;
        if (!jointSectionStartedPlain) { plainEnglishLines.push(`• Joint Actions:`); jointSectionStartedPlain = true; }
        if (!jointSectionStartedMedical) { medicalLines.push(`• Joint Kinematics:`); jointSectionStartedMedical = true; }

        let plainDetails = [];
        let medicalDetails = [];
        
        if (hasOrientation) {
            plainDetails.push(getVerboseOrientation(orientation, 'plain'));
            medicalDetails.push(getVerboseOrientation(orientation, 'medical'));
        }
        if(hasAnkleOrientation) { /* Add ankle details if needed */ }
        if (hasRotation) {
            plainDetails.push(`rotated ${parseFloat(rotation).toFixed(0)}°`);
            medicalDetails.push(`Angular Displacement: ${parseFloat(rotation).toFixed(0)}°`);
        }
        if (hasVector) {
            plainDetails.push(describeVectorMovement(safeVector, 'plain'));
            medicalDetails.push(describeVectorMovement(safeVector, 'medical'));
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

  // Fallback Message
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
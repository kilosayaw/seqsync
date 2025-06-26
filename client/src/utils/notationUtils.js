// src/utils/notationUtils.js
import { getSoundNameFromPath } from './sounds';
import {
  DEFAULT_ANKLE_SAGITTAL, DEFAULT_ANKLE_FRONTAL, DEFAULT_ANKLE_TRANSVERSE,
  DEFAULT_JOINT_ENERGY, DEFAULT_GENERAL_ORIENTATION, DEFAULT_INTENT,
} from './constants'; // Existing POSEQr defaults
import {
  JOINT_VERBOSE_MAP, 
  ORIENTATION_VERBOSE_MAP, // EXPORTED
  ANKLE_SAGITTAL_VERBOSE_MAP, // EXPORTED
  ANKLE_FRONTAL_VERBOSE_MAP, // EXPORTED
  ANKLE_TRANSVERSE_VERBOSE_MAP, // EXPORTED
  INTENT_VERBOSE_MAP, // EXPORTED
  GROUNDING_POINT_VERBOSE_MAP, // EXPORTED
  VECTOR_PRIMARY_DIRECTION_MAP, 
  HEAD_OVER_VERBOSE_MAP, // EXPORTED
  // Helpers from notationMaps.js
  getVerboseJointName, // EXPORTED
  getVerboseOrientation, // EXPORTED
  getVerboseIntent, // EXPORTED
  getVerboseHeadOverTarget // EXPORTED
} from './notationMaps';

// --- Helper Function for Grounding Description ---
// pointsInput can be an array like ['1', 'T1', 'T2'] or a direct key like 'LF123T12345'
const describeGroundingForSide = (sidePrefix, pointsInput, type = 'plain') => {
  if (!pointsInput) return type === 'plain' ? "lifted" : "non-weight bearing / swing phase";
  
  // Check for direct mapping of a complex key first (e.g., "LF123T12345")
  if (typeof pointsInput === 'string' && GROUNDING_POINT_VERBOSE_MAP[pointsInput]) {
    return GROUNDING_POINT_VERBOSE_MAP[pointsInput]?.[type] || pointsInput;
  }
  // Also check with side prefix if the input doesn't have it (e.g. "123T12345" coming from joystick)
  if (typeof pointsInput === 'string' && GROUNDING_POINT_VERBOSE_MAP[`${sidePrefix}${pointsInput}`]) {
      return GROUNDING_POINT_VERBOSE_MAP[`${sidePrefix}${pointsInput}`]?.[type] || pointsInput;
  }


  const pointsArray = Array.isArray(pointsInput) ? pointsInput : (typeof pointsInput === 'string' ? pointsInput.match(/[A-Z]*[1-5]/g) || [pointsInput] : [String(pointsInput)]);
  // Example: "1", "2", "3", "T1", "T2", "T3", "T4", "T5", "HEEL" (if HEEL is a point)
  // Your image uses LF1, LF2, LF3, LFT1 etc. So, the keys in GROUNDING_POINT_VERBOSE_MAP should match those.
  // If pointsInput from songData is just ["1", "T1"], we need to prefix with side.

  if (pointsArray.length === 0 || (pointsArray.length === 1 && !pointsArray[0])) {
    return type === 'plain' ? "lifted" : "non-weight bearing / swing phase";
  }

  let describedPoints = pointsArray.map(p => {
    const fullKey = p.startsWith('L') || p.startsWith('R') ? p : `${sidePrefix}${p}`; // Add side prefix if not present
    return GROUNDING_POINT_VERBOSE_MAP[fullKey]?.[type] || p; // Fallback to point itself
  }).filter(Boolean);

  if (describedPoints.length === 0) return type === 'plain' ? "lifted" : "non-weight bearing / swing phase";
  
  // Refine joining logic for natural language
  let description = "";
  if (describedPoints.length === 1) {
    description = describedPoints[0];
  } else if (describedPoints.length === 2) {
    description = `${describedPoints[0]} and ${describedPoints[1]}`;
  } else {
    description = `${describedPoints.slice(0, -1).join(', ')}, and ${describedPoints.slice(-1)}`;
  }
  
  return type === 'plain' ? `${description} making contact` : `${description} in ground contact`;
};


// --- Helper Function for Vector Description ---
const describeVector = (vector, type = 'plain') => {
  if (!vector || (vector.x === 0 && vector.y === 0 && vector.z === 0)) {
    return null; // No movement description needed
  }
  const { x, y, z } = vector;
  let plainParts = [];
  let medicalParts = []; // For a more structured medical vector description

  const threshold = 0.1; // To ignore very minor values unless they are the only ones

  // X-axis (Left/Right in POSEQr's typical coordinate system from images)
  if (Math.abs(x) >= threshold) {
    plainParts.push(x > 0 ? VECTOR_PRIMARY_DIRECTION_MAP.X_POS.plain : VECTOR_PRIMARY_DIRECTION_MAP.X_NEG.plain); // Page 6: X=1 is LEFT
    medicalParts.push(`X: ${x.toFixed(2)} (${x > 0 ? "Leftward" : "Rightward"})`);
  }
  // Y-axis (Up/Down)
  if (Math.abs(y) >= threshold) {
    plainParts.push(y > 0 ? VECTOR_PRIMARY_DIRECTION_MAP.Y_POS.plain : VECTOR_PRIMARY_DIRECTION_MAP.Y_NEG.plain);
    medicalParts.push(`Y: ${y.toFixed(2)} (${y > 0 ? "Superior" : "Inferior"})`);
  }
  // Z-axis (Forward/Backward)
  if (Math.abs(z) >= threshold) {
    plainParts.push(z > 0 ? VECTOR_PRIMARY_DIRECTION_MAP.Z_POS.plain : VECTOR_PRIMARY_DIRECTION_MAP.Z_NEG.plain); // Page 6: Z=1 is FORWARD
    medicalParts.push(`Z: ${z.toFixed(2)} (${z > 0 ? "Forward/Anterior" : "Backward/Posterior"})`);
  }

  if (type === 'plain') {
    if (plainParts.length === 0) return `with slight displacement (${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)})`;
    if (plainParts.length === 1) return `moving ${plainParts[0]}`;
    return `moving ${plainParts.slice(0, -1).join(', ')} and ${plainParts.slice(-1)}`;
  } else { // medical
    if (medicalParts.length === 0 && (x !== 0 || y !== 0 || z !== 0)) return `Displacement Vector: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}] (minor components)`;
    return `Displacement Vector: [${medicalParts.join('; ')}]`;
  }
};

// --- Main Notation Generation Function ---
export const generateNotationForBeat = (barNum, beatIdxInBar, currentBeatData, currentTimecodeParts) => {
  const timeStr = `${currentTimecodeParts.mm || '00'}:${currentTimecodeParts.ss || '00'}:${currentTimecodeParts.cs || '00'}`;
  const beatDisplayNum = beatIdxInBar + 1;
  const barDisplayNum = (currentBeatData?.barNumber !== undefined ? currentBeatData.barNumber : barNum) + 1;


  if (!currentBeatData || typeof currentBeatData.id !== 'number') {
    const barNumForDisplay = barNum +1; // Ensure barNum is 1-indexed if currentBeatData is totally invalid
    return {
      shorthand: `B${barNumForDisplay}:S${beatDisplayNum} @${timeStr} | No Valid Beat Data`,
      plainEnglish: `Bar ${barNumForDisplay}, Beat ${beatDisplayNum} (Time: ${timeStr}): No valid beat data.`,
      analysis: `Bar ${barNumForDisplay}, Beat ${beatDisplayNum} (Time: ${timeStr}): Medical/Scientific: Biomechanical state unknown (invalid beat data).` // Prefixed medical
    };
  }

  let shorthandParts = [`B${barDisplayNum}:S${beatDisplayNum}`, `@${timeStr}`];
  let plainEnglishLines = [`Bar ${barDisplayNum}, Beat ${beatDisplayNum} (${timeStr}):`];
  let medicalLines = [`Bar ${barDisplayNum}, Beat ${beatDisplayNum} (${timeStr}) - Medical/Scientific:`];
  let hasMeaningfulData = false;

  // Syllable
  if (currentBeatData.syllable && currentBeatData.syllable.trim() !== '') {
    shorthandParts.push(`SYL(${currentBeatData.syllable.substring(0, 10).replace(/[|()\[\]]/g, '')})`);
    plainEnglishLines.push(`  - Vocal Cue: "${currentBeatData.syllable}".`);
    medicalLines.push(`  - Annotation/Syllable: "${currentBeatData.syllable}".`);
    hasMeaningfulData = true;
  }

  // Head Over
  if (currentBeatData.headOver && currentBeatData.headOver !== 'None') {
    shorthandParts.push(`HO(${currentBeatData.headOver})`);
    const targetPlain = getVerboseHeadOverTarget(currentBeatData.headOver, 'plain');
    const targetMedical = getVerboseHeadOverTarget(currentBeatData.headOver, 'medical');
    plainEnglishLines.push(`  - Head aligned over ${targetPlain}.`);
    medicalLines.push(`  - Cephalic Alignment: Relative to ${targetMedical} (Ref: ${currentBeatData.headOver}).`);
    hasMeaningfulData = true;
  }

  // Sounds
  if (currentBeatData.sounds && Array.isArray(currentBeatData.sounds) && currentBeatData.sounds.length > 0) {
    const soundNamesForShorthand = currentBeatData.sounds.map(key => getSoundNameFromPath(key).substring(0, 4)).join(',');
    shorthandParts.push(`SND(${soundNamesForShorthand})`);
    plainEnglishLines.push(`  - Sounds: ${currentBeatData.sounds.map(getSoundNameFromPath).join(', ')}.`);
    medicalLines.push(`  - Auditory Events: Triggers [${currentBeatData.sounds.map(getSoundNameFromPath).join(', ')}].`);
    hasMeaningfulData = true;
  }

  // Grounding & Weight Distribution
  const groundingData = currentBeatData.grounding || {};
  const { L: groundLPoints, R: groundRPoints, L_weight } = groundingData;
  let groundingShorthandParts = [];

  const lPlainDesc = describeGroundingForSide('L', groundLPoints, 'plain');
  if (lPlainDesc && lPlainDesc !== "lifted") {
    plainEnglishLines.push(`  - ${getVerboseJointName('LF', 'plain')}: ${lPlainDesc}.`);
    medicalLines.push(`  - ${getVerboseJointName('LF', 'medical')}: ${describeGroundingForSide('L', groundLPoints, 'medical')}.`);
    groundingShorthandParts.push(`L:${Array.isArray(groundLPoints) ? groundLPoints.join('+') : groundLPoints || 'LIFT'}`);
    hasMeaningfulData = true;
  }

  const rPlainDesc = describeGroundingForSide('R', groundRPoints, 'plain');
  if (rPlainDesc && rPlainDesc !== "lifted") {
    plainEnglishLines.push(`  - ${getVerboseJointName('RF', 'plain')}: ${rPlainDesc}.`);
    medicalLines.push(`  - ${getVerboseJointName('RF', 'medical')}: ${describeGroundingForSide('R', groundRPoints, 'medical')}.`);
    groundingShorthandParts.push(`R:${Array.isArray(groundRPoints) ? groundRPoints.join('+') : groundRPoints || 'LIFT'}`);
    hasMeaningfulData = true;
  }
  
  const currentLWeight = (L_weight === undefined || L_weight === null) ? 50 : parseInt(L_weight, 10);
  if ((groundLPoints || groundRPoints) && (currentLWeight !== 50 || (groundLPoints && groundRPoints))) { // Show weight if not default 50/50 AND there's some grounding
      const currentRWeight = 100 - currentLWeight;
      groundingShorthandParts.push(`W:${currentLWeight}L`);
      plainEnglishLines.push(`  - Weight: ${currentLWeight}% Left / ${currentRWeight}% Right.`);
      medicalLines.push(`  - Load Distribution: ${currentLWeight}% Left / ${currentRWeight}% Right.`);
      hasMeaningfulData = true;
  }
  if (groundingShorthandParts.length > 0) {
    shorthandParts.push(`GRN(${groundingShorthandParts.join(';')})`);
  } else if (groundingData && Object.keys(groundingData).length > 0 && !hasMeaningfulData){ // If grounding object exists but resulted in no specific points, it implies general lift
    plainEnglishLines.push(`  - Feet: Both likely lifted or in transition.`);
    medicalLines.push(`  - Lower Extremity: Non-weight bearing / Swing phase indicated.`);
  }


  // Joint Info
  const jointInfo = currentBeatData.jointInfo || {};
  if (Object.keys(jointInfo).length > 0) {
    let jointShorthandAgg = [];
    let jointSectionStartedPlain = false;
    let jointSectionStartedMedical = false;

    Object.entries(jointInfo).forEach(([jointAbbrev, details]) => {
      if (!details || typeof details !== 'object' || Object.keys(details).length === 0) return;

      let shorthandDetailParts = [];
      let plainDetailCollector = []; // Store {label, value} pairs for plain English
      let medicalDetailCollector = []; // Store {label, value} pairs for medical
      let hasSpecificDataForThisJoint = false;
      const isAnkle = jointAbbrev.includes('ANK') || jointAbbrev === 'LA' || jointAbbrev === 'RA';

      // Rotation
      if (details.rotation !== undefined && parseFloat(details.rotation) !== 0) {
        const rot = parseFloat(details.rotation).toFixed(0);
        shorthandDetailParts.push(`R:${rot}`);
        plainDetailCollector.push({label: "rotation", value: `${rot}°`});
        medicalDetailCollector.push({label: "Angular Displacement", value: `${rot}°`});
        hasSpecificDataForThisJoint = true;
      }

      // Orientations
      if (isAnkle) {
        if (details.orientation_sagittal && details.orientation_sagittal !== DEFAULT_ANKLE_SAGITTAL) {
          shorthandDetailParts.push(`S:${details.orientation_sagittal.substring(0,3)}`);
          plainDetailCollector.push({label: "sagittal", value: getVerboseOrientation(details.orientation_sagittal, 'plain', true, 'sagittal')});
          medicalDetailCollector.push({label: "Sagittal Plane", value: getVerboseOrientation(details.orientation_sagittal, 'medical', true, 'sagittal')});
          hasSpecificDataForThisJoint = true;
        }
        // ... similar for frontal and transverse ankle orientations ...
         if (details.orientation_frontal && details.orientation_frontal !== DEFAULT_ANKLE_FRONTAL) {
          shorthandDetailParts.push(`F:${details.orientation_frontal.substring(0,3)}`);
          plainDetailCollector.push({label: "frontal", value: getVerboseOrientation(details.orientation_frontal, 'plain', true, 'frontal')});
          medicalDetailCollector.push({label: "Frontal Plane", value: getVerboseOrientation(details.orientation_frontal, 'medical', true, 'frontal')});
          hasSpecificDataForThisJoint = true;
        }
        if (details.orientation_transverse && details.orientation_transverse !== DEFAULT_ANKLE_TRANSVERSE) {
          shorthandDetailParts.push(`T:${details.orientation_transverse.substring(0,3)}`);
          plainDetailCollector.push({label: "transverse", value: getVerboseOrientation(details.orientation_transverse, 'plain', true, 'transverse')});
          medicalDetailCollector.push({label: "Transverse Plane", value: getVerboseOrientation(details.orientation_transverse, 'medical', true, 'transverse')});
          hasSpecificDataForThisJoint = true;
        }
      } else if (details.orientation && details.orientation !== DEFAULT_GENERAL_ORIENTATION) {
        shorthandDetailParts.push(`O:${details.orientation.substring(0,3)}`);
        plainDetailCollector.push({label: "orientation", value: getVerboseOrientation(details.orientation, 'plain')});
        medicalDetailCollector.push({label: "Orientation", value: getVerboseOrientation(details.orientation, 'medical')});
        hasSpecificDataForThisJoint = true;
      }

      // Vector
      const vectorPlainDesc = describeVector(details.vector, 'plain');
      if (vectorPlainDesc) {
        shorthandDetailParts.push(`V(${details.vector.x.toFixed(1)},${details.vector.y.toFixed(1)},${details.vector.z.toFixed(1)})`);
        plainDetailCollector.push({label: "movement", value: vectorPlainDesc}); // "movement" might be too generic
        medicalDetailCollector.push({label: "Displacement", value: describeVector(details.vector, 'medical')});
        hasSpecificDataForThisJoint = true;
      }

      // Intent
      if (details.intent && details.intent !== DEFAULT_INTENT && details.intent.trim() !== '') {
        shorthandDetailParts.push(`I:${details.intent.substring(0,3)}`);
        plainDetailCollector.push({label: "intent", value: getVerboseIntent(details.intent, 'plain')});
        medicalDetailCollector.push({label: "Kinetic Intent", value: getVerboseIntent(details.intent, 'medical')});
        hasSpecificDataForThisJoint = true;
      }

      // Energy
      if (details.energy !== undefined && parseFloat(details.energy) !== DEFAULT_JOINT_ENERGY) {
        const energyVal = parseFloat(details.energy).toFixed(0);
        shorthandDetailParts.push(`E:${energyVal}`);
        plainDetailCollector.push({label: "energy", value: `${energyVal}%`});
        medicalDetailCollector.push({label: "Energy Level", value: `${energyVal}%`});
        hasSpecificDataForThisJoint = true;
      }

      if (hasSpecificDataForThisJoint) {
        hasMeaningfulData = true;
        if (!jointSectionStartedPlain) { plainEnglishLines.push(`  - Joint Actions:`); jointSectionStartedPlain = true; }
        if (!jointSectionStartedMedical) { medicalLines.push(`  - Joint Kinematics/Dynamics:`); jointSectionStartedMedical = true; }

        jointShorthandAgg.push(`${jointAbbrev}[${shorthandDetailParts.join(';')}]`);
        
        const plainActionsString = plainDetailCollector.map(p => p.value).join(', '); // Simpler join
        plainEnglishLines.push(`    - ${getVerboseJointName(jointAbbrev, 'plain')}: ${plainActionsString}.`);
        
        const medicalActionsString = medicalDetailCollector.map(p => `${p.label}: ${p.value}`).join('; ');
        medicalLines.push(`    * ${getVerboseJointName(jointAbbrev, 'medical')} (${jointAbbrev}): ${medicalActionsString}.`);
      }
    });
    if (jointShorthandAgg.length > 0) shorthandParts.push(jointShorthandAgg.join(' '));
  }

  if (!hasMeaningfulData) {
    shorthandParts.push("No Specific Actions Programmed"); // Keep this consistent
    plainEnglishLines.push("  - No specific actions or detailed states defined for this step.");
    medicalLines.push("  - Neutral biomechanical state or no specific data defined for this step.");
  }

  return {
    shorthand: shorthandParts.join(' | ').trim(),
    plainEnglish: plainEnglishLines.join('\n').trim(),
    analysis: medicalLines.join('\n').trim()
  };
};
// SEGSYNC/client/src/utils/notationUtils.js
import { ALL_JOINTS_MAP, getSoundNameFromPath } from './sounds';
// Import default ankle orientations and default energy for comparison
import { 
    DEFAULT_ANKLE_SAGITTAL, 
    DEFAULT_ANKLE_FRONTAL, 
    DEFAULT_ANKLE_TRANSVERSE,
    DEFAULT_JOINT_ENERGY // Ensure this is imported
} from './constants';

export const generateNotationForBeat = (barNum, beatIdxInBar, currentBeatData, currentTimecodeParts) => {
  const timeStr = `${currentTimecodeParts.mm || '00'}:${currentTimecodeParts.ss || '00'}:${currentTimecodeParts.cs || '00'}`;
  const beatDisplayNum = beatIdxInBar + 1;

  if (!currentBeatData || typeof currentBeatData.id !== 'number') {
    return {
      shorthand: `B${barNum}:S${beatDisplayNum} @${timeStr} | No Valid Beat Data`,
      plainEnglish: `At Bar ${barNum}, Beat ${beatDisplayNum} (Time: ${timeStr}): No valid beat data object found.`,
      analysis: `Bar ${barNum}, Beat ${beatDisplayNum} (Time: ${timeStr}): Biomechanical state unknown (invalid beat data).`
    };
  }

  let shorthandParts = [`B${barNum}:S${beatDisplayNum}`, `@${timeStr}`];
  let plainEnglishParts = [`At Bar ${barNum}, Beat ${beatDisplayNum} (Time: ${timeStr}):`];
  let analysisParts = [`Biomechanical Analysis for Bar ${barNum}, Beat ${beatDisplayNum} (Timestamp: ${timeStr}):`];
  let hasMeaningfulData = false;

  // Syllable
  if (currentBeatData.syllable && currentBeatData.syllable.trim() !== '') {
    shorthandParts.push(`SYL(${currentBeatData.syllable.substring(0, 10).replace(/[|()\[\]]/g, '')})`);
    plainEnglishParts.push(`  - Vocal Cue: "${currentBeatData.syllable}".`);
    analysisParts.push(`  - Annotation/Syllable: "${currentBeatData.syllable}".`);
    hasMeaningfulData = true;
  }

  // Head Over
  if (currentBeatData.headOver && currentBeatData.headOver !== 'None') {
    const targetName = currentBeatData.headOver === 'CENTER'
      ? 'Center of Mass/Base'
      : (ALL_JOINTS_MAP[currentBeatData.headOver]?.name || currentBeatData.headOver); // Added .name here
    shorthandParts.push(`HO(${currentBeatData.headOver})`);
    plainEnglishParts.push(`  - Head Alignment: Over ${targetName}.`);
    analysisParts.push(`  - Head Position: Aligned over ${targetName} (Ref: ${currentBeatData.headOver}).`);
    hasMeaningfulData = true;
  }

  // Sounds
  if (currentBeatData.sounds && Array.isArray(currentBeatData.sounds) && currentBeatData.sounds.length > 0) {
    const soundNamesForShorthand = currentBeatData.sounds.map(key => getSoundNameFromPath(key).substring(0, 4)).join(',');
    shorthandParts.push(`SND(${soundNamesForShorthand})`);
    plainEnglishParts.push(`  - Sounds Triggered: ${currentBeatData.sounds.map(getSoundNameFromPath).join(', ')}.`);
    analysisParts.push(`  - Auditory Events: Sounds [${currentBeatData.sounds.join(', ')}] triggered.`);
    hasMeaningfulData = true;
  }

  // Grounding & Weight Distribution
  const groundingData = currentBeatData.grounding || {};
  const { L: groundL, R: groundR, L_weight } = groundingData;
  if ((groundL && groundL.length > 0) || (groundR && groundR.length > 0)) {
    let groundShorthand = "GRN(";
    let groundPlain = "  - Grounding: ";
    let groundAnalysis = "  - Ground Contact: ";
    const formatGroundPoints = (points) => Array.isArray(points) ? points.join('+') : (points || 'None');

    if (groundL && groundL.length > 0) { groundShorthand += `L:${formatGroundPoints(groundL)}`; groundPlain += `Left Foot on ${formatGroundPoints(groundL)}`; groundAnalysis += `Left=${formatGroundPoints(groundL)}`; }
    if ((groundL && groundL.length > 0) && (groundR && groundR.length > 0)) { groundShorthand += ","; groundPlain += ", "; groundAnalysis += ", "; }
    if (groundR && groundR.length > 0) { groundShorthand += `R:${formatGroundPoints(groundR)}`; groundPlain += `Right Foot on ${formatGroundPoints(groundR)}`; groundAnalysis += `Right=${formatGroundPoints(groundR)}`; }

    const currentLWeight = (L_weight === undefined || L_weight === null) ? 50 : L_weight;
    if (currentLWeight !== 50 || ((groundL && groundL.length > 0) && (groundR && groundR.length > 0))) {
      const currentRWeight = 100 - currentLWeight;
      groundShorthand += ` W:${currentLWeight}L`;
      groundPlain += ` (Weight: ${currentLWeight}% L / ${currentRWeight}% R)`;
      groundAnalysis += ` | Weight: ${currentLWeight}%L ${currentRWeight}%R`;
    }
    groundShorthand += ")";
    shorthandParts.push(groundShorthand);
    plainEnglishParts.push(groundPlain + ".");
    analysisParts.push(groundAnalysis + ".");
    hasMeaningfulData = true;
  }

  // Joint Info
  const jointInfo = currentBeatData.jointInfo || {};
  if (Object.keys(jointInfo).length > 0) {
    let jointShorthandAgg = [];
    let jointDataFoundForPlainEnglishThisBeat = false;

    Object.entries(jointInfo).forEach(([jointAbbrev, details]) => {
      if (details && typeof details === 'object' && Object.keys(details).length > 0) {
        const jointFullName = ALL_JOINTS_MAP[jointAbbrev]?.name || jointAbbrev; // Added .name
        let detailPartsShorthand = [];
        let detailPartsPlain = [];
        let detailPartsAnalysis = [];
        let hasSpecificDataForThisJoint = false;
        const isAnkle = jointAbbrev.includes('ANK');

        const rotationVal = parseFloat(details.rotation);
        if (!isNaN(rotationVal) && rotationVal !== 0) {
          const rot = rotationVal.toFixed(0);
          detailPartsShorthand.push(`R:${rot}`); detailPartsPlain.push(`rotation ${rot}°`); detailPartsAnalysis.push(`Rot=${rot}°`);
          hasSpecificDataForThisJoint = true;
        }

        if (isAnkle) {
            if (details.orientation_sagittal && details.orientation_sagittal !== DEFAULT_ANKLE_SAGITTAL) {
              detailPartsShorthand.push(`S:${details.orientation_sagittal.substring(0,3)}`); detailPartsPlain.push(`sagittal ${details.orientation_sagittal}`); detailPartsAnalysis.push(`Sag=${details.orientation_sagittal}`);
              hasSpecificDataForThisJoint = true;
            }
            if (details.orientation_frontal && details.orientation_frontal !== DEFAULT_ANKLE_FRONTAL) {
              detailPartsShorthand.push(`F:${details.orientation_frontal.substring(0,3)}`); detailPartsPlain.push(`frontal ${details.orientation_frontal}`); detailPartsAnalysis.push(`Fro=${details.orientation_frontal}`);
              hasSpecificDataForThisJoint = true;
            }
            if (details.orientation_transverse && details.orientation_transverse !== DEFAULT_ANKLE_TRANSVERSE) {
              detailPartsShorthand.push(`T:${details.orientation_transverse.substring(0,3)}`); detailPartsPlain.push(`transverse ${details.orientation_transverse}`); detailPartsAnalysis.push(`Tra=${details.orientation_transverse}`);
              hasSpecificDataForThisJoint = true;
            }
        } else { 
            if (details.orientation && details.orientation !== 'NEU') {
              detailPartsShorthand.push(`O:${details.orientation.substring(0, 3)}`); detailPartsPlain.push(`orientation ${details.orientation}`); detailPartsAnalysis.push(`Orient=${details.orientation}`);
              hasSpecificDataForThisJoint = true;
            }
        }

        if (details.vector && (details.vector.x !== 0 || details.vector.y !== 0 || details.vector.z !== 0)) {
          detailPartsShorthand.push(`V(${details.vector.x},${details.vector.y},${details.vector.z})`); detailPartsPlain.push(`vector (${details.vector.x},${details.vector.y},${details.vector.z})`); detailPartsAnalysis.push(`Vec=[X:${details.vector.x},Y:${details.vector.y},Z:${details.vector.z}]`);
          hasSpecificDataForThisJoint = true;
        }
        if (details.intent && details.intent !== 'Neutral' && details.intent.trim() !== '') {
          detailPartsShorthand.push(`I:${details.intent.substring(0, 3)}`); detailPartsPlain.push(`intent '${details.intent}'`); detailPartsAnalysis.push(`Intent=${details.intent}`);
          hasSpecificDataForThisJoint = true;
        }
        
        // *** CORRECTED ENERGY CHECK ***
        if (details.energy !== undefined && parseFloat(details.energy) !== DEFAULT_JOINT_ENERGY) {
          const energyVal = parseFloat(details.energy).toFixed(0);
          detailPartsShorthand.push(`E:${energyVal}`); 
          detailPartsPlain.push(`energy ${energyVal}%`); 
          detailPartsAnalysis.push(`Energy=${energyVal}%`);
          hasSpecificDataForThisJoint = true;
        }

        if (hasSpecificDataForThisJoint) {
          hasMeaningfulData = true;
          if (!jointDataFoundForPlainEnglishThisBeat) {
            plainEnglishParts.push(`  - Joint States:`);
            analysisParts.push(`  - Active Kinematics & Dynamics:`);
            jointDataFoundForPlainEnglishThisBeat = true;
          }
          jointShorthandAgg.push(`${jointAbbrev}[${detailPartsShorthand.join(';')}]`);
          plainEnglishParts.push(`    - ${jointFullName}: ${detailPartsPlain.join(', ')}.`);
          analysisParts.push(`    * ${jointFullName} (${jointAbbrev}): ${detailPartsAnalysis.join('; ')}.`);
        }
      }
    });
    if (jointShorthandAgg.length > 0) shorthandParts.push(jointShorthandAgg.join(' '));
  }

  if (!hasMeaningfulData) {
    shorthandParts.push("No Significant Data Programmed");
    plainEnglishParts.push("  - No specific actions, sounds, grounding, or joint states programmed for this beat step.");
    analysisParts.push("  - Neutral biomechanical state or no specific data defined by user for this step.");
  }

  return {
    shorthand: shorthandParts.join(' | ').trim(),
    plainEnglish: plainEnglishParts.join('\n').trim(),
    analysis: analysisParts.join('\n').trim()
  };
};
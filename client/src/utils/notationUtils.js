// /client/src/utils/notationUtils.js
import {
  JOINT_VERBOSE_MAP,
  ORIENTATION_VERBOSE_MAP,
  GROUNDING_POINT_VERBOSE_MAP,
} from './notationMaps.js';
import { getRotationalAccessFromGrounding } from './biomechanics.js';

// --- HELPER FUNCTIONS ---

const formatBarBeat = (bar, beat) => `(B${String(bar + 1).padStart(2,'0')}:S${String(beat + 1).padStart(2,'0')})`;

const getPlainGroundingDesc = (grounding = {}) => {
    const parts = [];
    if (grounding.L) parts.push(GROUNDING_POINT_VERBOSE_MAP[grounding.L]?.plain || grounding.L);
    if (grounding.R) parts.push(GROUNDING_POINT_VERBOSE_MAP[grounding.R]?.plain || grounding.R);

    if (parts.length > 0) {
        const weight = grounding.L_weight !== undefined ? grounding.L_weight : 50;
        let weightDesc = ` with a ${weight}/${100 - weight} L/R weight distribution.`;
        return `Grounded ${parts.join(' and ')}${weightDesc}`;
    }
    return "In air / Both feet lifted.";
};

const getAnalysisGroundingDesc = (grounding = {}) => {
    const parts = [];
    if (grounding.L) {
        const leftAccess = getRotationalAccessFromGrounding(grounding.L);
        parts.push(`L-Foot: ${leftAccess.type}`);
    }
    if (grounding.R) {
        const rightAccess = getRotationalAccessFromGrounding(grounding.R);
        parts.push(`R-Foot: ${rightAccess.type}`);
    }
    if (parts.length > 0) {
        return parts.join(' | ');
    }
    return "No Grounding Contact (Aerial).";
};

const getJointShorthand = (abbrev, jointData) => {
    if (!jointData) return null;
    const parts = [abbrev];
    if (jointData.orientation && jointData.orientation !== 'NEU') parts.push(jointData.orientation);
    
    const { x, y, z } = jointData.vector || {};
    if (x || y || z) {
        parts.push(`(${(x || 0).toFixed(2)},${(y || 0).toFixed(2)},${(z || 0).toFixed(2)})`);
    }
    
    return parts.length > 1 ? parts.join(' ') : null;
};


// --- MAIN EXPORTED FUNCTION ---

export const generateNotationForBeat = (bar, beat, beatData) => {
    // 1. Handle cases with no data
    if (!beatData || !beatData.pose) {
        return {
            shorthand: `Bar ${bar + 1} | Beat ${beat + 1}`,
            plainEnglish: "No pose data for this beat.",
            analysis: "No kinematic data available."
        };
    }

    const { jointInfo = {}, grounding = {} } = beatData.pose;
    
    // 2. Generate Shorthand Notation
    const timePart = formatBarBeat(bar, beat);
    const jointShorthandParts = Object.entries(jointInfo)
        .map(([abbrev, data]) => getJointShorthand(abbrev, data))
        .filter(Boolean); // Remove null entries for joints with no data

    const finalShorthand = jointShorthandParts.length > 0 
        ? `${timePart} | ${jointShorthandParts.join('; ')}`
        : timePart;

    // 3. Generate Plain English Description
    const finalPlainEnglish = getPlainGroundingDesc(grounding);

    // 4. Generate Biomechanical Analysis
    const finalAnalysis = getAnalysisGroundingDesc(grounding);

    // 5. Return the complete object
    return {
        shorthand: finalShorthand,
        plainEnglish: finalPlainEnglish,
        analysis: finalAnalysis,
    };
};
// /client/src/utils/notationUtils.js
import {
  JOINT_VERBOSE_MAP,
  ORIENTATION_VERBOSE_MAP,
  GROUNDING_POINT_VERBOSE_MAP,
} from './notationMaps.js'; // Use your .js file

const formatTime = (timecode) => {
    if (!timecode) return '00:00:000';
    const mm = String(timecode.mm).padStart(2, '0');
    const ss = String(timecode.ss).padStart(2, '0');
    const cs = String(timecode.cs).padStart(3, '0');
    return `${mm}:${ss}:${cs}`;
};

const formatBarBeat = (bar, beat) => `${String(bar + 1).padStart(2, '0')}:${String(beat + 1).padStart(2, '0')}`;

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
    if (grounding.L) parts.push(`L. BoS: ${GROUNDING_POINT_VERBOSE_MAP[grounding.L]?.medical || grounding.L}`);
    if (grounding.R) parts.push(`R. BoS: ${GROUNDING_POINT_VERBOSE_MAP[grounding.R]?.medical || grounding.R}`);
    if (parts.length > 0) {
        const weight = grounding.L_weight !== undefined ? grounding.L_weight : 50;
        return `${parts.join(' | ')}. Load Dist: ${weight}% L / ${100 - weight}% R.`;
    }
    return "No Grounding Contact (Aerial).";
};

const getJointShorthand = (abbrev, jointData) => {
    if (!jointData) return null;
    const parts = [abbrev];
    if (jointData.orientation && jointData.orientation !== 'NEU') parts.push(jointData.orientation);
    
    const { x, y, z } = jointData.vector || {};
    if (x || y || z) parts.push(`(${x?.toFixed(2) || 0},${y?.toFixed(2) || 0},${z?.toFixed(2) || 0})`);
    
    return parts.length > 1 ? parts.join(' ') : null;
};

export const generateNotationForBeat = (bar, beat, beatData, timecode) => {
    if (!beatData || !beatData.pose) {
        return {
            shorthand: `Bar ${bar + 1} | Beat ${beat + 1}`,
            plainEnglish: "No pose data for this beat.",
            analysis: "No kinematic data available."
        };
    }

    const { jointInfo = {}, grounding = {} } = beatData.pose;
    
    const timePart = `${formatBarBeat(bar, beat)}`;
    
    const jointShorthandParts = Object.entries(jointInfo)
        .map(([abbrev, data]) => getJointShorthand(abbrev, data))
        .filter(Boolean);

    const finalShorthand = jointShorthandParts.length > 0 
        ? `${timePart} | ${jointShorthandParts.join('; ')}`
        : timePart;

    const plainEnglish = getPlainGroundingDesc(grounding);
    const analysis = getAnalysisGroundingDesc(grounding);

    return {
        shorthand: finalShorthand,
        plainEnglish: plainEnglish,
        analysis: analysis,
    };
};
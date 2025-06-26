import {
  JOINT_VERBOSE_MAP,
  ORIENTATION_VERBOSE_MAP,
  GROUNDING_POINT_VERBOSE_MAP,
  VECTOR_TO_SHORTHAND_MAP,
  PATH_TYPE_MAP,
  INTENT_MAP,
  SYMBOLIC_DIRECTION_MAP,
} from './notationMaps';

// --- Helper Functions ---
const formatTime = (timecode) => timecode ? `${String(timecode.mm).padStart(2, '0')}:${String(timecode.ss).padStart(2, '0')}:${String(timecode.cs).padStart(3, '0')}` : '00:00:000';
const formatBarBeat = (bar, beat) => `${String(bar + 1).padStart(2, '0')}:${String(beat + 1).padStart(2, '0')}`;

const getPlainGroundingDesc = (grounding = {}) => {
    const parts = [];
    if (grounding.L) parts.push(`Grounded on ${GROUNDING_POINT_VERBOSE_MAP[grounding.L]?.plain || grounding.L}.`);
    if (grounding.R) parts.push(`Grounded on ${GROUNDING_POINT_VERBOSE_MAP[grounding.R]?.plain || grounding.R}.`);
    if (typeof grounding.L_weight === 'number') parts.push(`Weight: ${grounding.L_weight}% L / ${100 - grounding.L_weight}% R.`);
    return parts.join(' ');
};

const getAnalysisGroundingDesc = (grounding = {}) => {
    const parts = [];
    if (grounding.L) parts.push(`L. BoS: ${GROUNDING_POINT_VERBOSE_MAP[grounding.L]?.medical || grounding.L}.`);
    if (grounding.R) parts.push(`R. BoS: ${GROUNDING_POINT_VERBOSE_MAP[grounding.R]?.medical || grounding.R}.`);
    if (typeof grounding.L_weight === 'number') parts.push(`Load Dist: ${grounding.L_weight}% Left Pes / ${100 - grounding.L_weight}% Right Pes.`);
    return parts.join(' ');
};

// --- FIX: RESTORED THIS EXPORTED FUNCTION ---
/**
 * Gets the shorthand notation for a given joint and vector.
 * @param {string} jointAbbrev - e.g., "LS"
 * @param {object} vector - e.g., {x: 0, y: 1, z: 0}
 * @returns {string} The shorthand string, e.g., "LS(0,1,0)"
 */
export const getShorthandFromVector = (jointAbbrev, vector) => {
    if (!vector) return `${jointAbbrev}(0,0,0)`;
    const vectorKey = `${jointAbbrev},${vector.x},${vector.y},${vector.z}`;
    return VECTOR_TO_SHORTHAND_MAP[vectorKey] || `${jointAbbrev}(${vector.x},${vector.y},${vector.z})`;
};

const getJointShorthand = (abbrev, data) => {
    if (!data) return null;
    const parts = [];
    
    // Use the restored function to get the base vector notation
    if (data.vector) {
        parts.push(getShorthandFromVector(abbrev, data.vector));
    } else {
        parts.push(abbrev);
    }

    if (data.orientation && data.orientation !== 'NEU') parts.push(data.orientation);
    if (data.rotation) parts.push(`${data.rotation > 0 ? '+' : ''}${Math.round(data.rotation)}R`);
    if (data.pathType) parts.push(PATH_TYPE_MAP[data.pathType]?.shorthand || '');
    
    return parts.join(' ');
};


export const generateNotationForBeat = (bar, beat, beatData, analysisData) => {
    if (!beatData || !beatData.pose) {
        return {
            shorthand: "No Data",
            plainEnglish: "No data recorded for this beat.",
            analysis: "Awaiting analysis..."
        };
    }

    const { jointInfo = {}, grounding = {}, sounds = [] } = beatData.pose;
    const { rotations, stability, driver } = analysisData || {};
    
    const timePart = formatBarBeat(bar, beat);
    
    // Build Shorthand
    const jointShorthandParts = Object.entries(jointInfo).map(([abbrev, data]) => 
        getJointShorthand(abbrev, data)
    ).filter(Boolean);
    const finalShorthand = jointShorthandParts.length > 0 
        ? `${timePart} | ${jointShorthandParts.join('; ')}`
        : timePart;

    // Build Plain English
    const plainEnglishParts = [];
    if (rotations) {
        if (rotations.LS && rotations.LS !== 'NEU') plainEnglishParts.push(`LS ${ORIENTATION_VERBOSE_MAP[rotations.LS].plain}.`);
        if (rotations.RS && rotations.RS !== 'NEU') plainEnglishParts.push(`RS ${ORIENTATION_VERBOSE_MAP[rotations.RS].plain}.`);
    }
    const groundingDescPlain = getPlainGroundingDesc(grounding);
    if (groundingDescPlain) plainEnglishParts.push(groundingDescPlain);
    const finalPlainEnglish = plainEnglishParts.length ? plainEnglishParts.join(' ') : 'Neutral Stance.';

    // Build Analysis
    const analysisParts = [];
    if (typeof stability === 'number') analysisParts.push(`Stability: ${stability.toFixed(0)}%`);
    if (driver) analysisParts.push(`Driver: ${JOINT_VERBOSE_MAP[driver]?.plain || driver}`);
    const finalAnalysis = analysisParts.length > 0 ? analysisParts.join(' | ') : 'N/A';

    return {
        shorthand: finalShorthand,
        plainEnglish: finalPlainEnglish,
        analysis: finalAnalysis,
    };
};
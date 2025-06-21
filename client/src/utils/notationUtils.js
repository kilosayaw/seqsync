import {
  JOINT_VERBOSE_MAP,
  ORIENTATION_VERBOSE_MAP,
  GROUNDING_POINT_VERBOSE_MAP,
  SYMBOLIC_DIRECTION_MAP,
  PATH_TYPE_MAP,
  INTENT_MAP,
} from './notationMaps';
import { POSE_DEFAULT_VECTOR } from './constants';

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

const getJointShorthand = (abbrev, data) => {
    if (!data || Object.keys(data).length === 0) return null;

    const parts = [abbrev];
    if (data.orientation && data.orientation !== 'NEU') parts.push(data.orientation);

    if (data.gridMovement) {
        const { x, y, z } = data.gridMovement;
        if (x !== 0 || y !== 0 || z !== 0) {
            const matchingSymbolEntry = Object.entries(SYMBOLIC_DIRECTION_MAP).find(([, v]) => 
                v.vector.x === x && v.vector.y === y && v.vector.z === z
            );
            if (matchingSymbolEntry) {
                parts.push(matchingSymbolEntry[0]);
            } else {
                parts.push(`(${x},${y},${z})`);
            }
        }
    }
    
    if (data.rotation) parts.push(`${data.rotation > 0 ? '+' : ''}${Math.round(data.rotation)}R`);
    if (data.pathType) parts.push(PATH_TYPE_MAP[data.pathType]?.shorthand || '');
    if (data.lockDuration) parts.push(`[L${data.lockDuration}]`);
    
    return parts.length > 1 ? parts.join(' ') : null;
};

export const generateNotationForBeat = (bar, beat, beatData, timecode) => {
    if (!beatData || !beatData.pose) {
        return {
            shorthand: "No Data",
            plainEnglish: "No data recorded for this beat.",
            analysis: "No data recorded for this beat."
        };
    }

    const { jointInfo = {}, grounding = {}, sounds = [], analysis = {}, notation: manualNotation } = beatData.pose;
    
    const timePart = `${formatTime(timecode)} | ${formatBarBeat(bar, beat)}`;
    
    const jointShorthandParts = Object.entries(jointInfo).map(([abbrev, data]) => 
        getJointShorthand(abbrev, data)
    ).filter(Boolean);

    const finalShorthand = manualNotation || (jointShorthandParts.length > 0 
        ? `${timePart} | ${jointShorthandParts.join('; ')}`
        : timePart);

    const plainEnglishParts = [];
    if (sounds.length > 0) plainEnglishParts.push(`Sounds: ${sounds.map(s => s.split('/').pop().split('.')[0]).join(', ')}.`);
    const groundingDescPlain = getPlainGroundingDesc(grounding);
    if (groundingDescPlain) plainEnglishParts.push(groundingDescPlain);
    
    Object.entries(jointInfo).forEach(([abbrev, data]) => {
        if (!data || Object.keys(data).length === 0) return;
        const jointName = JOINT_VERBOSE_MAP[abbrev]?.plain || abbrev;
        const descriptions = [];
        if (data.orientation && data.orientation !== 'NEU') descriptions.push(ORIENTATION_VERBOSE_MAP[data.orientation]?.plain);
        if (data.rotation) descriptions.push(`rotated by ${Math.round(data.rotation)}°`);
        if (data.pathType) descriptions.push(PATH_TYPE_MAP[data.pathType]?.plain);
        if (data.lockDuration) descriptions.push(`and locked for ${data.lockDuration} beats`);
        if (data.intent) descriptions.push(INTENT_MAP[data.intent]?.plain);
        
        if (descriptions.length > 0) plainEnglishParts.push(`${jointName} ${descriptions.join(', ')}.`);
    });
    const finalPlainEnglish = plainEnglishParts.length ? plainEnglishParts.join(' ') : 'Neutral Stance.';

    const analysisParts = [];
    const groundingDescAnalysis = getAnalysisGroundingDesc(grounding);
    if (groundingDescAnalysis) analysisParts.push(groundingDescAnalysis);
    if (analysis?.torsionalLoad) analysisParts.push(`Torsional Load: ${analysis.torsionalLoad.toFixed(1)}°`);
    if (analysis?.upbeatEmphasis) analysisParts.push(`Upbeat Emphasis: ${analysis.upbeatEmphasis.toFixed(2)}`);
    const finalAnalysis = analysisParts.length > 0 ? analysisParts.join(' | ') : 'No specific kinematic data defined.';

    return {
        shorthand: finalShorthand,
        plainEnglish: finalPlainEnglish,
        analysis: finalAnalysis,
    };
};
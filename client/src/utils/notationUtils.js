import {
  JOINT_VERBOSE_MAP,
  ORIENTATION_VERBOSE_MAP,
  GROUNDING_POINT_VERBOSE_MAP,
  SYMBOLIC_DIRECTION_MAP,
  PATH_TYPE_MAP,
  INTENT_MAP,
} from './notationMaps';
import { POSE_DEFAULT_VECTOR } from './constants';

const formatTime = (timecode) => timecode ? `${timecode.mm}:${timecode.ss}:${timecode.cs}` : '00:00:00';
const formatBarBeat = (bar, beat) => `${bar + 1}:${beat + 1}`;

const getPlainGroundingDesc = (grounding) => {
    const parts = [];
    if (grounding.L) parts.push(`Grounded on ${GROUNDING_POINT_VERBOSE_MAP[grounding.L]?.plain || grounding.L}.`);
    if (grounding.R) parts.push(`Grounded on ${GROUNDING_POINT_VERBOSE_MAP[grounding.R]?.plain || grounding.R}.`);
    if (typeof grounding.L_weight === 'number') parts.push(`Weight: ${grounding.L_weight}% L / ${100 - grounding.L_weight}% R.`);
    return parts.join(' ');
};

const getAnalysisGroundingDesc = (grounding) => {
    const parts = [];
    if (grounding.L) parts.push(`L. BoS: ${GROUNDING_POINT_VERBOSE_MAP[grounding.L]?.medical || grounding.L}.`);
    if (grounding.R) parts.push(`R. BoS: ${GROUNDING_POINT_VERBOSE_MAP[grounding.R]?.medical || grounding.R}.`);
    if (typeof grounding.L_weight === 'number') parts.push(`Load Dist: ${grounding.L_weight}% Left Pes / ${100 - grounding.L_weight}% Right Pes.`);
    return parts.join(' ');
};

export const generateNotationForBeat = (bar, beat, beatData, timecode) => {
    if (!beatData) {
        return {
            shorthand: "No Data",
            plainEnglish: "No data recorded for this beat.",
            analysis: "No data recorded for this beat."
        };
    }

    const { jointInfo = {}, grounding = {}, sounds = [], analysis = {} } = beatData;
    const { torsionalLoad = 0, upbeatEmphasis = 0 } = analysis || {};

    const timePart = `${formatTime(timecode)} | ${formatBarBeat(bar, beat)}`;
    const jointShorthandParts = Object.entries(jointInfo).map(([abbrev, data]) => {
        if (!data || Object.keys(data).length === 0) return null;

        const parts = [abbrev];
        if (data.orientation && data.orientation !== 'NEU') parts.push(data.orientation);
        
        if (data.vector) {
            const vec = data.vector;
            const matchingSymbolEntry = Object.entries(SYMBOLIC_DIRECTION_MAP).find(([, v]) => 
                v && v.vector &&
                v.vector.x === Math.round(vec.x) &&
                v.vector.y === Math.round(vec.y) &&
                v.vector.z === Math.round(vec.z)
            );
            if (matchingSymbolEntry) {
                parts.push(matchingSymbolEntry[0]);
            }
        }
        
        if (data.rotation) parts.push(`${data.rotation > 0 ? '+' : ''}${Math.round(data.rotation)}R`);
        if (data.pathType) parts.push(PATH_TYPE_MAP[data.pathType]?.shorthand || '');
        if (data.lockDuration) parts.push(`[L${data.lockDuration}]`);
        
        return parts.join(' ');
    }).filter(Boolean);

    const finalShorthand = `${timePart}${jointShorthandParts.length > 0 ? ` | ${jointShorthandParts.join('; ')}` : ''}`;

    const plainEnglishParts = [];
    if (sounds && sounds.length > 0) plainEnglishParts.push(`Sounds: ${sounds.map(s => s.split('/').pop().split('.')[0]).join(', ')}.`);
    const groundingDescPlain = getPlainGroundingDesc(grounding);
    if (groundingDescPlain) plainEnglishParts.push(groundingDescPlain);
    
    Object.entries(jointInfo).forEach(([abbrev, data]) => {
        if (!data || Object.keys(data).length === 0) return;
        const jointName = JOINT_VERBOSE_MAP[abbrev]?.plain || abbrev;
        const descriptions = [];
        if (data.orientation) descriptions.push(ORIENTATION_VERBOSE_MAP[data.orientation]?.plain);
        if (data.rotation) {
             const moveDesc = Object.values(SYMBOLIC_DIRECTION_MAP).find(v => 
                v && v.vector &&
                v.vector.x === Math.round(data.vector.x) &&
                v.vector.y === Math.round(data.vector.y) &&
                v.vector.z === Math.round(data.vector.z)
            )?.plain;
            if(moveDesc) descriptions.push(moveDesc);
            descriptions.push(`rotated by ${Math.round(data.rotation)}°`);
        }
        if (data.pathType) descriptions.push(PATH_TYPE_MAP[data.pathType]?.plain);
        if (data.lockDuration) descriptions.push(`and locked for ${data.lockDuration} beats`);
        if (data.intent) descriptions.push(INTENT_MAP[data.intent]?.plain);
        if (descriptions.length > 0) plainEnglishParts.push(`${jointName} ${descriptions.join(', ')}.`);
    });
    const finalPlainEnglish = plainEnglishParts.length ? plainEnglishParts.join(' ') : 'Neutral Stance.';

    const analysisParts = [];
    const groundingDescAnalysis = getAnalysisGroundingDesc(grounding);
    if (groundingDescAnalysis) analysisParts.push(groundingDescAnalysis);
    if (torsionalLoad) analysisParts.push(`Torsional Load: ${torsionalLoad.toFixed(1)}°`);
    if (upbeatEmphasis) analysisParts.push(`Upbeat Emphasis: ${upbeatEmphasis.toFixed(2)}`);
    const finalAnalysis = analysisParts.length > 0 ? analysisParts.join(' | ') : 'No specific kinematic data defined.';

    return {
        shorthand: finalShorthand,
        plainEnglish: finalPlainEnglish,
        analysis: finalAnalysis,
    };
};
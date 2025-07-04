import { FOOT_HOTSPOT_COORDINATES } from './constants';

// --- YOUR ROBUST LOGIC ---
export const resolveNotationFromPoints = (pointsSet, side) => {
    if (pointsSet.size === 0) return `${side.charAt(0).toUpperCase()}F0`; // Ungrounded
    const sideKey = side.charAt(0).toUpperCase();
    const sidePrefix = `${sideKey}F`;
    const allPossiblePoints = new Set(FOOT_HOTSPOT_COORDINATES[sideKey].map(p => p.notation));
    if (pointsSet.size === allPossiblePoints.size) {
        return `${sidePrefix}123T12345`; // Full Grounding
    }
    const ballHeel = Array.from(pointsSet).filter(p => !p.startsWith('T')).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true})).join('');
    const toes = Array.from(pointsSet).filter(p => p.startsWith('T')).map(p => p.substring(1)).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true})).join('');
    let notation = sidePrefix;
    if (ballHeel) notation += ballHeel;
    if (toes) notation += `T${toes}`;
    return notation;
};

export const getPointsFromNotation = (notation) => {
    const points = new Set();
    if (!notation || notation.endsWith('0')) return points;
    const side = notation.charAt(0).toUpperCase();
    if (!FOOT_HOTSPOT_COORDINATES[side]) return points; // Safety check
    if (notation.endsWith('123T12345')) {
        return new Set(FOOT_HOTSPOT_COORDINATES[side].map(p => p.notation));
    }
    const remainder = notation.substring(2);
    const [ballHeelPart = '', toePart = ''] = remainder.split('T');
    for (const char of ballHeelPart) { points.add(char); }
    for (const char of toePart) { points.add(`T${char}`); }
    return points;
};


// --- PRESERVED FUNCTIONS NEEDED BY THE CURRENT UI ---
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
};

export const formatFullNotation = (beatData, currentTime) => {
    if (!beatData || !beatData.joints) {
        return `poSĒQr™ | ${formatTime(currentTime || 0)} | ${beatData?.bar || 1}:${(beatData?.beat || 0) + 1} | --`;
    }
    const { bar, beat, joints } = beatData;
    const timeStr = formatTime(currentTime || 0);
    const barBeatStr = `${String(bar).padStart(2, '0')}:${String(beat + 1).padStart(2, '0')}`;
    
    // Format Left and Right Foot joint data
    const lfJoint = joints.LF;
    const rfJoint = joints.RF;
    let notationParts = [];

    if(lfJoint?.grounding && !lfJoint.grounding.endsWith('0')) {
        notationParts.push(`${lfJoint.grounding}@${Math.round(lfJoint.angle)}°`);
    }
    if(rfJoint?.grounding && !rfJoint.grounding.endsWith('0')) {
        notationParts.push(`${rfJoint.grounding}@${Math.round(rfJoint.angle)}°`);
    }
    
    return `poSĒQr™ | ${timeStr} | ${barBeatStr} | ${notationParts.join(' | ')}`;
};
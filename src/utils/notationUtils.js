import { FOOT_HOTSPOT_COORDINATES } from './constants';

// --- Grounding Notation Utilities ---

export const resolveNotationFromPoints = (pointsSet, side) => {
    if (pointsSet.size === 0) return `${side.charAt(0).toUpperCase()}F0`;
    const sideKey = side.charAt(0).toUpperCase();
    const sidePrefix = `${sideKey}F`;
    const allPossiblePoints = new Set(FOOT_HOTSPOT_COORDINATES[sideKey].map(p => p.notation));
    if (pointsSet.size === allPossiblePoints.size) {
        return `${sidePrefix}123T12345`;
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
    if (!FOOT_HOTSPOT_COORDINATES[side]) return points;
    if (notation.endsWith('123T12345')) {
        return new Set(FOOT_HOTSPOT_COORDINATES[side].map(p => p.notation));
    }
    const remainder = notation.substring(2);
    const [ballHeelPart = '', toePart = ''] = remainder.split('T');
    for (const char of ballHeelPart) { points.add(char); }
    for (const char of toePart) { points.add(`T${char}`); }
    return points;
};

// --- Formatting Utilities ---

export const formatTime = (seconds) => {
    const time = new Date((seconds || 0) * 1000);
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const secs = String(time.getUTCSeconds()).padStart(2, '0');
    const ms = String(time.getUTCMilliseconds()).padStart(3, '0').slice(0, 2);
    return `${minutes}:${secs}:${ms}`;
};

export const formatFullNotation = (beatData, currentTime) => {
    if (!beatData || !beatData.joints) {
        return `poSĒQr™ | ${formatTime(currentTime || 0)} | ${beatData?.bar || 1}:${(beatData?.beat || 0) + 1} | --`;
    }

    const { bar, beat, joints } = beatData;
    const timeStr = formatTime(currentTime || 0);
    const barBeatStr = `${String(bar).padStart(2, '0')}:${String(beat + 1).padStart(2, '0')}`;
    
    const lfJoint = joints.LF;
    const rfJoint = joints.RF;
    let notationParts = [];

    if (lfJoint?.grounding && !lfJoint.grounding.endsWith('0')) {
        notationParts.push(`${lfJoint.grounding}@${Math.round(lfJoint.angle)}°`);
    }
    if (rfJoint?.grounding && !rfJoint.grounding.endsWith('0')) {
        notationParts.push(`${rfJoint.grounding}@${Math.round(rfJoint.angle)}°`);
    }
    
    const finalNotation = notationParts.length > 0 ? notationParts.join(' | ') : '--';

    return `poSĒQr™ | ${timeStr} | ${barBeatStr} | ${finalNotation}`;
};
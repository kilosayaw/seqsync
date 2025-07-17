import { JOINT_LIST, FOOT_HOTSPOT_COORDINATES } from './constants';

export const resolveNotationFromPoints = (pointsSet, side) => {
    const sideKey = side.charAt(0).toUpperCase();
    const sidePrefix = `${sideKey}F`;
    const allPossiblePoints = new Set((FOOT_HOTSPOT_COORDINATES[sideKey] || []).map(p => p.notation));
    if (pointsSet.size === allPossiblePoints.size) return `${sidePrefix}123T12345`;
    const mainPoints = Array.from(pointsSet).filter(p => !p.startsWith('T')).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).join('');
    const toes = Array.from(pointsSet).filter(p => p.startsWith('T')).map(p => p.substring(1)).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true})).join('');
    let notation = sidePrefix;
    if (mainPoints) notation += mainPoints;
    if (toes) notation += `T${toes}`;
    return notation === sidePrefix ? '' : notation;
};

export const getPointsFromNotation = (notation) => {
    const points = new Set();
    if (!notation || typeof notation !== 'string') return points;
    const side = notation.startsWith('LF') ? 'L' : (notation.startsWith('RF') ? 'R' : null);
    if (!side) return points;
    if (notation.includes('123T12345')) return new Set(FOOT_HOTSPOT_COORDINATES[side].map(p => p.notation));
    const remainder = notation.substring(2);
    const [mainPointsPart = '', toePart = ''] = remainder.split('T');
    for (const char of mainPointsPart) { points.add(char); }
    for (const char of toePart) { points.add(`T${char}`); }
    return points;
};

export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const time = new Date((seconds || 0) * 1000);
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const secs = String(time.getUTCSeconds()).padStart(2, '0');
    const centiseconds = String(Math.floor(time.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${minutes}:${secs}:${centiseconds}`;
};

export const formatFullNotation = (beatData, currentTime, bar, beat) => {
    const timeStr = formatTime(currentTime || 0);
    const barBeatStr = `Bar: ${String(bar || 1).padStart(2, '0')} | Beat: ${String(beat || 1).padStart(2, '0')}`;

    if (!beatData || !beatData.joints) return `${timeStr}; ${barBeatStr}`;
    
    const { joints } = beatData;
    const displayOrder = ['H', 'C', 'LF','RF', 'LA', 'RA', 'LK', 'RK', 'LH', 'RH', 'LS', 'RS', 'LE', 'RE', 'LW', 'RW', 'LP', 'RP'];

    const formatJoint = (jointId) => {
        const joint = joints[jointId];
        if (!joint) return `${jointId}(0,0,0)`;

        if (jointId.endsWith('F')) {
            const grounding = joint.grounding || `${jointId}`;
            const rotation = Math.round(joint.rotation || 0);
            return `${grounding}@${rotation}°`;
        }

        const position = joint.position || [0, 0, 0];
        let notation = `${jointId}(${Math.round(position[0])},${Math.round(position[1])},${Math.round(position[2])}`;
        
        if (joint.orientation && joint.orientation !== 'NEU') {
            notation += ` ${joint.orientation}`;
            if (joint.rotationIntensity !== undefined && joint.rotationIntensity < 100) {
                notation += `@${joint.rotationIntensity}`;
            }
        }
        
        // --- DEFINITIVE FIX: Never display 'BASE' or the obsolete 'PASS' ---
        if (joint.intentType && joint.intentType !== 'BASE' && joint.intentType !== 'PASS') {
            notation += ` ${joint.intentType}`;
            if (joint.intentType === 'FORCE' && joint.forceLevel > 0) {
                notation += `@${joint.forceLevel}`;
            }
        }
        // --- END OF FIX ---
        
        notation += ')';
        return notation;
    };

    const allNotations = displayOrder.map(formatJoint).join(' | ');

    return `${timeStr}; ${barBeatStr}; ${allNotations}`;
};

export const seekToPad = (params) => {
    const { wavesurfer, duration, bpm, padIndex, barStartTimes } = params;
    if (!wavesurfer || padIndex === null || !barStartTimes || !barStartTimes.length || bpm <= 0) return;
    const STEPS_PER_BAR = 8;
    const bar = Math.floor(padIndex / STEPS_PER_BAR);
    const stepInBar = padIndex % STEPS_PER_BAR;
    const barStartTime = barStartTimes[bar] || 0;
    const timePerStep = (60 / bpm) / 2;
    const stepOffsetTime = stepInBar * timePerStep;
    const finalTime = barStartTime + stepOffsetTime;
    if (duration > 0) wavesurfer.seekTo(finalTime / duration);
};
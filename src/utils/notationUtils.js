// src/utils/notationUtils.js
import { FOOT_HOTSPOT_COORDINATES } from './constants';

export const resolveNotationFromPoints = (pointsSet, side) => {
    const sideKey = side.charAt(0).toUpperCase();
    const sidePrefix = `${sideKey}F`;
    if (pointsSet.size === 0) return `${sidePrefix}0`;

    const allPossiblePoints = new Set((FOOT_HOTSPOT_COORDINATES[sideKey] || []).map(p => p.notation));
    if (pointsSet.size === allPossiblePoints.size) return `${sidePrefix}123T12345`;
    
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
    
    if (notation.includes('123T12345')) {
        return new Set(FOOT_HOTSPOT_COORDINATES[side].map(p => p.notation));
    }
    
    const remainder = notation.substring(2);
    const [ballHeelPart = '', toePart = ''] = remainder.split('T');
    
    for (const char of ballHeelPart) { points.add(char); }
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

export const formatFullNotation = (beatData, currentTime, barOverride) => {
    if (!beatData || !beatData.joints) {
        return `poSĒQr™ | ${formatTime(currentTime || 0)} | 01 | LF123T12345@0° | RF123T12345@0°`;
    }
    
    const { joints, bar } = beatData;
    const timeStr = formatTime(currentTime || 0);
    const barStr = String(barOverride || bar).padStart(2, '0');
    
    const formatJoint = (jointId) => {
        const joint = joints[jointId];
        if (!joint) return '--';
        
        if (jointId.endsWith('F')) {
            if (joint.grounding?.endsWith('0')) return `${joint.grounding.slice(0, 2)}000°`;
            return `${joint.grounding || '--'}@${Math.round(joint.rotation || 0)}°`;
        }
        
        if (joint.position) {
            const pos = joint.position;
            return `P(${pos[0].toFixed(1)},${pos[1].toFixed(1)},${pos[2].toFixed(1)})`;
        }
        
        return '--';
    };

    const lfNotation = formatJoint('LF');
    const rfNotation = formatJoint('RF');
    const lsNotation = formatJoint('LS');
    const rsNotation = formatJoint('RS');

    return `poSĒQr™ | ${timeStr} | ${barStr} | ${lfNotation} | ${rfNotation} | ${lsNotation} | ${rsNotation}`;
};

// DEFINITIVE FIX: Added the missing 'export' keyword to the function.
export const seekToPad = (params) => {
    const { wavesurfer, duration, bpm, padIndex, barStartTimes, noteDivision } = params;

    if (!wavesurfer || padIndex === null || !barStartTimes || !barStartTimes.length || bpm <= 0) {
        return;
    }

    const STEPS_PER_BAR = 8; // Based on our current 8-pad layout
    const bar = Math.floor(padIndex / STEPS_PER_BAR);
    const stepInBar = padIndex % STEPS_PER_BAR;

    const barStartTime = barStartTimes[bar] || 0;
    
    // Time for a single step (eighth note in our 8-step bar)
    const timePerStep = (60 / bpm) / 2;
    const stepOffsetTime = stepInBar * timePerStep;

    const finalTime = barStartTime + stepOffsetTime;

    if (duration > 0) {
        wavesurfer.seekTo(finalTime / duration);
    }
};
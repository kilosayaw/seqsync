// src/utils/notationUtils.js

import { FOOT_HOTSPOT_COORDINATES } from './constants';

/**
 * Creates a valid poSĒQr™ grounding notation string from a Set of active hotspot points.
 * @param {Set<string>} pointsSet - A Set containing the short notation of active points (e.g., {'1', 'T2'}).
 * @param {string} side - The side of the foot ('left' or 'right').
 * @returns {string} The full grounding notation (e.g., 'LF1T2').
 */
export const resolveNotationFromPoints = (pointsSet, side) => {
    const sideKey = side.charAt(0).toUpperCase();
    const sidePrefix = `${sideKey}F`;

    if (pointsSet.size === 0) return `${sidePrefix}0`;
    
    // Check for the "full plant" shortcut
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

/**
 * Parses a poSĒQr™ grounding notation string and returns a Set of its active hotspot points.
 * @param {string} notation - The full grounding notation (e.g., 'LF1T2').
 * @returns {Set<string>} A Set containing the short notation of active points.
 */
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

/**
 * Formats a given time in seconds into a MM:SS:cs string (cs = centiseconds).
 * @param {number} seconds - The time in seconds.
 * @returns {string} The formatted time string.
 */
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00:00';
    }
    const time = new Date((seconds || 0) * 1000);
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const secs = String(time.getUTCSeconds()).padStart(2, '0');
    const centiseconds = String(Math.floor(time.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${minutes}:${secs}:${centiseconds}`;
};

/**
 * Creates the full notation string for the main display.
 * @param {object} beatData - The data object for a single beat from songData.
 * @param {number} currentTime - The current playback time in seconds.
 * @returns {string} The fully formatted string for display.
 */
export const formatFullNotation = (beatData, currentTime) => {
    if (!beatData || !beatData.joints) {
        return `poSĒQr™ | ${formatTime(currentTime || 0)} | 01 | LF000° | RF000°`;
    }

    const { bar, joints } = beatData;
    const timeStr = formatTime(currentTime || 0);
    const barStr = String(bar).padStart(2, '0');
    
    const formatJoint = (joint, defaultNotation) => {
        if (!joint || !joint.grounding || joint.grounding.endsWith('0')) {
            return defaultNotation;
        }
        return `${joint.grounding}${Math.round(joint.angle || 0)}°`;
    };

    const lfNotation = formatJoint(joints.LF, 'LF000°');
    const rfNotation = formatJoint(joints.RF, 'RF000°');

    return `poSĒQr™ | ${timeStr} | ${barStr} | ${lfNotation} | ${rfNotation}`;
};
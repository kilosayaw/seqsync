// src/utils/groundingUtils.js
import { FOOT_NOTATION_MAP, FOOT_CONTACT_POINTS } from './constants';

export const resolveNotationFromPoints = (pointsSet, side) => {
    if (pointsSet.size === 0) return null;

    const sidePrefix = side.charAt(0).toUpperCase() + 'F';
    const allPointsForSide = FOOT_CONTACT_POINTS[side.charAt(0).toUpperCase()];

    if (pointsSet.size === allPointsForSide.length) {
        return `${sidePrefix}123T12345`;
    }
    
    const ballHeel = Array.from(pointsSet).filter(p => !p.startsWith('T')).sort().join('');
    const toes = Array.from(pointsSet).filter(p => p.startsWith('T')).map(p => p.substring(1)).sort().join('');
    
    let notation = sidePrefix;
    if (ballHeel) notation += ballHeel;
    if (toes) notation += `T${toes}`;
    
    if (FOOT_NOTATION_MAP[notation]) {
        return notation;
    }
    
    if (pointsSet.size === 1) {
        const singlePoint = Array.from(pointsSet)[0];
        const singleNotation = singlePoint.startsWith('T') 
            ? `${sidePrefix}T${singlePoint.substring(1)}`
            : `${sidePrefix}${singlePoint}`;
        if (FOOT_NOTATION_MAP[singleNotation]) return singleNotation;
    }

    return `${sidePrefix}123T12345`;
};

export const getPointsFromNotation = (notation) => {
    const side = notation?.substring(0, 1);
    if (!side || !['L', 'R'].includes(side)) return new Set();

    const allPointsForSide = FOOT_CONTACT_POINTS[side];
    if (!allPointsForSide) return new Set();

    if (notation.endsWith('123T12345')) {
        return new Set(allPointsForSide.map(p => p.notation));
    }
    
    const remainder = notation.substring(2);
    const parts = remainder.split('T');
    const ballHeelPart = parts[0];
    const toePart = parts.length > 1 ? parts[1] : '';
    const points = new Set();
    
    for (const char of ballHeelPart) { points.add(char); }
    for (const char of toePart) { points.add(`T${char}`); }
    
    return points;
};
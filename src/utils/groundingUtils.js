import { FOOT_CONTACT_POINTS } from './constants';

export const resolveNotationFromPoints = (pointsSet, side) => {
    if (pointsSet.size === 0) return null;
    const sidePrefix = side.charAt(0).toUpperCase() + 'F';

    if (pointsSet.size === FOOT_CONTACT_POINTS[side.charAt(0).toUpperCase()].length) {
        return `${sidePrefix}123T12345`;
    }
    
    const ballHeel = Array.from(pointsSet).filter(p => !p.startsWith('T')).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true})).join('');
    const toes = Array.from(pointsSet).filter(p => p.startsWith('T')).map(p => p.substring(1)).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true})).join('');
    
    let notation = sidePrefix;
    if (ballHeel) notation += ballHeel;
    if (toes) notation += `T${toes}`;
    
    return notation;
};

export const getPointsFromNotation = (notation, side) => {
    const sideKey = side.charAt(0).toUpperCase();
    if (!notation) return new Set(FOOT_CONTACT_POINTS[sideKey].map(p => p.notation));
    if (notation.endsWith('123T12345')) return new Set(FOOT_CONTACT_POINTS[sideKey].map(p => p.notation));
    
    const points = new Set();
    const remainder = notation.substring(2);
    const [ballHeelPart = '', toePart = ''] = remainder.split('T');
    
    for (const char of ballHeelPart) { points.add(char); }
    for (const char of toePart) { points.add(`T${char}`); }
    
    return points;
};
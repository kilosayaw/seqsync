// src/utils/notationUtils.js
import { formatTime } from './formatTime';

export const formatFullNotation = (beatData, bar, beat, currentTime) => {
    if (!beatData) {
        return `poSĒQr™: ${formatTime(currentTime)} | ${String(bar).padStart(2, '0')}:${String(beat + 1).padStart(2, '0')} | --`;
    }

    const formatJoint = (jointId) => {
        const data = beatData.joints?.[jointId];
        if (!data) return '';
        
        let parts = [];
        if (data.grounding) parts.push(`G${jointId.charAt(0)}:${data.grounding}`);
        if (data.angle) parts.push(`@ ${Math.round(data.angle)}°`);
        
        return parts.join(' ');
    };

    const lfNotation = formatJoint('LF');
    const rfNotation = formatJoint('RF');

    const timeStr = formatTime(currentTime);
    const barBeatStr = `${String(bar).padStart(2, '0')}:${String(beat + 1).padStart(2, '0')}`;
    
    let notation = `poSĒQr™: ${timeStr} | ${barBeatStr}`;
    if (lfNotation) notation += ` | ${lfNotation}`;
    if (rfNotation) notation += ` | ${rfNotation}`;
    
    return notation;
};
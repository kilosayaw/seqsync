import { formatTime } from './formatTime';

const convertAngleToClock = (angle) => {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const clockValue = Math.round((normalizedAngle + 15) / 30) % 12;
    return clockValue === 0 ? 12 : clockValue;
};

export const formatFullNotation = (beatData, currentTime, bar, beat) => {
    if (!beatData || !beatData.joints) return '---';

    const timeStr = formatTime(currentTime);
    const barStr = String(bar).padStart(2, '0');
    const beatIndex = beat === null ? 0 : beat;
    const beatStr = String(beatIndex + 1).padStart(2, '0');
    
    const leftFootData = beatData.joints.LF;
    const rightFootData = beatData.joints.RF;

    // Build the grounding string for the left foot, now including raw angle
    const groundL_notation = leftFootData?.grounding || 'LF123T12345';
    const groundL_angle = leftFootData?.angle || 0;
    const groundL_clock = convertAngleToClock(groundL_angle);
    // NEW: Add raw angle for debugging and validation
    const groundL = `${groundL_notation} @ ${groundL_clock} (${Math.round(groundL_angle)}°)`;

    // Build the grounding string for the right foot, now including raw angle
    const groundR_notation = rightFootData?.grounding || 'RF123T12345';
    const groundR_angle = rightFootData?.angle || 0;
    const groundR_clock = convertAngleToClock(groundR_angle);
    // NEW: Add raw angle for debugging and validation
    const groundR = `${groundR_notation} @ ${groundR_clock} (${Math.round(groundR_angle)}°)`;
    
    const sound = '--';
    const syllable = '--';
    const head = '--';
    const weightedHip = '--';

    return `${timeStr} | ${barStr}:${beatStr} | Snd:${sound} | Syl:${syllable} | H:${head} | WH:${weightedHip} | GL:${groundL} | GR:${groundR}`;
};
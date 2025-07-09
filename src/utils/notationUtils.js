// src/utils/notationUtils.js
import { FOOT_HOTSPOT_COORDINATES } from './constants';

// --- Grounding Notation ---
export const resolveNotationFromPoints = (pointsSet, side) => {
    const sideKey = side.charAt(0).toUpperCase();
    const sidePrefix = `${sideKey}F`;
    if (pointsSet.size === 0) return `${sidePrefix}0`;
    const allPossiblePoints = new Set(FOOT_HOTSPOT_COORDINATES[sideKey].map(p => p.notation));
    if (pointsSet.size === allPossiblePoints.size) return `${sidePrefix}123T12345`;
    const ballHeel = Array.from(pointsSet).filter(p => !p.startsWith('T')).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true})).join('');
    const toes = Array.from(pointsSet).filter(p => p.startsWith('T')).map(p => p.substring(1)).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true})).join('');
    let notation = sidePrefix;
    if (ballHeel) notation += ballHeel;
    if (toes) notation += `T${toes}`;
    return notation;
};

// --- Display Formatting ---
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const time = new Date((seconds || 0) * 1000);
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const secs = String(time.getUTCSeconds()).padStart(2, '0');
    const centiseconds = String(Math.floor(time.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${minutes}:${secs}:${centiseconds}`;
};

export const formatFullNotation = (beatData, currentTime) => {
    if (!beatData || !beatData.joints) {
        return `poSĒQr™ | ${formatTime(currentTime || 0)} | 01 | LF123T12345 | RF123T12345`;
    }
    const { bar, joints } = beatData;
    const timeStr = formatTime(currentTime || 0);
    const barStr = String(bar).padStart(2, '0');
    
    const formatJoint = (joint) => {
        if (!joint || !joint.grounding) return '--';
        if (joint.grounding.endsWith('0')) return `${joint.grounding.slice(0, 2)}000°`;
        return `${joint.grounding}@${Math.round(joint.angle || 0)}°`;
    };

    const lfNotation = formatJoint(joints.LF);
    const rfNotation = formatJoint(joints.RF);
    return `poSĒQr™ | ${timeStr} | ${barStr} | ${lfNotation} | ${rfNotation}`;
};

// --- Pose Data Transformation (from poseUtils.js) ---
const BLAZEPOSE_TO_SEQSYNC_MAP = {
    'nose': 'N', 'left_eye': 'LE', 'right_eye': 'RE', 'left_ear': 'LEAR', 'right_ear': 'REAR',
    'left_shoulder': 'LS', 'right_shoulder': 'RS', 'left_elbow': 'LE', 'right_elbow': 'RE',
    'left_wrist': 'LW', 'right_wrist': 'RW', 'left_hip': 'LH', 'right_hip': 'RH',
    'left_knee': 'LK', 'right_knee': 'RK', 'left_ankle': 'LA', 'right_ankle': 'RA',
};

export const transformBlazePoseToSEQSour = (blazePose, videoWidth, videoHeight) => {
    if (!blazePose || !blazePose.keypoints || !videoWidth || !videoHeight) return null;
    const jointInfo = {};
    blazePose.keypoints.forEach(keypoint => {
        const jointName = BLAZEPOSE_TO_SEQSYNC_MAP[keypoint.name];
        if (jointName) {
            jointInfo[jointName] = {
                vector: {
                    x: -( (keypoint.x / videoWidth) * 2 - 1 ),
                    y: -( (keypoint.y / videoHeight) * 2 - 1 ),
                    z: keypoint.z || 0,
                },
                score: keypoint.score,
                orientation: 'NEU',
            };
        }
    });
    return {
        id: `pose_${Date.now()}`,
        timestamp: performance.now(),
        jointInfo: jointInfo,
        score: blazePose.score
    };
};

export const getPointsFromNotation = (notation) => {
    const points = new Set();
    if (!notation || notation.endsWith('0')) return points;
    
    const side = notation.charAt(0).toUpperCase();
    if (!FOOT_HOTSPOT_COORDINATES[side]) return points;
    
    // DEFINITIVE FIX: Correctly handle the full foot plant notation
    if (notation.includes('123T12345')) {
        return new Set(FOOT_HOTSPOT_COORDINATES[side].map(p => p.notation));
    }
    
    const remainder = notation.substring(2);
    const [ballHeelPart = '', toePart = ''] = remainder.split('T');
    
    for (const char of ballHeelPart) { points.add(char); }
    for (const char of toePart) { points.add(`T${char}`); }
    
    return points;
};

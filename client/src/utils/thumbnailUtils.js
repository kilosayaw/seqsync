// /client/src/utils/thumbnailUtils.js
import { BODY_SEGMENTS } from './constants';

const THUMBNAIL_SIZE = 64;
const SPREAD_FACTOR = THUMBNAIL_SIZE * 0.4;
const CENTER_OFFSET = THUMBNAIL_SIZE / 2;
const STROKE_STYLE = 'rgba(255, 255, 255, 0.9)';
const LINE_WIDTH = 2;

export const generatePoseThumbnail = (jointInfo) => {
  if (typeof document === 'undefined' || !jointInfo || Object.keys(jointInfo).length === 0) {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_SIZE;
  canvas.height = THUMBNAIL_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  ctx.strokeStyle = STROKE_STYLE;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = 'round';
  ctx.beginPath();
  BODY_SEGMENTS.forEach(seg => {
    const p1 = jointInfo[seg.from]?.vector;
    const p2 = jointInfo[seg.to]?.vector;
    if (p1 && p2) {
        const startX = p1.x * SPREAD_FACTOR + CENTER_OFFSET;
        const startY = -p1.y * SPREAD_FACTOR + CENTER_OFFSET;
        const endX = p2.x * SPREAD_FACTOR + CENTER_OFFSET;
        const endY = -p2.y * SPREAD_FACTOR + CENTER_OFFSET;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
    }
  });
  ctx.stroke();
  return canvas.toDataURL('image/png');
};

/**
 * --- FIX: Added `isMirrored` parameter to handle data transformation ---
 * Translates the raw TensorFlow pose into our app's specific format.
 * Can now mirror the data by flipping X coordinates and swapping L/R joints.
 */
export const transformTfPoseToSeqPose = (tfPose, videoElement, isMirrored = false) => {
    if (!tfPose || !tfPose.keypoints) return null;
    const { videoWidth, videoHeight } = videoElement;
    if (videoWidth === 0 || videoHeight === 0) return null;

    const rawJointInfo = {};
    const jointMap = {
        'nose': 'H', 'left_shoulder': 'LS', 'right_shoulder': 'RS', 'left_elbow': 'LE',
        'right_elbow': 'RE', 'left_wrist': 'LW', 'right_wrist': 'RW', 'left_hip': 'LH',
        'right_hip': 'RH', 'left_knee': 'LK', 'right_knee': 'RK', 'left_ankle': 'LA', 'right_ankle': 'RA'
    };

    tfPose.keypoints.forEach(keypoint => {
        const abbrev = jointMap[keypoint.name];
        if (abbrev && keypoint.score > 0.3) {
            rawJointInfo[abbrev] = {
                vector: {
                    // If mirroring, we flip the X coordinate here.
                    x: Number((((keypoint.x / videoWidth) * 2 - 1) * (isMirrored ? -1 : 1)).toFixed(4)),
                    y: Number(((keypoint.y / videoHeight) * -2 + 1).toFixed(4)),
                    z: Number((keypoint.z ? (keypoint.z / videoWidth) * -1 : 0).toFixed(4)),
                },
                score: Number(keypoint.score.toFixed(4)),
            };
        }
    });

    // --- FIX: If mirrored, swap all Left and Right joints ---
    let finalJointInfo = rawJointInfo;
    if (isMirrored) {
        finalJointInfo = {};
        const swapMap = {
            'LS': 'RS', 'RS': 'LS', 'LE': 'RE', 'RE': 'LE', 'LW': 'RW', 'RW': 'LW',
            'LH': 'RH', 'RH': 'LH', 'LK': 'RK', 'RK': 'LK', 'LA': 'RA', 'RA': 'LA'
        };
        for (const key in rawJointInfo) {
            const swappedKey = swapMap[key] || key;
            finalJointInfo[swappedKey] = rawJointInfo[key];
        }
    }

    const grounding = { L: null, R: null, L_weight: 50 };
    // Use finalJointInfo for grounding check
    if (finalJointInfo['LA']?.score > 0.5) grounding.L = 'L123T12345';
    if (finalJointInfo['RA']?.score > 0.5) grounding.R = 'R123T12345';
    
    return { jointInfo: finalJointInfo, grounding };
};
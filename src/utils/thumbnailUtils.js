// client/src/utils/thumbnailUtils.js
import { BODY_SEGMENTS, POSE_DEFAULT_VECTOR } from './constants';

const THUMBNAIL_SIZE = 64;
const SPREAD_FACTOR = THUMBNAIL_SIZE * 0.4;
const CENTER_OFFSET = THUMBNAIL_SIZE / 2;
const STROKE_STYLE = 'rgba(255, 255, 255, 0.9)';
const LINE_WIDTH = 2;

/**
 * Synchronously generates a Data URL (base64) image of a skeletal pose.
 * This version is self-contained and more reliable.
 * @param {object} jointInfo - The jointInfo object from our sequence data.
 * @returns {string|null} A base64 encoded PNG image, or null if no data.
 */
export const generatePoseThumbnail = (jointInfo) => {
  // Guard against running in a non-browser environment or with no data
  if (typeof document === 'undefined' || !jointInfo || Object.keys(jointInfo).length === 0) {
    return null;
  }

  // Create a fresh canvas for each thumbnail to prevent state conflicts.
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_SIZE;
  canvas.height = THUMBNAIL_SIZE;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  ctx.clearRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  // --- Draw Body Segments ---
  ctx.strokeStyle = STROKE_STYLE;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = 'round';
  ctx.beginPath();

  BODY_SEGMENTS.forEach(seg => {
    const p1 = jointInfo[seg.from]?.vector;
    const p2 = jointInfo[seg.to]?.vector;

    // Only draw a line if both points are valid
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
// src/utils/thumbnailUtils.js
import { BODY_SEGMENTS, POSE_DEFAULT_VECTOR } from './constants';

const THUMBNAIL_SIZE = 64; // The size of the thumbnail image in pixels
const SPREAD_FACTOR = THUMBNAIL_SIZE * 0.4; // How spread out the skeleton is
const CENTER_OFFSET = THUMBNAIL_SIZE / 2;

/**
 * Generates a Data URL (base64) image of a skeletal pose.
 * @param {object} jointInfo - The jointInfo object from our sequence data.
 * @returns {string|null} A base64 encoded PNG image, or null if no data.
 */
export const generatePoseThumbnail = (jointInfo) => {
  if (!jointInfo || Object.keys(jointInfo).length === 0) {
    return null;
  }

  // Use OffscreenCanvas for performance; it doesn't need to be in the DOM.
  const canvas = new OffscreenCanvas(THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  // --- Draw Body Segments ---
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.5;

  BODY_SEGMENTS.forEach(seg => {
    const p1 = jointInfo[seg.from]?.vector || POSE_DEFAULT_VECTOR;
    const p2 = jointInfo[seg.to]?.vector || POSE_DEFAULT_VECTOR;

    // Convert normalized [-1, 1] vector to canvas coordinates
    const startX = p1.x * SPREAD_FACTOR + CENTER_OFFSET;
    const startY = -p1.y * SPREAD_FACTOR + CENTER_OFFSET;
    const endX = p2.x * SPREAD_FACTOR + CENTER_OFFSET;
    const endY = -p2.y * SPREAD_FACTOR + CENTER_OFFSET;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
  
  // Convert the canvas to a Data URL
  return canvas.transferToImageBitmap().then(bitmap => {
      const regularCanvas = document.createElement('canvas');
      regularCanvas.width = THUMBNAIL_SIZE;
      regularCanvas.height = THUMBNAIL_SIZE;
      const regularCtx = regularCanvas.getContext('2d');
      regularCtx.drawImage(bitmap, 0, 0);
      return regularCanvas.toDataURL('image/png');
  });
};
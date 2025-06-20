import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { POSE_DEFAULT_VECTOR } from './constants';

/**
 * A utility to conditionally join Tailwind CSS classes without style conflicts.
 * @param  {...any} inputs - Class names or conditional objects.
 * @returns {string} The final, merged class name string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Linearly interpolates between two numbers.
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} fraction - The interpolation fraction (0 to 1).
 * @returns {number} The interpolated value.
 */
export const lerp = (start, end, fraction) => {
    const s = typeof start === 'number' ? start : 0;
    const e = typeof end === 'number' ? end : 0;
    return s + (e - s) * fraction;
};

/**
 * Linearly interpolates between two 3D vectors.
 * @param {object} startVec - The starting vector {x, y, z}.
 * @param {object} endVec - The ending vector {x, y, z}.
 * @param {number} fraction - The interpolation fraction (0 to 1).
 * @returns {object} The interpolated vector.
 */
export const lerpVector = (startVec, endVec, fraction) => {
    const safeStart = startVec || POSE_DEFAULT_VECTOR;
    const safeEnd = endVec || POSE_DEFAULT_VECTOR;
    
    return {
        x: lerp(safeStart.x, safeEnd.x, fraction),
        y: lerp(safeStart.y, safeEnd.y, fraction),
        z: lerp(safeStart.z, safeEnd.z, fraction),
    };
};

/**
 * [NEW] Checks if a point is inside a convex polygon using the ray-casting algorithm.
 * @param {object} point - The point to check {x, y}.
 * @param {array} polygon - An array of {x, y} vertices of the polygon in order.
 * @returns {boolean} True if the point is inside.
 */
export function isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * [NEW] Finds the closest point on the boundary of a polygon to a given point.
 * If the point is inside the polygon, it returns the point itself.
 * @param {object} point - The point to constrain {x, y}.
 * @param {array} polygon - An array of {x, y} vertices of the polygon in order.
 * @returns {object} The constrained {x, y} point.
 */
export function getVectorFromXY(point, polygon) {
    if (isPointInPolygon(point, polygon)) {
        return point;
    }

    let minDistanceSq = Infinity;
    let closestPoint = { x: 0, y: 0 };

    for (let i = 0; i < polygon.length; i++) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % polygon.length];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        if (dx === 0 && dy === 0) continue;

        const t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / (dx * dx + dy * dy);
        const clampedT = Math.max(0, Math.min(1, t));
        
        const projection = {
            x: p1.x + clampedT * dx,
            y: p1.y + clampedT * dy,
        };
        
        const distSq = (point.x - projection.x)**2 + (point.y - projection.y)**2;
        
        if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closestPoint = projection;
        }
    }
    return closestPoint;
}
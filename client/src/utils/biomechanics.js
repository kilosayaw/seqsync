// --- Vector Math Helpers ---
const v_sub = (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y });
const v_mag_sq = (v) => v.x * v.x + v.y * v.y;

// --- Core Analysis Functions ---

/** Calculates a simplified 2D Center of Mass from core body joints. */
export const calculateCenterOfMass = (jointInfo) => {
    const coreJoints = ['LS', 'RS', 'LH', 'RH'];
    const points = coreJoints.map(j => jointInfo[j]?.vector).filter(Boolean);
    if (points.length < 2) return null;
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
};

/** Determines the 2D Base of Support polygon from grounded feet. */
export const calculateBaseOfSupport = (jointInfo) => {
    const leftAnkle = jointInfo['LA']?.vector;
    const rightAnkle = jointInfo['RA']?.vector;
    if (leftAnkle && rightAnkle) return [{x: leftAnkle.x, y: leftAnkle.y}, {x: rightAnkle.x, y: rightAnkle.y}];
    if (leftAnkle) return [{x: leftAnkle.x - 0.1, y: leftAnkle.y}, {x: leftAnkle.x + 0.1, y: leftAnkle.y}];
    if (rightAnkle) return [{x: rightAnkle.x - 0.1, y: rightAnkle.y}, {x: rightAnkle.x + 0.1, y: rightAnkle.y}];
    return null;
};

/** Checks if a point is inside a polygon (for stability). */
function isPointInPolygon(point, polygon) {
    if (!point || !polygon || polygon.length < 2) return false;
    const minX = Math.min(polygon[0].x, polygon[1].x);
    const maxX = Math.max(polygon[0].x, polygon[1].x);
    return point.x >= minX && point.x <= maxX;
}

/** Estimates shoulder rotation based on elbow Z-position relative to the shoulder. */
export const getShoulderRotation = (shoulder, elbow) => {
    if (!shoulder?.vector || !elbow?.vector) return 'NEU';
    const z_diff = (elbow.vector.z || 0) - (shoulder.vector.z || 0);
    if (z_diff > 0.05) return 'OUT';
    if (z_diff < -0.05) return 'IN';
    return 'NEU';
};

/** Finds the joint that moved the most since the last frame. */
export const getPrimaryDriver = (current, previous) => {
    if (!current || !previous) return null;
    let maxDist = -1;
    let driver = null;
    for (const key in current) {
        if (current[key]?.vector && previous[key]?.vector) {
            const dist = v_mag_sq(v_sub(current[key].vector, previous[key].vector));
            if (dist > maxDist) {
                maxDist = dist;
                driver = key;
            }
        }
    }
    return maxDist > 0.0005 ? driver : null;
};

/** The main orchestrator function. */
export const analyzePoseDynamics = (currentPose, previousPose) => {
    if (!currentPose?.jointInfo) return null;
    const { jointInfo } = currentPose;
    const prevJointInfo = previousPose?.jointInfo;

    const centerOfMass = calculateCenterOfMass(jointInfo);
    const baseOfSupport = calculateBaseOfSupport(jointInfo);
    const isStable = isPointInPolygon(centerOfMass, baseOfSupport);
    const driver = getPrimaryDriver(jointInfo, prevJointInfo);
    const rotations = {
        LS: getShoulderRotation(jointInfo.LS, jointInfo.LE),
        RS: getShoulderRotation(jointInfo.RS, jointInfo.RE),
    };

    return {
        centerOfMass,
        baseOfSupport,
        stability: isStable ? 100 : 0,
        driver,
        rotations,
    };
};
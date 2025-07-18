export const JOINT_LIST = [
    { id: 'H', name: 'Head' }, { id: 'N', name: 'Neck' }, 
    { id: 'CHEST', name: 'Chest' }, { id: 'PELV', name: 'Pelvis' },
    { id: 'LS', name: 'L Shoulder' }, { id: 'RS', name: 'R Shoulder' },
    { id: 'LE', name: 'L Elbow' }, { id: 'RE', name: 'R Elbow' },
    { id: 'LW', name: 'L Wrist' }, { id: 'RW', name: 'R Wrist' },
    { id: 'LH', name: 'L Hip' }, { id: 'RH', name: 'R Hip' },
    { id: 'LK', name: 'L Knee' }, { id: 'RK', name: 'R Knee' },
    { id: 'LA', name: 'L Ankle' }, { id: 'RA', name: 'R Ankle' },
    { id: 'LF', name: 'L Foot' }, { id: 'RF', name: 'R Foot' },
];

export const VISIBLE_JOINT_LIST = JOINT_LIST.filter(j => 
    !['N', 'CHEST', 'PELV'].includes(j.id)
);

export const BASE_FOOT_PATHS = { L: '/ground/foot-left.png', R: '/ground/foot-right.png' };

export const DEFAULT_POSE_VECTOR = { x: 0, y: 0, z: 0 };

const T_POSE_VECTORS = {
    H: { x: 0, y: 0.9, z: 0 }, N: { x: 0, y: 0.7, z: 0 },
    CHEST: { x: 0, y: 0.5, z: 0 }, PELV: { x: 0, y: 0.1, z: 0 },
    LS: { x: -0.2, y: 0.6, z: 0 }, RS: { x: 0.2, y: 0.6, z: 0 },
    LE: { x: -0.5, y: 0.6, z: 0 }, RE: { x: 0.5, y: 0.6, z: 0 },
    LW: { x: -0.8, y: 0.6, z: 0 }, RW: { x: 0.8, y: 0.6, z: 0 },
    LH: { x: -0.15, y: 0.1, z: 0 }, RH: { x: 0.15, y: 0.1, z: 0 },
    LK: { x: -0.15, y: -0.4, z: 0 }, RK: { x: 0.15, y: -0.4, z: 0 },
    LA: { x: -0.15, y: -0.8, z: 0 }, RA: { x: 0.15, y: -0.8, z: 0 },
    LF: { x: -0.15, y: -0.9, z: 0.05 }, RF: { x: 0.15, y: -0.9, z: 0.05 },
};

export const DEFAULT_POSE = {
    jointInfo: Object.fromEntries(
        JOINT_LIST.map(j => [j.id, { vector: T_POSE_VECTORS[j.id] || { ...DEFAULT_POSE_VECTOR }, score: 1.0 }])
    )
};

export const POSE_CONNECTIONS = [
    ['N', 'H'], ['CHEST', 'N'], ['CHEST', 'LS'], ['CHEST', 'RS'], 
    ['LS', 'LE'], ['RS', 'RE'], ['LE', 'LW'], ['RE', 'RW'],
    ['CHEST', 'PELV'], ['PELV', 'LH'], ['PELV', 'RH'],
    ['LH', 'LK'], ['RH', 'RK'], ['LK', 'LA'], ['RK', 'RA'],
    ['LA', 'LF'], ['RA', 'RF']
];

export const CORE_CONNECTIONS = [
    ['LS', 'RS'], ['LH', 'RH'], ['LS', 'LH'], ['RS', 'RH'],
    ['LS', 'RH'], ['RS', 'LH']
];

export const FOOT_HOTSPOT_COORDINATES = {
    L: [ { type: 'circle', notation: '3', cx: 176, cy: 281, r: 27 }, { type: 'circle', notation: '1', cx: 209, cy: 144, r: 27 }, { type: 'circle', notation: '2', cx: 139, cy: 178, r: 16 }, { type: 'ellipse', notation: 'T1', cx: 207, cy: 73, rx: 18, ry: 25, rotation: -17 }, { type: 'ellipse', notation: 'T2', cx: 168, cy: 75, rx: 10, ry: 12, rotation: -10 }, { type: 'ellipse', notation: 'T3', cx: 145, cy: 91, rx: 10, ry: 12, rotation: -35 }, { type: 'ellipse', notation: 'T4', cx: 126, cy: 113, rx: 10, ry: 13, rotation: -50 }, { type: 'ellipse', notation: 'T5', cx: 116, cy: 139, rx: 11, ry: 12, rotation: -25 }, ],
    R: [ { type: 'circle', notation: '3', cx: 174, cy: 281, r: 27 }, { type: 'circle', notation: '1', cx: 141, cy: 144, r: 27 }, { type: 'circle', notation: '2', cx: 212, cy: 177, r: 16 }, { type: 'ellipse', notation: 'T1', cx: 142, cy: 75, rx: 18, ry: 26, rotation: 17 }, { type: 'ellipse', notation: 'T2', cx: 183, cy: 76, rx: 10, ry: 12, rotation: 11 }, { type: 'ellipse', notation: 'T3', cx: 205, cy: 92, rx: 10, ry: 12, rotation: 25 }, { type: 'ellipse', notation: 'T4', cx: 224, cy: 114, rx: 10, ry: 13, rotation: 35 }, { type: 'ellipse', notation: 'T5', cx: 235, cy: 141, rx: 11, ry: 12, rotation: 15 }, ]
};
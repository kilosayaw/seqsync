export const JOINT_LIST = [
    { id: 'H', name: 'Head'},
    { id: 'C', name: 'Core'},
    { id: 'LS', name: 'LS' }, { id: 'RS', name: 'RS' },
    { id: 'LE', name: 'LE' }, { id: 'RE', name: 'RE' },
    { id: 'LW', name: 'LW' }, { id: 'RW', name: 'RW' },
    { id: 'LW1', name: 'LW1' }, { id: 'RW1', name: 'RW1' },
    { id: 'LW2', name: 'LW2' }, { id: 'RW2', name: 'RW2' },
    { id: 'LH', name: 'LH' }, { id: 'RH', name: 'RH' },
    { id: 'LK', name: 'LK' }, { id: 'RK', name: 'RK' },
    { id: 'LA', name: 'LA' }, { id: 'RA', name: 'RA' },
    { id: 'LA1', name: 'LA1' }, { id: 'RA1', name: 'RA1' },
    { id: 'LA2', name: 'LA2' }, { id: 'RA2', name: 'RA2' },
    { id: 'LF', name: 'LF' }, { id: 'RF', name: 'RF' },
];

export const VISIBLE_JOINT_LIST = JOINT_LIST.filter(j => 
    !j.id.includes('LW1') && !j.id.includes('LW2') &&
    !j.id.includes('LA1') && !j.id.includes('LA2') &&
    !j.id.includes('RW1') && !j.id.includes('RW2') &&
    !j.id.includes('RA1') && !j.id.includes('RA2') &&
    !j.id.includes('C') 
);

export const BASE_FOOT_PATHS = {
    L: '/ground/foot-bottom-left.png',
    R: '/ground/foot-bottom-right.png',
};

export const DEFAULT_POSE_VECTOR = { x: 0, y: 0, z: 0 };

export const DEFAULT_POSE = {
    jointInfo: {
        'H':  { vector: { ...DEFAULT_POSE_VECTOR, y: 0.8 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LS': { vector: { x: -0.2, y: 0.6, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RS': { vector: { x: 0.2, y: 0.6, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LE': { vector: { x: -0.4, y: 0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RE': { vector: { x: 0.4, y: 0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LW': { vector: { x: -0.6, y: -0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RW': { vector: { x: 0.6, y: -0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LH': { vector: { x: -0.15, y: 0.1, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RH': { vector: { x: 0.15, y: 0.1, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LK': { vector: { x: -0.2, y: -0.35, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RK': { vector: { x: 0.2, y: -0.35, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LA': { vector: { x: -0.25, y: -0.8, z: 0 }, score: 1, orientation: 'NEU', role: 'stabilizer' },
        'RA': { vector: { x: 0.25, y: -0.8, z: 0 }, score: 1, orientation: 'NEU', role: 'stabilizer' },
    }
};

export const POSE_CONNECTIONS = [
    ['H', 'LS'], ['H', 'RS'],
    ['LS', 'RS'], ['LH', 'RH'], ['LS', 'LH'], ['RS', 'RH'],
    ['LS', 'LE'], ['LE', 'LW'],
    ['RS', 'RE'], ['RE', 'RW'],
    ['LH', 'LK'], ['LK', 'LA'],
    ['RH', 'RK'], ['RK', 'RA'],
];

// PHOENIX PROTOCOL: Reverted constant name to original for stability.
export const FOOT_HOTSPOT_COORDINATES = {
    L: [
        { notation: '3', type: 'circle', cx: 176, cy: 450, r: 40 },
        { notation: '1', type: 'circle', cx: 245, cy: 230, r: 40 },
        { notation: '2', type: 'circle', cx: 105, cy: 280, r: 25 },
        { notation: 'T1', type: 'ellipse', cx: 270, cy: 110, rx: 25, ry: 35, rotation: -17 },
        { notation: 'T2', type: 'ellipse', cx: 205, cy: 95, rx: 18, ry: 22, rotation: -10 },
        { notation: 'T3', type: 'ellipse', cx: 160, cy: 120, rx: 18, ry: 22, rotation: -35 },
        { notation: 'T4', type: 'ellipse', cx: 125, cy: 160, rx: 18, ry: 22, rotation: -45 },
        { notation: 'T5', type: 'ellipse', cx: 105, cy: 210, rx: 18, ry: 22, rotation: -25 },
    ],
    R: [
        { notation: '3', type: 'circle', cx: 174, cy: 450, r: 40 },
        { notation: '1', type: 'circle', cx: 105, cy: 230, r: 40 },
        { notation: '2', type: 'circle', cx: 245, cy: 280, r: 25 },
        { notation: 'T1', type: 'ellipse', cx: 80, cy: 110, rx: 25, ry: 35, rotation: 17 },
        { notation: 'T2', type: 'ellipse', cx: 145, cy: 95, rx: 18, ry: 22, rotation: 11 },
        { notation: 'T3', type: 'ellipse', cx: 190, cy: 120, rx: 18, ry: 22, rotation: 25 },
        { notation: 'T4', type: 'ellipse', cx: 225, cy: 160, rx: 18, ry: 22, rotation: 35 },
        { notation: 'T5', type: 'ellipse', cx: 245, cy: 210, rx: 18, ry: 22, rotation: 15 },
    ]
};
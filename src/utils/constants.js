// src/utils/constants.js

export const JOINT_LIST = [
    { id: 'H', name: 'Head'},
    { id: 'LS', name: 'LS' }, { id: 'RS', name: 'RS' },
    { id: 'LE', name: 'LE' }, { id: 'RE', name: 'RE' },
    { id: 'LW', name: 'LW' }, { id: 'RW', name: 'RW' },
    { id: 'LH', name: 'LH' }, { id: 'RH', name: 'RH' },
    { id: 'LK', name: 'LK' }, { id: 'RK', name: 'RK' },
    { id: 'LA', name: 'LA' }, { id: 'RA', name: 'RA' },
    { id: 'L3', name: 'L3' }, { id: 'R3', name: 'R3' },
    { id: 'LF', name: 'LF' }, { id: 'RF', name: 'RF' },
];

export const BASE_FOOT_PATHS = {
    L: '/ground/foot-left.png',
    R: '/ground/foot-right.png',
};

export const DEFAULT_POSE = {
    jointInfo: {
        'H':  { vector: { x: 0, y: 0.8, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LS': { vector: { x: -0.2, y: 0.6, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RS': { vector: { x: 0.2, y: 0.6, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LE': { vector: { x: -0.4, y: 0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RE': { vector: { x: 0.4, y: 0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LW': { vector: { x: -0.6, y: -0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RW': { vector: { x: 0.6, y: -0.2, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        // DEFINITIVE: Raised the hips by changing y from -0.2 to 0.0
        'LH': { vector: { x: -0.15, y: 0.0, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RH': { vector: { x: 0.15, y: 0.0, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LK': { vector: { x: -0.2, y: -0.4, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'RK': { vector: { x: 0.2, y: -0.4, z: 0 }, score: 1, orientation: 'NEU', role: 'frame' },
        'LA': { vector: { x: -0.25, y: -0.8, z: 0 }, score: 1, orientation: 'NEU', role: 'stabilizer' },
        'RA': { vector: { x: 0.25, y: -0.8, z: 0 }, score: 1, orientation: 'NEU', role: 'stabilizer' },
        'L3': { vector: { x: -0.25, y: -0.9, z: 0.1 }, score: 1, orientation: 'NEU', role: 'stabilizer' },
        'R3': { vector: { x: 0.25, y: -0.9, z: 0.1 }, score: 1, orientation: 'NEU', role: 'stabilizer' },
    }
};

export const POSE_CONNECTIONS = [
    ['H', 'LS'], ['H', 'RS'],
    ['LS', 'RS'], ['LH', 'RH'], ['LS', 'LH'], ['RS', 'RH'],
    ['LS', 'LE'], ['LE', 'LW'],
    ['RS', 'RE'], ['RE', 'RW'],
    ['LH', 'LK'], ['LK', 'LA'], ['LA', 'L3'],
    ['RH', 'RK'], ['RK', 'RA'], ['RA', 'R3'],
];

// DEFINITIVE FIX: The 'export' keyword was missing from this constant declaration.
export const FOOT_HOTSPOT_COORDINATES = {
    L: [
        { type: 'circle', notation: '3', cx: 276, cy: 403, r: 31 },
        { type: 'circle', notation: '1', cx: 316, cy: 235, r: 31 },
        { type: 'circle', notation: '2', cx: 231, cy: 276, r: 18 },
        { type: 'ellipse', notation: 'T1', cx: 313, cy: 150, rx: 22, ry: 30, rotation: -17 },
        { type: 'ellipse', notation: 'T2', cx: 265, cy: 153, rx: 13, ry: 16, rotation: -10 },
        { type: 'ellipse', notation: 'T3', cx: 237, cy: 171, rx: 12, ry: 15, rotation: -25 },
        { type: 'ellipse', notation: 'T4', cx: 215, cy: 197, rx: 11, ry: 14, rotation: -120 },
        { type: 'ellipse', notation: 'T5', cx: 203, cy: 230, rx: 10, ry: 13, rotation: -25 },
    ],
    R: [
        { type: 'circle', notation: '3', cx: 276, cy: 403, r: 31 },
        { type: 'circle', notation: '1', cx: 233, cy: 235, r: 31 },
        { type: 'circle', notation: '2', cx: 321, cy: 276, r: 18 },
        { type: 'ellipse', notation: 'T1', cx: 236, cy: 150, rx: 22, ry: 30, rotation: 17 },
        { type: 'ellipse', notation: 'T2', cx: 285, cy: 153, rx: 13, ry: 16, rotation: 10 },
        { type: 'ellipse', notation: 'T3', cx: 313, cy: 170, rx: 11, ry: 15, rotation: 25 },
        { type: 'ellipse', notation: 'T4', cx: 335, cy: 198, rx: 11, ry: 15, rotation: 35 },
        { type: 'ellipse', notation: 'T5', cx: 347, cy: 230, rx: 11, ry: 14, rotation: 15 },
    ]
};
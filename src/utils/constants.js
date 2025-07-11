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
        { type: 'circle', notation: '3', cx: 176, cy: 281, r: 26 },
        { type: 'circle', notation: '1', cx: 209, cy: 144, r: 26 },
        { type: 'circle', notation: '2', cx: 139, cy: 178, r: 16 },
        { type: 'ellipse', notation: 'T1', cx: 208, cy: 75, rx: 18, ry: 25, rotation: -17 },
        { type: 'ellipse', notation: 'T2', cx: 167, cy: 77, rx: 10, ry: 12, rotation: -10 },
        { type: 'ellipse', notation: 'T3', cx: 145, cy: 92, rx: 10, ry: 12, rotation: -35 },
        { type: 'ellipse', notation: 'T4', cx: 126, cy: 114, rx: 10, ry: 13, rotation: -50 },
        { type: 'ellipse', notation: 'T5', cx: 116, cy: 140, rx: 11, ry: 12, rotation: -25 },
    ],
    R: [
        { type: 'circle', notation: '3', cx: 174, cy: 281, r: 26 },
        { type: 'circle', notation: '1', cx: 141, cy: 144, r: 26 },
        { type: 'circle', notation: '2', cx: 212, cy: 177, r: 16 },
        { type: 'ellipse', notation: 'T1', cx: 143, cy: 75, rx: 18, ry: 25, rotation: 17 },
        { type: 'ellipse', notation: 'T2', cx: 183, cy: 76, rx: 10, ry: 12, rotation: 11 },
        { type: 'ellipse', notation: 'T3', cx: 205, cy: 92, rx: 10, ry: 12, rotation: 25 },
        { type: 'ellipse', notation: 'T4', cx: 224, cy: 114, rx: 10, ry: 13, rotation: 35 },
        { type: 'ellipse', notation: 'T5', cx: 235, cy: 141, rx: 11, ry: 12, rotation: 15 },
    ]
};
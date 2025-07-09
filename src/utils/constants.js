// src/utils/constants.js

export const JOINT_LIST = [
    { id: 'LS', name: 'LS' }, { id: 'RS', name: 'RS' },
    { id: 'LE', name: 'LE' }, { id: 'RE', name: 'RE' },
    { id: 'LW', name: 'LW' }, { id: 'RW', name: 'RW' },
    { id: 'LP', name: 'LP' }, { id: 'RP', name: 'RP' },
    { id: 'LH', name: 'LH' }, { id: 'RH', name: 'RH' },
    { id: 'LK', name: 'LK' }, { id: 'RK', name: 'RK' },
    { id: 'LA', name: 'LA' }, { id: 'RA', name: 'RA' },
    { id: 'LF', name: 'LF' }, { id: 'RF', name: 'RF' },
];

export const BASE_FOOT_PATHS = {
    L: '/ground/foot-left.png',
    R: '/ground/foot-right.png',
};

// DEFINITIVE: Added a default pose for initial rendering
export const DEFAULT_POSE = {
    jointInfo: {
        'LS': { vector: { x: -0.2, y: 0.6, z: 0 }, score: 1, orientation: 'NEU' },
        'RS': { vector: { x: 0.2, y: 0.6, z: 0 }, score: 1, orientation: 'NEU' },
        'LE': { vector: { x: -0.4, y: 0.2, z: 0 }, score: 1, orientation: 'NEU' },
        'RE': { vector: { x: 0.4, y: 0.2, z: 0 }, score: 1, orientation: 'NEU' },
        'LW': { vector: { x: -0.6, y: -0.2, z: 0 }, score: 1, orientation: 'NEU' },
        'RW': { vector: { x: 0.6, y: -0.2, z: 0 }, score: 1, orientation: 'NEU' },
        'LH': { vector: { x: -0.15, y: -0.2, z: 0 }, score: 1, orientation: 'NEU' },
        'RH': { vector: { x: 0.15, y: -0.2, z: 0 }, score: 1, orientation: 'NEU' },
        'LK': { vector: { x: -0.2, y: -0.6, z: 0 }, score: 1, orientation: 'NEU' },
        'RK': { vector: { x: 0.2, y: -0.6, z: 0 }, score: 1, orientation: 'NEU' },
        'LA': { vector: { x: -0.25, y: -0.9, z: 0 }, score: 1, orientation: 'NEU' },
        'RA': { vector: { x: 0.25, y: -0.9, z: 0 }, score: 1, orientation: 'NEU' },
    }
};

// DEFINITIVE: More complete list of connections for a better stick figure
export const POSE_CONNECTIONS = [
    // Torso
    ['LS', 'RS'], ['LH', 'RH'], ['LS', 'LH'], ['RS', 'RH'],
    // Left Arm
    ['LS', 'LE'], ['LE', 'LW'],
    // Right Arm
    ['RS', 'RE'], ['RE', 'RW'],
    // Left Leg
    ['LH', 'LK'], ['LK', 'LA'],
    // Right Leg
    ['RH', 'RK'], ['RK', 'RA']
];
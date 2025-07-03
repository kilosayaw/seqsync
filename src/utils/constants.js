export const UI_PADS_PER_BAR = 16;
export const DATA_DEFAULT_BEATS_PER_BAR = 16;
export const BARS_PER_SEQUENCE = 4;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 30;
export const BPM_MAX = 300;

export const JOINT_LIST = [
    { id: 'LS', name: 'L Shoulder' }, { id: 'RS', name: 'R Shoulder' },
    { id: 'LE', name: 'L Elbow' }, { id: 'RE', name: 'R Elbow' },
    { id: 'LW', name: 'L Wrist' }, { id: 'RW', name: 'R Wrist' },
    { id: 'LP', name: 'L Palm' }, { id: 'RP', name: 'R Palm' },
    { id: 'LH', name: 'L Hip' }, { id: 'RH', name: 'R Hip' },
    { id: 'LK', name: 'L Knee' }, { id: 'RK', name: 'R Knee' },
    { id: 'LA', name: 'L Ankle' }, { id: 'RA', 'name': 'R Ankle' },
    { id: 'LF', name: 'L Foot' }, { id: 'RF', name: 'R Foot' },
    { id: 'H', name: 'Head' },
];

export const BASE_FOOT_PATHS = {
    L: '/ground/foot-left.png',
    R: '/ground/foot-right.png',
};

// --- FINAL, HIGH-PRECISION HOTSPOT CALIBRATION ---
// These coordinates have been meticulously adjusted to perfectly align
// with the underlying template image's cutouts.
export const FOOT_HOTSPOT_COORDINATES = {
    L: [
        { type: 'circle', notation: '3', cx: 276, cy: 403, r: 31 },  // Heel
        { type: 'circle', notation: '1', cx: 316, cy: 235, r: 31 },  // Ball (inside)
        { type: 'circle', notation: '2', cx: 231, cy: 276, r: 18 },  // Ball (outside)
        { type: 'ellipse', notation: 'T1', cx: 313, cy: 150, rx: 22, ry: 30, rotation: -17 }, // Big Toe
        { type: 'ellipse', notation: 'T2', cx: 265, cy: 153, rx: 13, ry: 16, rotation: -10 }, // Toe 2
        { type: 'ellipse', notation: 'T3', cx: 237, cy: 171, rx: 12, ry: 15, rotation: -25 },   // Toe 3
        { type: 'ellipse', notation: 'T4', cx: 215, cy: 197, rx: 11, ry: 14, rotation: -30 },  // Toe 4
        { type: 'ellipse', notation: 'T5', cx: 203, cy: 230, rx: 10, ry: 13, rotation: -25 },  // Toe 5
    ],
    R: [ // Mirrored from L around a vertical axis at x=275
        { type: 'circle', notation: '3', cx: 276, cy: 403, r: 31 },  // Heel
        { type: 'circle', notation: '1', cx: 236, cy: 235, r: 31 },  // Ball (inside)
        { type: 'circle', notation: '2', cx: 321, cy: 276, r: 18 },  // Ball (outside)
        { type: 'ellipse', notation: 'T1', cx: 236, cy: 150, rx: 22, ry: 30, rotation: 17 },  // Big Toe
        { type: 'ellipse', notation: 'T2', cx: 285, cy: 153, rx: 13, ry: 16, rotation: 10 },  // Toe 2
        { type: 'ellipse', notation: 'T3', cx: 313, cy: 170, rx: 11, ry: 15, rotation: 25 },   // Toe 3
        { type: 'ellipse', notation: 'T4', cx: 335, cy: 198, rx: 11, ry: 15, rotation: 35 }, // Toe 4
        { type: 'ellipse', notation: 'T5', cx: 347, cy: 230, rx: 11, ry: 14, rotation: 15 }, // Toe 5
    ]
};

// This is legacy data and might be removed later. Kept for reference.
export const FOOT_CONTACT_POINTS = {
    L: [
        { notation: '1', path: '/ground/L1.png' }, { notation: '2', path: '/ground/L2.png' }, { notation: '3', path: '/ground/L3.png' },
        { notation: 'T1', path: '/ground/LT1.png' }, { notation: 'T2', path: '/ground/LT2.png' }, { notation: 'T3', path: '/ground/LT3.png' }, { notation: 'T4', path: '/ground/LT4.png' }, { notation: 'T5', path: '/ground/LT5.png' },
    ],
    R: [
        { notation: '1', path: '/ground/R1.png' }, { notation: '2', path: '/ground/R2.png' }, { notation: '3', path: '/ground/R3.png' },
        { notation: 'T1', path: '/ground/RT1.png' }, { notation: 'T2', path: '/ground/RT2.png' }, { notation: 'T3', path: '/ground/RT3.png' }, { notation: 'T4', path: '/ground/RT4.png' }, { notation: 'T5', path: '/ground/RT5.png' },
    ]
};
// src/utils/constants.js

export const JOINT_LIST = [
    { id: 'LS', name: 'LS' }, { id: 'RS', name: 'RS' },
    { id: 'LE', name: 'LE' }, { id: 'RE', name: 'RE' },
    { id: 'LW', name: 'LW' }, { id: 'RW', name: 'RW' },
    { id: 'LP', name: 'LP' }, { id: 'RP', name: 'RP' },
    { id: 'LH', name: 'LH' }, { id: 'RH', name: 'RH' },
    { id: 'LK', name: 'LK' }, { id: 'RK', name: 'RK' },
    { id: 'LA', name: 'LA' }, { id: 'RA', 'name': 'RA' },
    { id: 'LF', name: 'LF' }, { id: 'RF', name: 'RF' },
    { id: 'H', name: 'Head' },
];

export const BASE_FOOT_PATHS = {
    L: '/ground/foot-left.png',
    R: '/ground/foot-right.png',
};

export const NOTE_DIVISIONS = [
  { value: 16, label: '1/16' },
  { value: 8, label: '1/8' },
  { value: 4, label: '1/4' },
];

export const POSE_DEFAULT_VECTOR = { x: 0, y: 0, z: 0 };

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
        { type: 'ellipse', notation: 'T4', cx: 215, cy: 197, rx: 11, ry: 14, rotation: -120 },  // Toe 4
        { type: 'ellipse', notation: 'T5', cx: 203, cy: 230, rx: 10, ry: 13, rotation: -25 },  // Toe 5
    ],
    R: [ // Mirrored from L
        { type: 'circle', notation: '3', cx: 276, cy: 403, r: 31 },  // Heel
        { type: 'circle', notation: '1', cx: 233, cy: 235, r: 31 },  // Ball (inside)
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

export const GROUNDING_PRESETS = [
    // Left Foot Presets (Pads 1-8)
    { padId: 1, side: 'L', name: 'L Full', notation: 'LF123T12345' },
    { padId: 2, side: 'L', name: 'L Heel Up', notation: 'LF12T12345' },
    { padId: 3, side: 'L', name: 'L Toes', notation: 'LFT12345' },
    { padId: 4, side: 'L', name: 'L Tripod', notation: 'LF123' },
    { padId: 5, side: 'L', name: 'L Heel', notation: 'LF3' },
    { padId: 6, side: 'L', name: 'L Blade In', notation: 'LF13T1' },
    { padId: 7, side: 'L', name: 'L Blade Out', notation: 'LF23T5' },
    { padId: 8, side: 'L', name: 'L Ungrounded', notation: 'LF0' },
    // Right Foot Presets (Pads 9-16)
    { padId: 9, side: 'R', name: 'R Full', notation: 'RF123T12345' },
    { padId: 10, side: 'R', name: 'R Heel Up', notation: 'RF12T12345' },
    { padId: 11, side: 'R', name: 'R Toes', notation: 'RFT12345' },
    { padId: 12, side: 'R', name: 'R Tripod', notation: 'RF123' },
    { padId: 13, side: 'R', name: 'R Heel', notation: 'RF3' },
    { padId: 14, side: 'R', name: 'R Blade In', notation: 'RF13T1' },
    { padId: 15, side: 'R', name: 'R Blade Out', notation: 'RF23T5' },
    { padId: 16, side: 'R', name: 'R Ungrounded', notation: 'RF0' },
];

export const FOOT_NOTATION_MAP = {
  'L_BASE_FOOT': { path: '/ground/foot-left.png' },
  'R_BASE_FOOT': { path: '/ground/foot-right.png' },
  // Left Foot
  'LF1': { path: '/ground/L1.png' }, 'LF2': { path: '/ground/L2.png' }, 'LF3': { path: '/ground/L3.png' },
  'LFT1': { path: '/ground/LT1.png' }, 'LFT2': { path: '/ground/LT2.png' }, 'LFT3': { path: '/ground/LT3.png' }, 'LFT4': { path: '/ground/LT4.png' }, 'LFT5': { path: '/ground/LT5.png' },
  'LF12': { path: '/ground/L12.png' }, 'LF13': { path: '/ground/L13.png' }, 'LF23': { path: '/ground/L23.png' }, 'LF123': { path: '/ground/L123.png' },
  'LFT12': { path: '/ground/LT12.png' }, 'LFT345': { path: '/ground/LT345.png' }, 'LFT12345': { path: '/ground/LT12345.png' },
  'LF1T1': { path: '/ground/L1T1.png' }, 'LF2T5': { path: '/ground/L2T5.png' },
  'LF123T12345': { path: '/ground/L123T12345.png' }, 'LF23T12345': { path: '/ground/L23T12345.png' },
  // Right Foot
  'RF1': { path: '/ground/R1.png' }, 'RF2': { path: '/ground/R2.png' }, 'RF3': { path: '/ground/R3.png' },
  'RFT1': { path: '/ground/RT1.png' }, 'RFT2': { path: '/ground/RT2.png' }, 'RFT3': { path: '/ground/RT3.png' }, 'RFT4': { path: '/ground/RT4.png' }, 'RFT5': { path: '/ground/RT5.png' },
  'RF12': { path: '/ground/R12.png' }, 'RF13': { path: '/ground/R13.png' }, 'RF23': { path: '/ground/R23.png' }, 'RF123': { path: '/ground/R123.png' },
  'RFT12': { path: '/ground/RT12.png' }, 'RFT345': { path: '/ground/RT345.png' }, 'RFT12345': { path: '/ground/RT12345.png' },
  'RF1T1': { path: '/ground/R1T1.png' }, 'RF2T5': { path: '/ground/R2T5.png' },
  'RF12T12345': { path: '/ground/R12T12345.png' }, 'RF23T12345': { path: '/ground/R23T12345.png' },
};

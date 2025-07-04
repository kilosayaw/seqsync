// src/utils/constants.js

// =================================================================================================
// SĒQsync Project Constants - The Single Source of Truth for Configuration
// (Directly reflects the official notation documentation)
// =================================================================================================

export const UI_PADS_PER_BAR = 16;
export const DATA_DEFAULT_BEATS_PER_BAR = 16;
export const BARS_PER_SEQUENCE = 4;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 30;
export const BPM_MAX = 300;

export const JOINT_LIST = [
    { id: 'LS', name: 'L Shoulder' }, { id: 'RS', name: 'R Shoulder' },
    { id: 'LE', name: 'L Elbow' },    { id: 'RE', name: 'R Elbow' },
    { id: 'LW', name: 'L Wrist' },    { id: 'RW', name: 'R Wrist' },
    { id: 'LP', name: 'L Palm' },     { id: 'RP', name: 'R Palm' },
    { id: 'LH', name: 'L Hip' },      { id: 'RH', name: 'R Hip' },
    { id: 'LK', name: 'L Knee' },     { id: 'RK', name: 'R Knee' },
    { id: 'LA', name: 'L Ankle' },    { id: 'RA', name: 'R Ankle' },
    { id: 'LF', name: 'L Foot' },     { id: 'RF', name: 'R Foot' },
    { id: 'H', name: 'Head' },
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

// DATA FIX: All points are now present and correct.
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

// IV. HAND NOTATION MAP
export const HAND_NOTATION_MAP = {
    // Left Hand
    'LW': { description: 'Left Wrist' }, 'LW1': { description: 'Left Wrist Thumb Side' }, 'LW2': { description: 'Left Wrist Pinky Side' },
    'LP': { description: 'Left Palm' }, 'LP1': { description: 'Left Palm base under the index finger' }, 'LP2': { description: 'Left Palm base under the middle finger' },
    'LP3': { description: 'Left Palm base under the ring finger' }, 'LP4': { description: 'Left Palm base under the pinky finger' }, 'LP5': { description: 'Left Palm base under the thumb, above LP7' },
    'LP6': { description: 'Left Palm base above LP8' }, 'LP7': { description: 'Side of left wrist aligned with the thumb' }, 'LP8': { description: 'Side of left wrist aligned with the pinky' },
    'LPFP1': { description: 'Left palm finger print index finger' }, 'LP12345': { description: 'Full left palm' }, 'LPBK1234': { description: 'Left hand base knuckles 1 through 4' },
    // Right Hand
    'RW': { description: 'Right Wrist' }, 'RW1': { description: 'Right Wrist Thumb Side' }, 'RW2': { description: 'Right Wrist Pinky Side' },
    'RP': { description: 'Right Palm' }, 'RP1': { description: 'Right Palm base under the index finger' }, 'RP2': { description: 'Right Palm base under the middle finger' },
    'RP3': { description: 'Right Palm base under the ring finger' }, 'RP4': { description: 'Right Palm base under the pinky finger' }, 'RP5': { description: 'Right Palm base under the thumb, above RP7' },
    'RP6': { description: 'Right Palm base above RP8' }, 'RP7': { description: 'Side of right wrist aligned with the thumb' }, 'RP8': { description: 'Side of right wrist aligned with the pinky' },
    'RPFP1': { description: 'Right palm finger print index finger' }, 'RP12345': { description: 'Full right palm' }, 'RPBK1234': { description: 'Right hand base knuckles 1 through 4' },
};

// V. ORIENTATION & MODIFIER SYMBOLS
export const ORIENTATION_SYMBOLS = {
    'IN': { name: 'Internal Rotation' }, 'OUT': { name: 'External Rotation' }, 'NEU': { name: 'Neutral' },
    'FLEX': { name: 'Flexion' }, 'EXT': { name: 'Extension' }, 'PRO': { name: 'Pronate' }, 'SUP': { name: 'Supinate' },
    'ULN': { name: 'Ulnar Deviation' }, 'RAD': { name: 'Radial Deviation' },
};

// VI. DIRECTIONAL MOVE SYMBOLS
export const DIRECTIONAL_MOVE_SYMBOLS = {
    'v': { description: 'Downward Motion', vector: [0, -1, 0] }, '^': { description: 'Upward Motion', vector: [0, 1, 0] },
    '/>': { description: 'Forward Motion', vector: [0, 0, 1] }, '</': { description: 'Backward Motion', vector: [0, 0, -1] },
    '<': { description: 'Left Side Motion', vector: [-1, 0, 0] }, '>': { description: 'Right Side Motion', vector: [1, 0, 0] },
    '/8': { description: 'Figure 8 Clockwise' }, '\\8': { description: 'Figure 8 Counter CW' },
    '/O': { description: 'Circle Clockwise' }, '\\O': { description: 'Circle Counter CW' },
};

// VII. TRANSITION & INTENSITY SYMBOLS
export const TRANSITION_SYMBOLS = {
    '/*': { name: 'Slow to Fast Transition' }, '-*-': { name: 'Fast to Slow Transition' }, '~*~': { name: 'Smooth Transition' },
    '<*>': { name: 'Sharp Transition' }, ':**:': { name: 'On Beat' }, '..*': { name: 'Behind the Beat' },
    '*::': { name: 'Ahead of the Beat' }, '-*+': { name: 'Low to High Impact' }, '+*-': { name: 'High to Low Impact' }, '[*]': { name: 'Even Impact' },
};


// The brain of the new system.
// A priority-ordered map to resolve a set of active points into a single notation.
// The resolver will find the FIRST match from the top down.
export const GROUNDING_RESOLUTION_MAP = [
  // Full Plant (Most specific, so it goes first)
  { notation: 'LF123T12345', requiredPoints: ['L1','L2','L3','LT1','LT2','LT3','LT4','LT5'] },
  { notation: 'RF123T12345', requiredPoints: ['R1','R2','R3','RT1','RT2','RT3','RT4','RT5'] },
  // Specific Toes
  { notation: 'LF1T12', requiredPoints: ['L1', 'LT1', 'LT2'] },
  { notation: 'RF1T12', requiredPoints: ['R1', 'RT1', 'RT2'] },
  // Blades & Fronts
  { notation: 'LF13', requiredPoints: ['L1', 'L3'] },
  { notation: 'RF13', requiredPoints: ['R1', 'R3'] },
  { notation: 'LF23', requiredPoints: ['L2', 'L3'] },
  { notation: 'RF23', requiredPoints: ['R2', 'R3'] },
  { notation: 'LF12', requiredPoints: ['L1', 'L2'] },
  { notation: 'RF12', requiredPoints: ['R1', 'R2'] },
  // Section + single toe
  { notation: 'LF1T1', requiredPoints: ['L1', 'LT1'] },
  { notation: 'RF1T1', requiredPoints: ['R1', 'RT1'] },
  // Individual Ball/Heel Points
  { notation: 'LF1', requiredPoints: ['L1'] }, { notation: 'RF1', requiredPoints: ['R1'] },
  { notation: 'LF2', requiredPoints: ['L2'] }, { notation: 'RF2', requiredPoints: ['R2'] },
  { notation: 'LF3', requiredPoints: ['L3'] }, { notation: 'RF3', requiredPoints: ['R3'] },
  // Individual Toe Points (Lowest Priority)
  { notation: 'LFT1', requiredPoints: ['LT1'] }, { notation: 'RFT1', requiredPoints: ['RT1'] },
];


// IX. OTHER CONCEPTS
export const HEAD_OVER_HOP_CONCEPT = {
    'HO': { name: 'Head Over Hop', description: 'Habitualize placing head over the hip receiving energy for stability.' },
};
// =================================================================================================
// SĒQsync Project Constants - The Single Source of Truth for Configuration
// (Directly reflects the official notation documentation)
// =================================================================================================

// I. CORE TIMING & SEQUENCE STRUCTURE
export const UI_PADS_PER_BAR = 16;
export const DATA_DEFAULT_BEATS_PER_BAR = 16;
export const BARS_PER_SEQUENCE = 4;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 30;
export const BPM_MAX = 300;

// I. CORE JOINT DEFINITIONS
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

// II. FOOT NOTATION MAP
export const FOOT_NOTATION_MAP = {
  'L_BASE_FOOT': { path: '/ground/foot-left.png' },
  'R_BASE_FOOT': { path: '/ground/foot-right.png' },
  // Left Foot
  'LF1': { description: 'Left Foot Section 1 (big toe ball of the foot)', path: '/ground/L1.png' },
  'LF2': { description: 'Left Foot Section 2 (pinky toe ball of the foot)', path: '/ground/L2.png' },
  'LF3': { description: 'Left Foot Section 3 (heel ball of the foot)', path: '/ground/L3.png' },
  'LF1T1': { description: 'Left Foot Section 1 and big toe print', path: '/ground/L1T1.png' },
  'LF1T12': { description: 'Left Foot Section 1, big toe and pointer toe prints', path: '/ground/L1T12.png' },
  'LF123T12345': { description: 'Left full foot plant', path: '/ground/L123T12345.png' },
  'LF12': { description: 'Left front of foot', path: '/ground/L12.png' },
  'LF23': { description: 'Left outer blade', path: '/ground/L23.png' },
  'LF13': { description: 'Left inner blade', path: '/ground/L13.png' },
  'LFT1': { description: 'Left foot big toe print', path: '/ground/LT1.png' },
  // Right Foot
  'RF1': { description: 'Right Foot Section 1 (big toe ball of the foot)', path: '/ground/R1.png' },
  'RF2': { description: 'Right Foot Section 2 (pinky toe ball of the foot)', path: '/ground/R2.png' },
  'RF3': { description: 'Right Foot Section 3 (heel ball of the foot)', path: '/ground/R3.png' },
  'RF1T1': { description: 'Right Foot Section 1 and big toe print', path: '/ground/R1T1.png' },
  'RF1T12': { description: 'Right Foot Section 1, big toe and pointer toe prints', path: '/ground/R1T12.png' },
  'RF123T12345': { description: 'Right full foot plant', path: '/ground/R123T12345.png' },
  'RF12': { description: 'Right front of foot', path: '/ground/R12.png' },
  'RF23': { description: 'Right outer blade', path: '/ground/R23.png' },
  'RF13': { description: 'Right inner blade', path: '/ground/R13.png' },
  'RFT1': { description: 'Right foot big toe print', path: '/ground/RT1.png' },
};

// III. FOOT JOYSTICK ZONES (Coordinates are normalized 0-1)
export const FOOT_CONTACT_ZONES = {
  L: [
    { notation: 'LF1', cx: 0.68, cy: 0.5, radius: 0.12 },
    { notation: 'LF2', cx: 0.32, cy: 0.5, radius: 0.12 },
    { notation: 'LF3', cx: 0.5, cy: 0.8, radius: 0.15 },
    { notation: 'LF13', cx: 0.6, cy: 0.65, radius: 0.1 },
    { notation: 'LF23', cx: 0.4, cy: 0.65, radius: 0.1 },
    { notation: 'LF12', cx: 0.5, cy: 0.45, radius: 0.1 },
    { notation: 'LFT1', cx: 0.5, cy: 0.2, radius: 0.1 },
  ],
  R: [ // Mirrored X-coordinates
    { notation: 'RF1', cx: 0.32, cy: 0.5, radius: 0.12 },
    { notation: 'RF2', cx: 0.68, cy: 0.5, radius: 0.12 },
    { notation: 'RF3', cx: 0.5, cy: 0.8, radius: 0.15 },
    { notation: 'RF13', cx: 0.4, cy: 0.65, radius: 0.1 },
    { notation: 'RF23', cx: 0.6, cy: 0.65, radius: 0.1 },
    { notation: 'RF12', cx: 0.5, cy: 0.45, radius: 0.1 },
    { notation: 'RFT1', cx: 0.5, cy: 0.2, radius: 0.1 },
  ],
};


// IV. HAND NOTATION MAP
export const HAND_NOTATION_MAP = {
    // Left Hand
    'LW': { description: 'Left Wrist' },
    'LW1': { description: 'Left Wrist Thumb Side' },
    'LW2': { description: 'Left Wrist Pinky Side' },
    'LP': { description: 'Left Palm' },
    'LP1': { description: 'Left Palm base under the index finger' },
    'LP2': { description: 'Left Palm base under the middle finger' },
    'LP3': { description: 'Left Palm base under the ring finger' },
    'LP4': { description: 'Left Palm base under the pinky finger' },
    'LP5': { description: 'Left Palm base under the thumb, above LP7' },
    'LP6': { description: 'Left Palm base above LP8' },
    'LP7': { description: 'Side of left wrist aligned with the thumb' },
    'LP8': { description: 'Side of left wrist aligned with the pinky' },
    'LPFP1': { description: 'Left palm finger print index finger' },
    'LP12345': { description: 'Full left palm' },
    'LPBK1234': { description: 'Left hand base knuckles 1 through 4' },
    // Right Hand
    'RW': { description: 'Right Wrist' },
    'RW1': { description: 'Right Wrist Thumb Side' },
    'RW2': { description: 'Right Wrist Pinky Side' },
    'RP': { description: 'Right Palm' },
    'RP1': { description: 'Right Palm base under the index finger' },
    'RP2': { description: 'Right Palm base under the middle finger' },
    'RP3': { description: 'Right Palm base under the ring finger' },
    'RP4': { description: 'Right Palm base under the pinky finger' },
    'RP5': { description: 'Right Palm base under the thumb, above RP7' },
    'RP6': { description: 'Right Palm base above RP8' },
    'RP7': { description: 'Side of right wrist aligned with the thumb' },
    'RP8': { description: 'Side of right wrist aligned with the pinky' },
    'RPFP1': { description: 'Right palm finger print index finger' },
    'RP12345': { description: 'Full right palm' },
    'RPBK1234': { description: 'Right hand base knuckles 1 through 4' },
};

// V. ORIENTATION & MODIFIER SYMBOLS
export const ORIENTATION_SYMBOLS = {
    'IN': { name: 'Internal Rotation' },
    'OUT': { name: 'External Rotation' },
    'NEU': { name: 'Neutral' },
    'FLEX': { name: 'Flexion' },
    'EXT': { name: 'Extension' },
    'PRO': { name: 'Pronate' },
    'SUP': { name: 'Supinate' },
    'ULN': { name: 'Ulnar Deviation' },
    'RAD': { name: 'Radial Deviation' },
};

// VI. DIRECTIONAL MOVE SYMBOLS
export const DIRECTIONAL_MOVE_SYMBOLS = {
    'v': { description: 'Downward Motion', vector: [0, -1, 0] },
    '^': { description: 'Upward Motion', vector: [0, 1, 0] },
    '/>': { description: 'Forward Motion', vector: [0, 0, 1] },
    '</': { description: 'Backward Motion', vector: [0, 0, -1] },
    '<': { description: 'Left Side Motion', vector: [-1, 0, 0] },
    '>': { description: 'Right Side Motion', vector: [1, 0, 0] },
    '/8': { description: 'Figure 8 Clockwise' },
    '\\8': { description: 'Figure 8 Counter CW' },
    '/O': { description: 'Circle Clockwise' },
    '\\O': { description: 'Circle Counter CW' },
};

// VII. TRANSITION & INTENSITY SYMBOLS
export const TRANSITION_SYMBOLS = {
    '/*': { name: 'Slow to Fast Transition' },
    '-*-': { name: 'Fast to Slow Transition' },
    '~*~': { name: 'Smooth Transition' },
    '<*>': { name: 'Sharp Transition' },
    ':*:': { name: 'On Beat' },
    '..*': { name: 'Behind the Beat' },
    '*::': { name: 'Ahead of the Beat' },
    '-*+': { name: 'Low to High Impact' },
    '+*-': { name: 'High to Low Impact' },
    '[*]': { name: 'Even Impact' },
};

// VIII. OTHER CONCEPTS
export const HEAD_OVER_HOP_CONCEPT = {
    'HO': { name: 'Head Over Hop', description: 'Habitualize placing head over the hip receiving energy for stability.' },
};
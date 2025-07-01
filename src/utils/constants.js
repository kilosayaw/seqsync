// =================================================================================================
// SĒQsync Project Constants - The Single Source of Truth for Configuration (Definitive Version)
// =================================================================================================

// I. CORE TIMING & SEQUENCE STRUCTURE
export const UI_PADS_PER_BAR = 16;
export const DATA_DEFAULT_BEATS_PER_BAR = 16;
export const BARS_PER_SEQUENCE = 4;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 30;
export const BPM_MAX = 300;
export const DEFAULT_TIME_SIGNATURE = { beatsPerBar: 4, beatUnit: 4 };
export const TAP_TEMPO_MIN_TAPS = 3;
export const TAP_TEMPO_MAX_INTERVAL_MS = 2000;
export const ONSET_DETECTION_CONFIG = { FRAME_SIZE: 1024, HOP_SIZE: 512, PEAK_THRESHOLD: 1.35, REFRACTORY_PERIOD_SAMPLES: 8192, };

// II. APPLICATION MODES & UI SETTINGS
export const MODES = { SEQ: 'SEQ', POS: 'POS', SYNC: 'SYNC' };
export const DEFAULT_FADER_MODE = 'WEIGHT';
export const SKIP_OPTIONS = [1, 2, 4, 8, 16];

// III. AUDIO CONFIGURATION
export const MAX_SOUNDS_PER_BEAT = 4;

// IV. JOINT, POSE, & SKELETON DEFINITIONS (SINGLE SOURCE OF TRUTH)
export const ALL_JOINTS_MAP = { H: { name: 'Head', group: 'Center' }, N: { name: 'Neck', group: 'Center' }, CHEST: { name: 'Chest Center', group: 'Center' }, SPIN_T: { name: 'Thoracic Spine', group: 'Center' }, SPIN_L: { name: 'Lumbar Spine', group: 'Center' }, PELV: { name: 'Pelvis Center', group: 'Center' }, LS: { name: 'L Shoulder', group: 'Left' }, RS: { name: 'R Shoulder', group: 'Right' }, LE: { name: 'L Elbow', group: 'Left' }, RE: { name: 'R Elbow', group: 'Right' }, LW: { name: 'L Wrist', group: 'Left' }, RW: { name: 'R Wrist', group: 'Right' }, LP: { name: 'L Palm', group: 'Left' }, RP: { name: 'R Palm', group: 'Right' }, LH: { name: 'L Hip', group: 'Left' }, RH: { name: 'R Hip', group: 'Right' }, LK: { name: 'L Knee', group: 'Left' }, RK: { name: 'R Knee', group: 'Right' }, LA: { name: 'L Ankle', group: 'Left' }, RA: { name: 'R Ankle', group: 'Right' }, LF: { name: 'L Foot Base', group: 'Left' }, RF: { name: 'R Foot Base', group: 'Right' }};
export const POSE_DEFAULT_VECTOR = {x:0,y:0,z:0};

// CONSOLIDATED AND DERIVED JOINT LIST
export const JOINT_LIST = Object.entries(ALL_JOINTS_MAP).map(([id, data]) => ({ id, name: data.name, group: data.group }));

// V. SKELETAL VISUALIZER CONSTANTS
export const BODY_SEGMENTS = [ {from:'N',to:'H'},{from:'CHEST',to:'N'}, {from:'CHEST',to:'LS'},{from:'CHEST',to:'RS'}, {from:'LS',to:'LE'},{from:'RS',to:'RE'}, {from:'LE',to:'LW'},{from:'RE',to:'RW'}, {from:'LW',to:'LP'},{from:'RW',to:'RP'}, {from:'CHEST',to:'SPIN_T'},{from:'SPIN_T',to:'SPIN_L'}, {from:'SPIN_L',to:'PELV'}, {from:'PELV',to:'LH'},{from:'PELV',to:'RH'}, {from:'LH',to:'LK'},{from:'RH',to:'RK'}, {from:'LK',to:'LA'},{from:'RK',to:'RA'}, {from:'LA',to:'LF'},{from:'RA',to:'RF'} ];
export const DEFAULT_JOINT_CIRCLE_RADIUS = 5;
export const Z_DEPTH_JOINT_SCALES = { NEAR: 1.25, NEUTRAL: 1.0, FAR: 0.75 };
export const RIBBON_LIMB_WIDTH = 12; 
export const SVG_WIDTH_DEFAULT = 220;
export const SVG_HEIGHT_DEFAULT = 300;
export const DEFAULT_POSITIONS_2D = { H: {x:0.50,y:0.10}, N: {x:0.50,y:0.18}, CHEST:{x:0.50,y:0.25}, SPIN_T:{x:0.50,y:0.32}, SPIN_L:{x:0.50,y:0.40}, PELV:{x:0.50,y:0.48}, LS: {x:0.38,y:0.26}, RS: {x:0.62,y:0.26}, LE: {x:0.30,y:0.38}, RE: {x:0.70,y:0.38}, LW: {x:0.25,y:0.54}, RW: {x:0.75,y:0.54}, LP: {x:0.23,y:0.60}, RP: {x:0.77,y:0.60}, LH: {x:0.42,y:0.50}, RH: {x:0.58,y:0.50}, LK: {x:0.40,y:0.70}, RK: {x:0.60,y:0.70}, LA: {x:0.38,y:0.88}, RA: {x:0.62,y:0.88}, LF: {x:0.37,y:0.95}, RF: {x:0.63,y:0.95} };

// VI. NOTATION & POSE MODIFIER OPTIONS
export const INTENT_OPTIONS = [
    { value: 'StrikeRelease', label: 'Strike' }, { value: 'BlockImpact', label: 'Block' }, { value: 'Evasion', label: 'Evade' }, { value: 'Coil', label: 'Coil' }, { value: 'ReleasePwr', label: 'Release' }, { value: 'PassThrough', label: 'Pass-Thru' }, { value: 'Stabilize', label: 'Stabilize' }, { value: 'Recover', label: 'Recover' },
];

// VII. TRANSITION & ANIMATION CURVES
export const TRANSITION_CURVES = { LINEAR: { label: 'Linear', function: (t) => t }, EASE_IN: { label: 'Ease In', function: (t) => t * t }, EASE_OUT: { label: 'Ease Out', function: (t) => t * (2 - t) }, EASE_IN_OUT: { label: 'Ease In-Out', function: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) }, BOUNCE_OUT: { label: 'Bounce Out', function: (t) => { const n1 = 7.5625; const d1 = 2.75; if (t < 1 / d1) return n1 * t * t; if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75; if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375; return n1 * (t -= 2.625 / d1) * t + 0.984375; }}, ELASTIC_OUT: { label: 'Elastic Out', function: (t) => { const c4 = (2 * Math.PI) / 3; return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1; }}, };

// VIII. VECTOR GRID & INPUT MAPPINGS
export const VECTOR_GRID_CELLS = [ {x: -1, y: 1, desc: 'Up-Left'}, {x: 0, y: 1, desc: 'Up'}, {x: 1, y: 1, desc: 'Up-Right'}, {x: -1, y: 0, desc: 'Left'}, {x: 0, y: 0, desc: 'Center'}, {x: 1, y: 0, desc: 'Right'}, {x: -1, y:-1, desc: 'Down-Left'}, {x: 0, y:-1, desc: 'Down'}, {x: 1, y:-1, desc: 'Down-Right'} ];
export const Z_DEPTH_CONFIG = { '1': { value: 1, label: 'Forward', color: 'bg-blue-400', sizeClasses: 'w-6 h-6' }, '0': { value: 0, label: 'Neutral', color: 'bg-yellow-400', sizeClasses: 'w-4 h-4' }, '-1': { value: -1, label: 'Backward', color: 'bg-red-400', sizeClasses: 'w-2 h-2' }};

// IX. KEYBOARD CONTROLS
export const KEYBOARD_LAYOUT_MODE_SEQ = { '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, 'q':8, 'w':9, 'e':10,'r':11,'t':12,'y':13,'u':14,'i':15 };
export const KEYBOARD_MODE_SWITCH = { 'p': MODES.POS, 's': MODES.SEQ, };
export const KEYBOARD_TRANSPORT_CONTROLS = { ' ': 'playPause', 'Enter': 'stop' };
export const KEYBOARD_FOOT_GROUNDING = { 'z': { side: 'L', points: ['L1'] }, 'x': { side: 'L', points: ['L2'] }, 'c': { side: 'L', points: ['L3'] }, ',': { side: 'R', points: ['R1'] }, '.': { side: 'R', points: ['R2'] }, '/': { side: 'R', points: ['R3'] }, };

// X. FOOT CONTACT ZONES for Joystick Interaction
export const FOOT_CONTACT_ZONES = {
  L: [ { name: 'L1', notation: 'L1', cx: 0.68, cy: 0.5, radius: 0.12 }, { name: 'L2', notation: 'L2', cx: 0.32, cy: 0.5, radius: 0.12 }, { name: 'L3', notation: 'L3', cx: 0.5, cy: 0.8, radius: 0.15 }, { name: 'L13', notation: 'L13', cx: 0.6, cy: 0.65, radius: 0.1 }, { name: 'L23', notation: 'L23', cx: 0.4, cy: 0.65, radius: 0.1 }, { name: 'L12', notation: 'L12', cx: 0.5, cy: 0.45, radius: 0.1 }, { name: 'L12T345', notation: 'L12T345', cx: 0.35, cy: 0.25, radius: 0.1 }, { name: 'L12T12', notation: 'L12T12', cx: 0.65, cy: 0.25, radius: 0.1 }, ],
  R: [ { name: 'R1', notation: 'R1', cx: 0.32, cy: 0.5, radius: 0.12 }, { name: 'R2', notation: 'R2', cx: 0.68, cy: 0.5, radius: 0.12 }, { name: 'R3', notation: 'R3', cx: 0.5, cy: 0.8, radius: 0.15 }, { name: 'R13', notation: 'R13', cx: 0.4, cy: 0.65, radius: 0.1 }, { name: 'R23', notation: 'R23', cx: 0.6, cy: 0.65, radius: 0.1 }, { name: 'R12', notation: 'R12', cx: 0.5, cy: 0.45, radius: 0.1 }, { name: 'R12T345', notation: 'R12T345', cx: 0.65, cy: 0.25, radius: 0.1 }, { name: 'R12T12', notation: 'R12T12', cx: 0.35, cy: 0.25, radius: 0.1 }, ],
};

// XI. STRIKE & GROUNDING DATA
export const STRIKE_ANGLES = { 1: { angle: 315, vector: { x: -0.707, y: 0.707, z: 0 }, desc: "Downward diagonal strike from right shoulder" }, 2: { angle: 225, vector: { x: -0.707, y: -0.707, z: 0 }, desc: "Upward diagonal strike from right knee" }, 3: { angle: 0, vector: { x: -1, y: 0, z: 0 }, desc: "Horizontal strike from right to left" }, 4: { angle: 180, vector: { x: 1, y: 0, z: 0 }, desc: "Horizontal strike from left to right" }, 5: { angle: 270, vector: { x: 0, y: -1, z: 0 }, desc: "Straight thrust to the torso" }, 6: { angle: 315, vector: { x: -0.707, y: 0.707, z: 0 }, desc: "Downward diagonal thrust to right chest" }, 7: { angle: 225, vector: { x: -0.707, y: -0.707, z: 0 }, desc: "Downward diagonal thrust to left chest" }, 8: { angle: 135, vector: { x: 0.707, y: -0.707, z: 0 }, desc: "Upward diagonal strike from left knee" }, 9: { angle: 45, vector: { x: 0.707, y: 0.707, z: 0 }, desc: "Downward diagonal strike from left shoulder" }, 10: { angle: 270, vector: { x: 0, y: -1, z: 0 }, desc: "Thrust to the right eye" }, 11: { angle: 270, vector: { x: 0, y: -1, z: 0 }, desc: "Thrust to the left eye" }, 12: { angle: 270, vector: { x: 0, y: 1, z: 0 }, desc: "Downward vertical strike to the crown" } };
export const GROUNDING_STATES = {
  L_FULL: '/ground/foot-left.png', R_FULL: '/ground/foot-right.png', L1: '/ground/L1.png', L1T1: '/ground/L1T1.png', L1T123: '/ground/L1T123.png', L2: '/ground/L2.png', L2T5: '/ground/L2T5.png', L2T345: '/ground/L2T345.png', L3: '/ground/L3.png', L12: '/ground/L12.png', L12T12345: '/ground/L12T12345.png', L13: '/ground/L13.png', L13T1: '/ground/L13T1.png', L23: '/ground/L23.png', L23T1: '/ground/L23T1.png', L123T12345: '/ground/L123T12345.png', LT1: '/ground/LT1.png', LT12: '/ground/LT12.png', LT345: '/ground/LT345.png', LT12345: '/ground/LT12345.png', R1: '/ground/R1.png', R1T1: '/ground/R1T1.png', R1T123: '/ground/R1T123.png', R2: '/ground/R2.png', R2T5: '/ground/R2T5.png', R2T345: '/ground/R2T345.png', R3: '/ground/R3.png', R12: '/ground/R12.png', R12T12345: '/ground/R12T12345.png', R13: '/ground/R13.png', R13T1: '/ground/R13T1.png', R23: '/ground/R23.png', R23T1: '/ground/R23T1.png', R123T12345: '/ground/R123T12345.png', RT1: '/ground/RT1.png', RT12: '/ground/RT12.png', RT345: '/ground/RT345.png', RT12345: '/ground/RT12345.png',
};
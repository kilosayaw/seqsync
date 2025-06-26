// src/utils/constants.js

// --- MODES ---
export const MODE_SEQ = 'SEQ';
export const MODE_POS = 'POS';
export const MODE_SYNC = 'SYNC';

// --- SEQUENCER & BPM DEFAULTS ---
export const DEFAULT_BPM = 120;
export const BPM_MIN = 30;
export const BPM_MAX = 300;
export const DEFAULT_TIME_SIGNATURE = { beatsPerBar: 4, beatUnit: 4 };
export const DEFAULT_NUM_BEATS_PER_BAR_CONST = 16;
export const INTERNAL_SEQUENCER_RESOLUTION = 96;
export const MAX_SOUNDS_PER_BEAT = 4;
export const MAX_BEATS_PER_BAR_HARD_LIMIT = 32; // For time signature changes

// --- TAP TEMPO CONSTANTS --- (NEWLY ADDED SECTION)
export const TAP_TEMPO_MIN_TAPS = 3; // Minimum taps to calculate BPM (e.g., 3 taps for 2 intervals)
export const TAP_TEMPO_MAX_INTERVAL_MS = 2000; // Max milliseconds between taps before history resets (2 seconds)

// --- UI & DISPLAY CONSTANTS ---
export const DEBOUNCE_DELAY = 250;
export const BEATS_PER_ROW_DISPLAY = 8;

// ... (rest of your constants.js file remains the same) ...

// --- DEFAULT JOINT PROPERTIES ---
export const DEFAULT_JOINT_ROTATION = 0;
export const DEFAULT_JOINT_VECTOR = { x: 0, y: 0, z: 0, x_base_direction: 0, y_base_direction: 0 };
export const DEFAULT_INTENT = 'Neutral';
export const DEFAULT_JOINT_ENERGY = 50;

// --- POSE EDITOR OPTIONS (JointInputPanel) ---
export const GENERAL_ORIENTATION_OPTIONS = [
  { value: 'NEU', label: 'Neutral (Std)' }, { value: 'IN', label: 'Internal Rot.' }, { value: 'OUT', label: 'External Rot.' },
  { value: 'FLEX', label: 'Flexion (Gen)' }, { value: 'EXT', label: 'Extension (Gen)' },
  { value: 'PRO', label: 'Pronation' }, { value: 'SUP', label: 'Supination' },
  // Consider adding common spinal/head orientations here too if not handled by specific joints
  { value: 'SPIN_FLEX', label: 'Spine Flexion' }, { value: 'SPIN_EXT', label: 'Spine Extension' },
  { value: 'SPIN_LAT_L', label: 'Spine Lat.Bend L' }, { value: 'SPIN_LAT_R', label: 'Spine Lat.Bend R' },
  { value: 'SPIN_ROT_L', label: 'Spine Rotate L' }, { value: 'SPIN_ROT_R', label: 'Spine Rotate R' },
];
export const DEFAULT_GENERAL_ORIENTATION = 'NEU';

export const INTENT_OPTIONS = [
  { value: 'Neutral', label: 'Neutral Intent' }, { value: 'Load', label: 'Load/Coil/Chamber' },
  { value: 'Release', label: 'Release/Strike/Extend' }, { value: 'Hold', label: 'Hold/Stabilize/Brace' },
  { value: 'Flow', label: 'Flow/Transition' }, { value: 'Recoil', label: 'Recoil/Reset' },
  { value: 'Impact', label: 'Impact/Land/Absorb' }, { value: 'Eject', label: 'Eject/Push' },
  { value: 'Redirect', label: 'Redirect/Evade' }, { value: 'Float', label: 'Float/Suspend' },
  { value: 'Ground', label: 'Ground/Settle' }, { value: 'Reach', label: 'Reach/Explore' },
  { value: 'Snap', label: 'Snap/Whip' }, { value: 'Pulse', label: 'Pulse/Accent' },
];
// DEFAULT_INTENT is already defined

export const ENERGY_LEVEL_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

// ANKLE SPECIFIC ORIENTATIONS
export const ANKLE_SAGITTAL_OPTIONS = [
  { value: 'NEUTRAL_SAG', label: 'Neutral Sagittal' },
  { value: 'DORSIFLEX_MIN', label: 'Dorsiflexion Min' }, { value: 'DORSIFLEX_MED', label: 'Dorsiflexion Med' }, { value: 'DORSIFLEX_MAX', label: 'Dorsiflexion Max' },
  { value: 'PLANTARFLEX_MIN', label: 'Plantarflexion Min' }, { value: 'PLANTARFLEX_MED', label: 'Plantarflexion Med' }, { value: 'PLANTARFLEX_MAX', label: 'Plantarflexion Max' },
];
export const DEFAULT_ANKLE_SAGITTAL = 'NEUTRAL_SAG';

export const ANKLE_FRONTAL_OPTIONS = [
  { value: 'NEUTRAL_FRON', label: 'Neutral Frontal' },
  { value: 'INVERSION_MIN', label: 'Inversion Min' }, { value: 'INVERSION_MED', label: 'Inversion Med' }, { value: 'INVERSION_MAX', label: 'Inversion Max' },
  { value: 'EVERSION_MIN', label: 'Eversion Min' }, { value: 'EVERSION_MED', label: 'Eversion Med' }, { value: 'EVERSION_MAX', label: 'Eversion Max' },
];
export const DEFAULT_ANKLE_FRONTAL = 'NEUTRAL_FRON';

export const ANKLE_TRANSVERSE_OPTIONS = [
  { value: 'NEUTRAL_TRA', label: 'Neutral Transverse' },
  { value: 'ADDUCT_FOOT_MIN', label: 'Adduct Min (Int.Rot)' }, { value: 'ADDUCT_FOOT_MED', label: 'Adduct Med' }, { value: 'ADDUCT_FOOT_MAX', label: 'Adduct Max' },
  { value: 'ABDUCT_FOOT_MIN', label: 'Abduct Min (Ext.Rot)' }, { value: 'ABDUCT_FOOT_MED', label: 'Abduct Med' }, { value: 'ABDUCT_FOOT_MAX', label: 'Abduct Max' },
];
export const DEFAULT_ANKLE_TRANSVERSE = 'NEUTRAL_TRA';

// --- VECTOR GRID & DISPLACEMENT (JointInputPanel) ---
export const VECTOR_GRID_INCREMENT = 0.25;
export const NUDGE_INCREMENT_OPTIONS = [
  { value: 0.01, label: '0.01 (Micro)' }, { value: 0.025, label: '0.025 (Fine)' },
  { value: 0.05, label: '0.05 (Small)' }, { value: 0.1, label: '0.1 (Medium)' },
  { value: 0.25, label: '0.25 (Large)' },
];
export const DEFAULT_NUDGE_INCREMENT = 0.05;

export const Z_DEPTH_CONFIG = {
  '-1':   { value: -1,   label: 'N', title: 'Z: -1 (Nearer)',  color: 'bg-red-500',   activeColor: 'bg-red-400',   ring: 'ring-red-300',   sizeClasses: 'w-4/5 h-4/5' },
  '-0.5': { value: -0.5, label: 'n', title: 'Z: -0.5 (Mod. Nearer)',color: 'bg-red-600/80',activeColor: 'bg-red-500/90',ring: 'ring-red-400/80',sizeClasses: 'w-3/4 h-3/4' },
  '0':    { value: 0,    label: 'M', title: 'Z: 0 (Middle)',    color: 'bg-gray-500',  activeColor: 'bg-gray-400',  ring: 'ring-gray-300',  sizeClasses: 'w-3/5 h-3/5' },
  '0.5':  { value: 0.5,  label: 'f', title: 'Z: +0.5 (Mod. Farther)',   color: 'bg-blue-600/80',activeColor: 'bg-blue-500/90',ring: 'ring-blue-400/80',sizeClasses: 'w-1/2 h-1/2' },
  '1':    { value: 1,    label: 'F', title: 'Z: +1 (Farther)',  color: 'bg-blue-500',  activeColor: 'bg-blue-400',  ring: 'ring-blue-300',  sizeClasses: 'w-2/5 h-2/5' }
};
export const Z_RENDER_ORDER = [-1, -0.5, 0, 0.5, 1];

export const VECTOR_GRID_CELLS = [
  { x: -1, y: 1, desc: "Up-Left" },   { x: 0, y: 1, desc: "Up" },    { x: 1, y: 1, desc: "Up-Right" },
  { x: -1, y: 0, desc: "Left" },    { x: 0, y: 0, desc: "Center (Tap to Cycle Z)" }, { x: 1, y: 0, desc: "Right" },
  { x: -1, y: -1, desc: "Down-Left" }, { x: 0, y: -1, desc: "Down" },  { x: 1, y: -1, desc: "Down-Right" },
];

// --- FOOT JOYSTICK MAPS & ANGLES ---
export const LEFT_FOOT_JOYSTICK_MAP = {
  CENTER_TAP: { points: ['LF123T12345'], label: 'L Full Plant Tap' },
  N:    { points: ['L12T12345'], label: 'L Ball 1&2 + All Toes' },
  NE:   { points: ['L12T12'],    label: 'L Ball 1&2 + Toes 1&2' },
  E:    { points: ['L1'],        label: 'L Inner Ball (L1)' },
  SE:   { points: ['L13'],       label: 'L Inner Blade (L1+L3)' },
  S:    { points: ['L3'],        label: 'L Heel (L3)' },
  SW:   { points: ['L23'],       label: 'L Outer Blade (L2+L3)' },
  W:    { points: ['L2'],        label: 'L Outer Ball (L2)' },
  NW:   { points: ['L12T345'],   label: 'L Ball 1&2 + Toes 3,4,5' },
};

export const RIGHT_FOOT_JOYSTICK_MAP = {
  CENTER_TAP: { points: ['RF123T12345'], label: 'R Full Plant Tap' },
  N:    { points: ['RF12T12345'], label: 'R Ball 1&2 + All Toes' },
  NE:   { points: ['RF12T12'],    label: 'R Ball 1&2 + Toes 1&2' },
  E:    { points: ['RF1'],        label: 'R Inner Ball (R1)' },
  SE:   { points: ['RF13'],       label: 'R Inner Blade (R1+R3)' },
  S:    { points: ['RF3'],        label: 'R Heel (R3)' },
  SW:   { points: ['RF23'],       label: 'R Outer Blade (R2+R3)' },
  W:    { points: ['RF2'],        label: 'R Outer Ball (R2)' },
  NW:   { points: ['RF12T345'],   label: 'R Ball 1&2 + Toes 3,4,5' },
};

// For mapping angles to zones (0 degrees is East/Right, 90 is North, -90 is South, +/-180 is West)
export const JOYSTICK_ZONES_ANGLES = [
  { zone: 'E',  minAngle: -22.5, maxAngle: 22.5, label: 'East (Inner Ball/Edge)' },
  { zone: 'NE', minAngle: 22.5,  maxAngle: 67.5, label: 'North-East (Inner Toes & Ball)' },
  { zone: 'N',  minAngle: 67.5,  maxAngle: 112.5, label: 'North (Full Toes & Ball)' },
  { zone: 'NW', minAngle: 112.5, maxAngle: 157.5, label: 'North-West (Outer Toes & Ball)' },
  { zone: 'W',  minAngle: 157.5, maxAngle: 180.001, label: 'West (Outer Ball/Edge)' }, // Catches +180
  { zone: 'W_NEG',minAngle: -180, maxAngle: -157.5, label: 'West (Outer Ball/Edge, neg angle)' }, // Catches -180
  { zone: 'SW', minAngle: -157.5,maxAngle: -112.5, label: 'South-West (Outer Blade)' },
  { zone: 'S',  minAngle: -112.5,maxAngle: -67.5, label: 'South (Heel)' },
  { zone: 'SE', minAngle: -67.5, maxAngle: -22.5, label: 'South-East (Inner Blade)' },
];

export const getZoneFromCoordinates = (x, y, centerX, centerY, radius) => {
    const dx = x - centerX;
    const dy = centerY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < radius * 0.30) { // Increased dead-zone slightly to 30% for center tap reliability
      return 'CENTER_TAP';
    }
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Check West first due to +/- 180 ambiguity
    if (angle > 157.5 || angle <= -157.5) return 'W';

    for (const zoneDef of JOYSTICK_ZONES_ANGLES) {
      if (zoneDef.zone === 'W' || zoneDef.zone === 'W_NEG') continue; // Already handled
      if (angle >= zoneDef.minAngle && angle < zoneDef.maxAngle) {
        return zoneDef.zone;
      }
    }
    return null;
};

// --- BEAT OBJECT STRUCTURE & DEFAULTS ---
export const createDefaultBeatObject = (beatIndexInBar) => ({
  id: beatIndexInBar,
  sounds: [],
  grounding: { L: null, R: null, L_weight: 50 },
  syllable: '',
  headOver: null,
  jointInfo: {},
  mediaCuePoint: null,
});

export const createNewBarData = (numBeats = DEFAULT_NUM_BEATS_PER_BAR_CONST) => {
  // Ensure numBeats is a valid positive integer, otherwise use default
  const validNumBeats = (Number.isInteger(numBeats) && numBeats > 0)
                          ? numBeats
                          : DEFAULT_NUM_BEATS_PER_BAR_CONST;
  return Array(validNumBeats).fill(null).map((_, i) => createDefaultBeatObject(i));
};

// --- SKELETAL VISUALIZATION CONSTANTS ---
export const DEFAULT_POSITIONS_2D = { /* ... (Your full list as provided before) ... */
  HEAD: { x: 0.5, y: 0.1 }, NECK: { x: 0.5, y: 0.18 }, SPIN_T: { x: 0.5, y: 0.28 }, PELV: { x: 0.5, y: 0.48 },
  L_SHO:  { x: 0.4, y: 0.28 }, L_ELB:  { x: 0.3, y: 0.38 }, L_WRST: { x: 0.25, y: 0.48 }, L_HAND: { x: 0.2, y: 0.55 },
  R_SHO:  { x: 0.6, y: 0.28 }, R_ELB:  { x: 0.7, y: 0.38 }, R_WRST: { x: 0.75, y: 0.48 }, R_HAND: { x: 0.8, y: 0.55 },
  L_HIP:  { x: 0.45, y: 0.5 }, L_KNEE: { x: 0.45, y: 0.68 }, L_ANK:  { x: 0.45, y: 0.85 }, L_FOOT: { x: 0.45, y: 0.95 },
  R_HIP:  { x: 0.55, y: 0.5 }, R_KNEE: { x: 0.55, y: 0.68 }, R_ANK:  { x: 0.55, y: 0.85 }, R_FOOT: { x: 0.55, y: 0.95 },
  CHEST: { x: 0.5, y: 0.28 } // Adding CHEST for consistency with BODY_SEGMENTS if SPIN_T not always primary upper anchor
};
export const BODY_SEGMENTS = [ /* ... (Your full list as provided before) ... */
  { from: 'NECK', to: 'HEAD' }, { from: 'CHEST', to: 'NECK' }, { from: 'CHEST', to: 'L_SHO' },  { from: 'CHEST', to: 'R_SHO' },
  { from: 'L_SHO', to: 'L_ELB' },  { from: 'R_SHO', to: 'R_ELB' }, { from: 'L_ELB', to: 'L_WRST' }, { from: 'R_ELB', to: 'R_WRST' },
  { from: 'L_WRST', to: 'L_HAND' }, { from: 'R_WRST', to: 'R_HAND' }, { from: 'SPIN_T', to: 'CHEST' },  { from: 'SPIN_L', to: 'SPIN_T'},
  { from: 'PELV', to: 'SPIN_L' }, { from: 'PELV', to: 'L_HIP' },    { from: 'PELV', to: 'R_HIP' }, { from: 'L_HIP', to: 'L_KNEE' },
  { from: 'R_HIP', to: 'R_KNEE' }, { from: 'L_KNEE', to: 'L_ANK' },  { from: 'R_KNEE', to: 'R_ANK' }, { from: 'L_ANK', to: 'L_FOOT' },
  { from: 'R_ANK', to: 'R_FOOT' },
];

export const Z_DEPTH_JOINT_SCALES = { NEAR: 1.2, NEUTRAL: 1.0, FAR: 0.8 }; // Simplified for visualizer
export const SIDE_SELECTOR_JOINT_CIRCLE_BASE_RADIUS = 18;
export const DEFAULT_JOINT_CIRCLE_RADIUS = 8;

// --- SIDE JOINT SELECTOR ABBREVIATIONS ---
export const UI_LEFT_JOINTS_ABBREVS_NEW = [
  { abbrev: 'L_SHO', name: 'Left Shoulder' }, { abbrev: 'L_ELB', name: 'Left Elbow' },
  { abbrev: 'L_WRST', name: 'Left Wrist' },   { abbrev: 'L_HIP', name: 'Left Hip' },
  { abbrev: 'L_KNEE', name: 'Left Knee' },    { abbrev: 'L_ANK', name: 'Left Ankle' },
];
export const UI_RIGHT_JOINTS_ABBREVS_NEW = [
  { abbrev: 'R_SHO', name: 'Right Shoulder' }, { abbrev: 'R_ELB', name: 'Right Elbow' },
  { abbrev: 'R_WRST', name: 'Right Wrist' },  { abbrev: 'R_HIP', name: 'Right Hip' },
  { abbrev: 'R_KNEE', name: 'Right Knee' },   { abbrev: 'R_ANK', name: 'Right Ankle' },
];

// --- INTENT FLOW TRANSITIONS ---
export const INTENT_TRANSITIONS = {
  SMOOTH: '-*-', WAVY: '~*~', SHARP: '<*>', ON_BEAT: ':*:',
  ACCEL_IN: '/-*', DECEL_IN: '\\-*', ACCEL_OUT: '*-/', DECEL_OUT: '*-\\'
};
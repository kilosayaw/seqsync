// src/utils/constants.js

// Import sound data structures from sounds.js
import { 
    tr808SoundsArray, 
    tr808SoundKeysOrdered,
    // Import other sound arrays if you have more kits:
    // e.g., myCustomKitSoundsArray,
} from './sounds'; 

// --- Core Sequencer Grid ---
export const BEATS_PER_BAR = 16; // Fixed UI grid size for pads for consistent display
export const DEFAULT_NUM_BEATS_PER_BAR_CONST = 16; // Default for song data structure unless overridden by time signature context for musical interpretation
export const BARS_PER_SEQUENCE = 4; // Default number of bars
export const BEATS_PER_ROW_DISPLAY = 8; // For 2 rows of 8 pads

// --- BPM and Timing ---
export const DEFAULT_BPM = 120;
export const BPM_MIN = 20;
export const BPM_MAX = 400;
export const DEFAULT_TIME_SIGNATURE = { beatsPerBar: 4, beatUnit: 4 }; // Musical time signature default
export const INTERNAL_SEQUENCER_RESOLUTION = 480; 
export const TAP_TEMPO_MIN_TAPS = 3;
export const TAP_TEMPO_MAX_INTERVAL_MS = 2500;

// --- Application Modes ---
export const MODES = { SEQ: 'SEQ', POS: 'POS', SYNC: 'SYNC' };
export const MODE_SEQ = 'SEQ'; 
export const MODE_POS = 'POS'; 
export const MODE_SYNC = 'SYNC';

// --- Keyboard Mappings ---
export const KEYBOARD_LAYOUT_MODE_SEQ = { // For triggering pads 0-15
  '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7,
  'q':8, 'w':9, 'e':10,'r':11,'t':12,'y':13,'u':14,'i':15
};
export const KEYBOARD_MODE_SWITCH = { // Keys for switching modes
  's': MODES.SEQ,
  'p': MODES.POS,
  'c': MODES.SYNC, // Example, adjust as needed
};
export const KEYBOARD_TRANSPORT_CONTROLS = { // For global transport
  ' ': 'playPause',
  'Enter': 'stop', // Or use a modified Enter like Ctrl+Enter if Enter alone is problematic
  // ArrowLeft & ArrowRight are handled with shift modifier check in StepSequencerControls
};
export const KEYBOARD_NAVIGATION_POS_MODE = { // For POS mode beat navigation
  '[': 'prevBeat', // Example, choose keys that don't conflict
  ']': 'nextBeat',
};
export const KEYBOARD_JOINT_NUDGE_CONTROLS = { // For POS mode joint vector nudging
  'j':{axis:'x',delta:-0.05}, 'l':{axis:'x',delta:0.05},
  'i':{axis:'y',delta:0.05},  'k':{axis:'y',delta:-0.05},
  'u':{axis:'z',delta:-0.1},  'o':{axis:'z',delta:0.1}
};
// Grounding Hotkeys (You will define these based on your desired mappings)
export const KEYBOARD_FOOT_GROUNDING = {
  'a': { side: 'L', points: ['LF123T12345'], label: "L Full Plant" }, // Example
  's': { side: 'L', points: ['LF1', 'LF2'], label: "L Ball Only" },     // Example
  // ... add your other grounding hotkeys for left and right foot
};


// --- Sound and Audio ---
export const MAX_SOUNDS_PER_BEAT = 4;
export const DEFAULT_SOUND_KIT_NAME = "TR-808";

const tr808FileMap = tr808SoundsArray.reduce((acc, sound) => {
  acc[sound.name] = sound.url;
  return acc;
}, {});

export const DEFAULT_SOUND_KIT = {
  name: DEFAULT_SOUND_KIT_NAME,
  displayName: "TR-808 (Technopolis)",
  sounds: tr808SoundsArray,
  fileMap: tr808FileMap,
};

export const AVAILABLE_KITS = [
  DEFAULT_SOUND_KIT,
  // Add other fully defined kits here:
  // { name: "MyKit", displayName: "My Awesome Kit", sounds: myKitSoundsArray, fileMap: myKitFileMap },
];

// --- ALL_JOINTS_MAP ---
export const ALL_JOINTS_MAP = {
  H: { name: 'Head' }, N: { name: 'Neck' },
  LS: { name: 'L Shoulder' }, RS: { name: 'R Shoulder' },
  LE: { name: 'L Elbow' }, RE: { name: 'R Elbow' },
  LW: { name: 'L Wrist' }, RW: { name: 'R Wrist' },
  LP: { name: 'L Palm' }, RP: { name: 'R Palm' },
  T: { name: 'Torso Core' }, PELV: { name: 'Pelvis Center' },
  SPIN_L: { name: 'Lumbar Spine' }, SPIN_T: { name: 'Thoracic Spine' },
  CHEST: { name: 'Chest Center' },
  LH: { name: 'L Hip' }, RH: { name: 'R Hip' },
  LK: { name: 'L Knee' }, RK: { name: 'R Knee' },
  LA: { name: 'L Ankle' }, RA: { name: 'R Ankle' },
  LF: { name: 'L Foot Base' }, RF: { name: 'R Foot Base' },
};

// --- UI Joint Lists (For SideJointSelector) ---
export const UI_LEFT_JOINTS_ABBREVS_NEW = [
  { abbrev: 'LS', name: ALL_JOINTS_MAP['LS']?.name }, { abbrev: 'LE', name: ALL_JOINTS_MAP['LE']?.name },
  { abbrev: 'LW', name: ALL_JOINTS_MAP['LW']?.name }, { abbrev: 'LP', name: ALL_JOINTS_MAP['LP']?.name },
  { abbrev: 'LH', name: ALL_JOINTS_MAP['LH']?.name }, { abbrev: 'LK', name: ALL_JOINTS_MAP['LK']?.name },
  { abbrev: 'LA', name: ALL_JOINTS_MAP['LA']?.name }, { abbrev: 'LF', name: ALL_JOINTS_MAP['LF']?.name },
].filter(j => j.name);

export const UI_RIGHT_JOINTS_ABBREVS_NEW = [
  { abbrev: 'RS', name: ALL_JOINTS_MAP['RS']?.name }, { abbrev: 'RE', name: ALL_JOINTS_MAP['RE']?.name },
  { abbrev: 'RW', name: ALL_JOINTS_MAP['RW']?.name }, { abbrev: 'RP', name: ALL_JOINTS_MAP['RP']?.name },
  { abbrev: 'RH', name: ALL_JOINTS_MAP['RH']?.name }, { abbrev: 'RK', name: ALL_JOINTS_MAP['RK']?.name },
  { abbrev: 'RA', name: ALL_JOINTS_MAP['RA']?.name }, { abbrev: 'RF', name: ALL_JOINTS_MAP['RF']?.name },
].filter(j => j.name);

export const UI_CENTER_JOINTS_ABBREVS_NEW = [
    { abbrev: 'H', name: ALL_JOINTS_MAP['H']?.name }, { abbrev: 'N', name: ALL_JOINTS_MAP['N']?.name },
    { abbrev: 'CHEST', name: ALL_JOINTS_MAP['CHEST']?.name }, { abbrev: 'SPIN_T', name: ALL_JOINTS_MAP['SPIN_T']?.name },
    { abbrev: 'SPIN_L', name: ALL_JOINTS_MAP['SPIN_L']?.name }, { abbrev: 'PELV', name: ALL_JOINTS_MAP['PELV']?.name },
].filter(j => j.name);

// JOINT_SETS if SideJointSelector uses a single combined list (Alternative to UI_LEFT/RIGHT specific lists)
export const JOINT_SETS = {
  MAIN_JOINTS: [ /* ... combine and dedupe UI_LEFT, UI_RIGHT, UI_CENTER ... */ ]
};

// --- Pose and Joint Constants ---
export const POSE_DEFAULT_VECTOR = {x:0,y:0,z:0,x_base_direction:0,y_base_direction:0};
export const Z_RENDER_ORDER = [0, 1, -1]; // M, F, N
export const NUDGE_INCREMENT_OPTIONS = [
  {value:0.001,label:'0.001'},{value:0.005,label:'0.005'},{value:0.01,label:'0.01'},
  {value:0.025,label:'0.025'},{value:0.05,label:'0.05'},{value:0.1,label:'0.1'}
];
export const DEFAULT_NUDGE_INCREMENT = 0.05;
export const VECTOR_GRID_CELLS = [
  {x:-1,y:1,desc:"Up-Left"},  {x:0,y:1,desc:"Up"},     {x:1,y:1,desc:"Up-Right"},
  {x:-1,y:0,desc:"Left"},     {x:0,y:0,desc:"Center/Z-Cycle"}, {x:1,y:0,desc:"Right"},
  {x:-1,y:-1,desc:"Down-Left"},{x:0,y:-1,desc:"Down"},   {x:1,y:-1,desc:"Down-Right"}
];
export const VECTOR_GRID_INCREMENT = 0.33; 
export const GRID_SNAP_INCREMENT_OPTIONS = [ {value: 0.05, label: '0.050 (Fine)'},{value: 0.1,  label: '0.100'},{value: 0.25, label: '0.250'},{value: 0.333, label: '0.333 (Default)'},{value: 0.5,  label: '0.500'},{value: 1.0,  label: '1.000 (Coarse)'} ];

export const Z_DEPTH_CONFIG = {
  "-1":{label:"N",color:"bg-red-600",activeColor:"bg-red-400",ring:"ring-2 ring-red-300",sizeClasses:"w-3 h-3"},
  "0":{label:"M",color:"bg-gray-500",activeColor:"bg-gray-300",ring:"ring-2 ring-gray-200",sizeClasses:"w-2.5 h-2.5"},
  "1":{label:"F",color:"bg-blue-600",activeColor:"bg-blue-400",ring:"ring-2 ring-blue-300",sizeClasses:"w-2 h-2"}
};

// --- Biomechanical Kernel Constants ---
// [NEW] This object centralizes the physical rules of the poSĒQr system.
export const BIOMECHANICAL_CONSTANTS = {
  KNEE_BOUNDS: {
    FULL_PLANT: { x: 0.5, y: 0, z: 0.7 },
    HEEL_UP:    { x: 0.6, y: 0, z: 1.0 },
    HEEL_ONLY:  { x: 0.7, y: 0, z: 0.2 },
    DEFAULT:    { x: 1.0, y: 1.0, z: 1.0 },
  },
  HIP_ROTATION: {
    DEFAULT_MIN: -45, // Max internal rotation
    DEFAULT_MAX: 45,  // Max external rotation
    CONSTRAINED_MIN: -15,
    CONSTRAINED_MAX: 15,
  },
  HIP_FLEXION: {
    DEFAULT_MIN: -30, // Max extension
    DEFAULT_MAX: 120, // Max flexion
    CONSTRAINED_MIN: -10,
  },
  THRESHOLDS: {
    NEAR_MAX_ROTATION: 40,
    DEEP_FLEXION: 100,
  },
  NORMALIZATION: {
    // Used to convert raw rotation values into a [-1, 1] or [0, 1] range.
    MAX_SHOULDER_HIP_TWIST: 90, // Max degrees of separation
    MAX_TOTAL_ROTATION_ENERGY: 180, // Sum of 4 joint rotations (4 * 45)
  }
};


// --- Skeletal Visualizer ---
export const SVG_WIDTH_DEFAULT=220; export const SVG_HEIGHT_DEFAULT=300;
export const DEFAULT_JOINT_CIRCLE_RADIUS=5; 
export const SKELETAL_VIZ_MODAL_DOT_RADIUS=4;
export const SKELETAL_VIZ_MODAL_HIGHLIGHT_MULTIPLIER=1.5;
export const Z_DEPTH_JOINT_SCALES={NEAR:1.25,NEUTRAL:1.0,FAR:0.75};
export const BODY_SEGMENTS=[
  {from:'N',to:'H'},{from:'CHEST',to:'N'}, {from:'CHEST',to:'LS'},{from:'CHEST',to:'RS'},
  {from:'LS',to:'LE'},{from:'RS',to:'RE'}, {from:'LE',to:'LW'},{from:'RE',to:'RW'},
  {from:'LW',to:'LP'},{from:'RW',to:'RP'}, {from:'CHEST',to:'SPIN_T'},{from:'SPIN_T',to:'SPIN_L'},
  {from:'SPIN_L',to:'PELV'}, {from:'PELV',to:'LH'},{from:'PELV',to:'RH'},
  {from:'LH',to:'LK'},{from:'RH',to:'RK'}, {from:'LK',to:'LA'},{from:'RK',to:'RA'},
  {from:'LA',to:'LF'},{from:'RA',to:'RF'}
];
export const DEFAULT_POSITIONS_2D={
  H:   {x:0.50,y:0.10}, N:   {x:0.50,y:0.18}, CHEST:{x:0.50,y:0.25},
  SPIN_T:{x:0.50,y:0.32}, SPIN_L:{x:0.50,y:0.40}, PELV:{x:0.50,y:0.48},
  LS:  {x:0.38,y:0.26}, RS:  {x:0.62,y:0.26}, LE:  {x:0.30,y:0.38}, RE:  {x:0.70,y:0.38},
  LW:  {x:0.25,y:0.54}, RW:  {x:0.75,y:0.54}, LP:  {x:0.23,y:0.60}, RP:  {x:0.77,y:0.60},
  LH:  {x:0.42,y:0.50}, RH:  {x:0.58,y:0.50}, LK:  {x:0.40,y:0.70}, RK:  {x:0.60,y:0.70},
  LA:  {x:0.38,y:0.88}, RA:  {x:0.62,y:0.88}, LF:  {x:0.37,y:0.95}, RF:  {x:0.63,y:0.95}
};

// --- Default Joint Values ---
export const DEFAULT_GENERAL_ORIENTATION='NEU';
export const DEFAULT_INTENT='Transition';
export const DEFAULT_JOINT_ENERGY=50;
export const ENERGY_LEVEL_LABELS={LOW:"Low (1-33)",MEDIUM:"Medium (34-66)",HIGH:"High (67-100)"};
export const DEFAULT_ANKLE_SAGITTAL='NEU_SAG';
export const DEFAULT_ANKLE_FRONTAL='NEU_FRON';
export const DEFAULT_ANKLE_TRANSVERSE='NEU_TRA';

export const GENERAL_ORIENTATION_OPTIONS=[
  {value:'NEU',label:'Neutral Rot/Align'},{value:'IN',label:'Internal Rotation'},{value:'OUT',label:'External Rotation'},
  {value:'FLEX',label:'Flexion (General)'},{value:'EXT',label:'Extension (General)'},
  {value:'L_BEND',label:'L Bend (Spine)'},{value:'R_BEND',label:'R Bend (Spine)'},
  {value:'PRO',label:'Pronation (Wrist/Forearm)'},{value:'SUP',label:'Supination (Wrist/Forearm)'},
  {value:'ULN_DEV',label:'Ulnar Deviation (Wrist)'},{value:'RAD_DEV',label:'Radial Deviation (Wrist)'},
];
export const INTENT_OPTIONS=[
  {value:'Transition',label:'Transition'},{value:'StrikePrep',label:'Strike Prep'},
  {value:'StrikeRelease',label:'Strike Release'},{value:'BlockPrep',label:'Block Prep'},
  {value:'BlockImpact',label:'Block Impact'},{value:'Evasion',label:'Evasion'},
  {value:'Grounding',label:'Grounding Shift'},{value:'Idle',label:'Idle/Stance'},
  {value:'Recover',label:'Recover/Reset'},{value:'Coil',label:'Coil Energy'},
  {value:'ReleasePwr',label:'Release Power'},{value:'Reach',label:'Reach'},
  {value:'Pull',label:'Pull'},{value:'Stabilize',label:'Stabilize'},
];
export const ANKLE_SAGITTAL_OPTIONS=[
  {value:'NEU_SAG',label:'Neutral (Sagittal)'},{value:'DORSI',label:'Dorsiflexion'},{value:'PLANTAR',label:'Plantarflexion'}
];
export const ANKLE_FRONTAL_OPTIONS=[
  {value:'NEU_FRON',label:'Neutral (Frontal)'},{value:'INVER',label:'Inversion'},{value:'EVER',label:'Eversion'}
];
export const ANKLE_TRANSVERSE_OPTIONS=[
  {value:'NEU_TRA',label:'Neutral (Transverse)'},{value:'ABD_TRA',label:'Abduction (Toes Out)'},{value:'ADD_TRA',label:'Adduction (Toes In)'}
];
export const SKIP_OPTIONS = [ // Added for PlaybackControls
  { value: "64", label: "1/64" }, { value: "32", label: "1/32" }, { value: "16", label: "1/16" },
  { value: "8", label: "1/8" },   { value: "4", label: "1/4" },    { value: "2", label: "1/2" },
  { value: "1", label: "Bar" } // "1" means skip interval is whole bar (uiPadsToRender / 1)
];


// --- Foot Grounding & Joystick ---
export const GROUND_ASSETS_BASE_PATH = '/assets/ground/';
export const WHEEL_IMAGE_PATH = '/assets/ground/foot-wheel.png';
export const JOYSTICK_RADIUS_PERCENT = 0.48; 
export const CENTER_TAP_RADIUS_PERCENT = 0.20;
export const HARD_CLICK_RADIUS_PERCENT = 0.35;

export const JOYSTICK_ZONES_ANGLES = {
  ZONE_E: { minAngle: -22.5, maxAngle: 22.5, label: "East (Outer Middle Foot)" },
  ZONE_NE: { minAngle: 22.5, maxAngle: 67.5, label: "North-East (Outer Toes/Ball)" },
  ZONE_N: { minAngle: 67.5, maxAngle: 112.5, label: "North (All Toes/Front Ball)" },
  ZONE_NW: { minAngle: 112.5, maxAngle: 157.5, label: "North-West (Inner Toes/Ball)" },
  ZONE_W: { minAngle: 157.5, maxAngle: 202.5, label: "West (Inner Middle Foot)" },
  ZONE_SW: { minAngle: 202.5, maxAngle: 247.5, label: "South-West (Inner Heel/Arch)" },
  ZONE_S: { minAngle: 247.5, maxAngle: 292.5, label: "South (Heel)" },
  ZONE_SE: { minAngle: 292.5, maxAngle: 337.5, label: "South-East (Outer Heel/Arch)" },
  CENTER_TAP: { label: "Center Tap (Lift Foot)" },
  CENTER_FULL_PLANT: { label: "Full Plant (Hard Click Center)" },
};

export const getZoneFromCoordinates = (x, y, centerX, centerY, radius, isHardClickIntent = false) => {
  const dx = x - centerX; const dy = centerY - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (isHardClickIntent && dist < radius * HARD_CLICK_RADIUS_PERCENT) return 'CENTER_FULL_PLANT';
  if (dist < radius * CENTER_TAP_RADIUS_PERCENT) return 'CENTER_TAP';
  if (dist > radius * 1.05) return null;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI); 
  if (angle < 0) angle += 360;
  if ((angle >= 337.5 || angle < 22.5)) return 'ZONE_E';   if (angle >= 22.5 && angle < 67.5) return 'ZONE_NE';
  if (angle >= 67.5 && angle < 112.5) return 'ZONE_N';     if (angle >= 112.5 && angle < 157.5) return 'ZONE_NW';
  if (angle >= 157.5 && angle < 202.5) return 'ZONE_W';    if (angle >= 202.5 && angle < 247.5) return 'ZONE_SW';
  if (angle >= 247.5 && angle < 292.5) return 'ZONE_S';    if (angle >= 292.5 && angle < 337.5) return 'ZONE_SE';
  return null; 
};

// These maps translate joystick zones to POSEQr™ grounding point *strings or arrays of strings*
// The strings should be keys in your GROUNDING_POINT_VERBOSE_MAP (in notationMaps.js)
// For example, 'LF123T12345' should be a key in GROUNDING_POINT_VERBOSE_MAP
export const LEFT_FOOT_JOYSTICK_MAP = {
  CENTER_TAP:         { points: null, label: "Left Foot Lifted" }, // null signifies no active grounding points
  CENTER_FULL_PLANT:  { points: ['LF123T12345'], label: "Left Full Foot Plant" },
  ZONE_N:  { points: ['LF12', 'LFT1', 'LFT2', 'LFT3', 'LFT4', 'LFT5'], label: "Left Toes & Ball Area" },
  ZONE_NE: { points: ['LF1T12'], label: "Left Inner Toes/Ball (Big & Pointer Area)" },
  ZONE_E:  { points: ['LF13'], label: "Left Inner Blade" },
  ZONE_SE: { points: ['LF3', 'LF1T1'], label: "Left Inner Heel & Big Toe/Ball Area" },
  ZONE_S:  { points: ['LF3'], label: "Left Heel" },
  ZONE_SW: { points: ['LF3', 'LF2'], label: "Left Outer Heel & Outer Ball Area" },
  ZONE_W:  { points: ['LF23'], label: "Left Outer Blade" },
  ZONE_NW: { points: ['LF12', 'LFT1Tip', 'LFT2Tip'], label: "Left Front Ball & Inner Toe Tips" }, // Example
};

export const RIGHT_FOOT_JOYSTICK_MAP = {
  CENTER_TAP:         { points: null, label: "Right Foot Lifted" },
  CENTER_FULL_PLANT:  { points: ['RF123T12345'], label: "Right Full Foot Plant" },
  ZONE_N:  { points: ['RF12', 'RFT1', 'RFT2', 'RFT3', 'RFT4', 'RFT5'], label: "Right Toes & Ball Area" },
  ZONE_NE: { points: ['RF1T12'], label: "Right Inner Toes/Ball (Big & Pointer Area)" },
  ZONE_E:  { points: ['RF13'], label: "Right Inner Blade" },
  ZONE_SE: { points: ['RF3', 'RF1T1'], label: "Right Inner Heel & Big Toe/Ball Area" },
  ZONE_S:  { points: ['RF3'], label: "Right Heel" },
  ZONE_SW: { points: ['RF3', 'RF2'], label: "Right Outer Heel & Outer Ball Area" },
  ZONE_W:  { points: ['RF23'], label: "Right Outer Blade" },
  ZONE_NW: { points: ['RF12', 'RFT1Tip', 'RFT2Tip'], label: "Right Front Ball & Inner Toe Tips" },
};

// --- UI Sizing Constants ---
export const MODAL_FOOT_DISPLAY_SIZE_CLASSES = "w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40";
export const MAIN_FOOT_DISPLAY_SIZE_CLASSES = "w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48";

// --- Default Initial Song Data Structure ---
export const createDefaultBeatObject = (beatId) => ({
  id: beatId, // 0-indexed
  sounds: [], // Array of sound names/keys
  // [UPGRADE] Add energy property to the default joint object structure
  jointInfo: {}, // e.g., { LS: { vector, rotation, extension, energy: 50 }, ... }
  grounding: { L: null, R: null, L_weight: 50 },
  syllable: null,
  headOver: null,
});

export const INITIAL_SONG_DATA = Array(BARS_PER_SEQUENCE).fill(null).map((_, barIndex) => ({
  id: barIndex, // 0-indexed
  beats: Array(DEFAULT_NUM_BEATS_PER_BAR_CONST).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex))
}));

// --- Side Joint Selector Specific (if different from main visualizer) ---
export const SIDE_JOINT_JOYSTICK_SENSITIVITY = 0.008;
export const SIDE_JOINT_JOYSTICK_MAX_DISPLACEMENT = 1.0; // Normalize to -1 to +1 range
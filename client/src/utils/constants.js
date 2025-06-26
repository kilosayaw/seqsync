// src/utils/constants.js

// Import sound data structures from sounds.js
import { 
    tr808SoundsArray, 
    tr808SoundKeysOrdered,
    // Import other sound arrays if you have more kits:
    // e.g., myCustomKitSoundsArray,
} from './sounds'; 

// --- Core Sequencer Grid ---
export const BEATS_PER_BAR = 16; // Used as the fixed UI grid size for pads
export const DEFAULT_NUM_BEATS_PER_BAR_CONST = 16; // Default for song data structure if not overridden
export const BARS_PER_SEQUENCE = 4; // Default number of bars
export const BEATS_PER_ROW_DISPLAY = 8; // For 2 rows of 8 pads

// --- BPM and Timing ---
export const DEFAULT_BPM = 120;
export const BPM_MIN = 20;
export const BPM_MAX = 400;
export const DEFAULT_TIME_SIGNATURE = { beatsPerBar: 4, beatUnit: 4 }; // Musical time signature
export const INTERNAL_SEQUENCER_RESOLUTION = 480; // Ticks per quarter note, for MIDI etc. (future)
export const TAP_TEMPO_MIN_TAPS = 3;
export const TAP_TEMPO_MAX_INTERVAL_MS = 2500; // Max ms between taps for them to be considered part of same tempo attempt
                                             // Also the timeout for calculating BPM after last tap.
// --- Application Modes ---
export const MODES = { SEQ: 'SEQ', POS: 'POS', SYNC: 'SYNC' }; // SYNC is for future media sync
export const MODE_SEQ = 'SEQ'; 
export const MODE_POS = 'POS'; 
export const MODE_SYNC = 'SYNC';

// --- Keyboard Mappings ---
// Beat Pad Triggers (1-8 for top row, q-i for bottom row, mapping to indices 0-15)
export const KEYBOARD_LAYOUT_MODE_SEQ = {
  '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7,
  'q':8, 'w':9, 'e':10,'r':11,'t':12,'y':13,'u':14,'i':15
};
// Mode Switching (Example: 's' for SEQ, 'p' for POS. 1,2,3 removed to avoid conflict with pads)
export const KEYBOARD_MODE_SWITCH = {
  's': MODES.SEQ,
  'p': MODES.POS,
  // 'c': MODES.SYNC, // Example for Sync mode
};
// Transport Controls
export const KEYBOARD_TRANSPORT_CONTROLS = {
  ' ': 'playPause',        // Spacebar
  'Enter': 'stop',       // Enter (main one) - consider if Ctrl+Enter is better to avoid form submission conflicts if any
  // ArrowLeft and ArrowRight are handled with shift modifier check in the component
  // 'ArrowLeft': 'prevBarOrSkip', // Base action for left arrow
  // 'ArrowRight': 'nextBarOrSkip', // Base action for right arrow
  // For specific bar navigation with Shift: Covered in component logic
  // For specific skip with no Shift: Covered in component logic
};
// POS Mode Navigation (Beat selection within the current bar)
export const KEYBOARD_NAVIGATION_POS_MODE = {
  // Using different keys than transport to avoid conflict if transport is global
  // Example: PageUp/PageDown or custom keys. For now, let's assume arrows are for skip if not shifted for bar nav.
  // If ArrowUp/Down are to be used for beat nav in POS mode, they must not conflict with global transport.
  // Let's keep them separate for now, maybe use '[' and ']' or similar.
  '[': 'prevBeat',
  ']': 'nextBeat',
};
// POS Mode Joint Nudging
export const KEYBOARD_JOINT_NUDGE_CONTROLS = {
  'j':{axis:'x',delta:-0.05}, // Nudge active joint's X vector
  'l':{axis:'x',delta:0.05},
  'i':{axis:'y',delta:0.05},  // Nudge active joint's Y vector
  'k':{axis:'y',delta:-0.05},
  'u':{axis:'z',delta:-0.1},  // Nudge active joint's Z vector (coarser)
  'o':{axis:'z',delta:0.1}
};
// Grounding Hotkeys (Example: 'f' for full left plant, 'g' for full right plant)
export const KEYBOARD_GROUNDING_HOTKEYS = {
  // These keys should be unique and not conflict with other actions
  // 'f':{side:'L',points:['LF123T12345']}, // Example using the direct full plant key
  // 'g':{side:'R',points:['RF123T12345']},
};

// --- Sound and Audio ---
export const MAX_SOUNDS_PER_BEAT = 4;
export const DEFAULT_SOUND_KIT_NAME = "TR-808";

const tr808FileMap = tr808SoundsArray.reduce((acc, sound) => {
  acc[sound.name] = sound.url; // sound.name is the key like 'BD0000'
  return acc;
}, {});

export const DEFAULT_SOUND_KIT = {
  name: DEFAULT_SOUND_KIT_NAME,
  displayName: "TR-808 (Technopolis)", // User-friendly display name
  sounds: tr808SoundsArray,        // Array of sound objects { name, key, url }
  // soundKeys: tr808SoundKeysOrdered, // Can be derived from `sounds` array if needed by SoundBank
  fileMap: tr808FileMap,            // Crucial for SoundBank to map sound name/key to URL and display name
};

// Add other kits here similarly:
// const myCustomKitFileMap = myCustomKitSoundsArray.reduce((acc, sound) => { acc[sound.name] = sound.url; return acc; }, {});
// export const MY_CUSTOM_KIT = {
//   name: "MyCustomKit",
//   displayName: "My Custom Sounds",
//   sounds: myCustomKitSoundsArray,
//   fileMap: myCustomKitFileMap,
// };

export const AVAILABLE_KITS = [
  DEFAULT_SOUND_KIT,
  // MY_CUSTOM_KIT, // Add other fully defined kits here
];

// --- ALL_JOINTS_MAP (Ensure this is comprehensive for your needs) ---
// This maps abbreviations to display names. Used by JOINT_SETS and UI_..._ABBREVS_NEW.
export const ALL_JOINTS_MAP = {
  H: { name: 'Head' }, N: { name: 'Neck' },
  LS: { name: 'L Shoulder' }, RS: { name: 'R Shoulder' },
  LE: { name: 'L Elbow' }, RE: { name: 'R Elbow' },
  LW: { name: 'L Wrist' }, RW: { name: 'R Wrist' },
  LP: { name: 'L Palm' }, RP: { name: 'R Palm' }, // For SideJointSelector (palm itself)
  T: { name: 'Torso Core' }, // Generic Torso/Core representation
  PELV: { name: 'Pelvis Center' }, SPIN_L: { name: 'Lumbar Spine' },
  SPIN_T: { name: 'Thoracic Spine' }, CHEST: { name: 'Chest Center' },
  LH: { name: 'L Hip' }, RH: { name: 'R Hip' },
  LK: { name: 'L Knee' }, RK: { name: 'R Knee' },
  LA: { name: 'L Ankle' }, RA: { name: 'R Ankle' },
  LF: { name: 'L Foot Base' }, RF: { name: 'R Foot Base' }, // Represents the whole foot for selection
  // Specific hand/foot points are usually for grounding/contact, not direct pose manipulation via SideSelector
  // L_SCAP: { name: 'L Scapula' }, R_SCAP: { name: 'R Scapula' }, // If these are selectable
};

// --- UI Joint Lists (For SideJointSelector) ---
// These should draw from ALL_JOINTS_MAP to ensure consistency
export const UI_LEFT_JOINTS_ABBREVS_NEW = [
  { abbrev: 'LS', name: ALL_JOINTS_MAP['LS']?.name || 'L Shoulder' },
  { abbrev: 'LE', name: ALL_JOINTS_MAP['LE']?.name || 'L Elbow' },
  { abbrev: 'LW', name: ALL_JOINTS_MAP['LW']?.name || 'L Wrist' },
  { abbrev: 'LP', name: ALL_JOINTS_MAP['LP']?.name || 'L Palm' },
  { abbrev: 'LH', name: ALL_JOINTS_MAP['LH']?.name || 'L Hip' },
  { abbrev: 'LK', name: ALL_JOINTS_MAP['LK']?.name || 'L Knee' },
  { abbrev: 'LA', name: ALL_JOINTS_MAP['LA']?.name || 'L Ankle' },
  { abbrev: 'LF', name: ALL_JOINTS_MAP['LF']?.name || 'L Foot Base' },
].filter(j => j.name); // Ensure entries are valid

export const UI_RIGHT_JOINTS_ABBREVS_NEW = [
  { abbrev: 'RS', name: ALL_JOINTS_MAP['RS']?.name || 'R Shoulder' },
  { abbrev: 'RE', name: ALL_JOINTS_MAP['RE']?.name || 'R Elbow' },
  { abbrev: 'RW', name: ALL_JOINTS_MAP['RW']?.name || 'R Wrist' },
  { abbrev: 'RP', name: ALL_JOINTS_MAP['RP']?.name || 'R Palm' },
  { abbrev: 'RH', name: ALL_JOINTS_MAP['RH']?.name || 'R Hip' },
  { abbrev: 'RK', name: ALL_JOINTS_MAP['RK']?.name || 'R Knee' },
  { abbrev: 'RA', name: ALL_JOINTS_MAP['RA']?.name || 'R Ankle' },
  { abbrev: 'RF', name: ALL_JOINTS_MAP['RF']?.name || 'R Foot Base' },
].filter(j => j.name);

// Central & Other Selectable Joints for a unified list if needed, or for specific selectors
export const UI_CENTER_JOINTS_ABBREVS_NEW = [
    { abbrev: 'H', name: ALL_JOINTS_MAP['H']?.name || 'Head' },
    { abbrev: 'N', name: ALL_JOINTS_MAP['N']?.name || 'Neck' },
    { abbrev: 'CHEST', name: ALL_JOINTS_MAP['CHEST']?.name || 'Chest Center' },
    { abbrev: 'SPIN_T', name: ALL_JOINTS_MAP['SPIN_T']?.name || 'Thoracic Spine' },
    { abbrev: 'SPIN_L', name: ALL_JOINTS_MAP['SPIN_L']?.name || 'Lumbar Spine' },
    { abbrev: 'PELV', name: ALL_JOINTS_MAP['PELV']?.name || 'Pelvis Center' },
].filter(j => j.name);


// --- JOINT_SETS (If SideJointSelector is to display a single combined list) ---
export const JOINT_SETS = {
  // Example: A comprehensive list for a single selector panel
  MAIN_JOINTS: [
    ...UI_LEFT_JOINTS_ABBREVS_NEW,
    ...UI_RIGHT_JOINTS_ABBREVS_NEW,
    ...UI_CENTER_JOINTS_ABBREVS_NEW,
    // You might want to de-duplicate if center joints are also in L/R, or arrange order.
  ].filter((j, index, self) => j.name && index === self.findIndex(t => t.abbrev === j.abbrev)), // Basic dedupe
};


// --- Pose and Joint Constants ---
export const POSE_DEFAULT_VECTOR = {x:0,y:0,z:0,x_base_direction:0,y_base_direction:0}; // Used for initializing joint vectors
export const DEFAULT_JOINT_VECTOR = {x:0,y:0,z:0,x_base_direction:0,y_base_direction:0}; // Redundant with above, choose one
export const Z_RENDER_ORDER = [0, 1, -1]; // M, F, N (Middle, Far, Near for cycling)
export const NUDGE_INCREMENT_OPTIONS = [
  {value:0.001,label:'0.001'},{value:0.005,label:'0.005'},{value:0.01,label:'0.01'},
  {value:0.025,label:'0.025'},{value:0.05,label:'0.05'},{value:0.1,label:'0.1'}
];
export const DEFAULT_NUDGE_INCREMENT = 0.05;
// For JointInputPanel's 3x3 grid for XY vector base direction
export const VECTOR_GRID_CELLS = [
  {x:-1,y:1,desc:"Up-Left"},  {x:0,y:1,desc:"Up"},     {x:1,y:1,desc:"Up-Right"},
  {x:-1,y:0,desc:"Left"},     {x:0,y:0,desc:"Center/Z-Cycle"}, {x:1,y:0,desc:"Right"},
  {x:-1,y:-1,desc:"Down-Left"},{x:0,y:-1,desc:"Down"},   {x:1,y:-1,desc:"Down-Right"}
];
// When a directional cell is clicked, vector x/y is set to this increment * cell.x/y
export const VECTOR_GRID_INCREMENT = 0.33; 
// Z-depth visual config for dots in visualizers
export const Z_DEPTH_CONFIG = {
  "-1":{label:"N",color:"bg-red-600",activeColor:"bg-red-400",ring:"ring-2 ring-red-300",sizeClasses:"w-3 h-3"}, // Near
  "0":{label:"M",color:"bg-gray-500",activeColor:"bg-gray-300",ring:"ring-2 ring-gray-200",sizeClasses:"w-2.5 h-2.5"}, // Middle
  "1":{label:"F",color:"bg-blue-600",activeColor:"bg-blue-400",ring:"ring-2 ring-blue-300",sizeClasses:"w-2 h-2"}   // Far
};

// --- Skeletal Visualizer ---
export const SVG_WIDTH_DEFAULT=220; export const SVG_HEIGHT_DEFAULT=300;
export const DEFAULT_JOINT_CIRCLE_RADIUS=5; 
export const SKELETAL_VIZ_MODAL_DOT_RADIUS=4; // Smaller dots in modal
export const SKELETAL_VIZ_MODAL_HIGHLIGHT_MULTIPLIER=1.5;
export const Z_DEPTH_JOINT_SCALES={NEAR:1.25,NEUTRAL:1.0,FAR:0.75}; // Scale factor for joint dots based on Z
export const BODY_SEGMENTS=[ // Defines lines connecting joints
  {from:'N',to:'H'},{from:'CHEST',to:'N'}, // Refined connections
  {from:'CHEST',to:'LS'},{from:'CHEST',to:'RS'},
  {from:'LS',to:'LE'},{from:'RS',to:'RE'},
  {from:'LE',to:'LW'},{from:'RE',to:'RW'},
  {from:'LW',to:'LP'},{from:'RW',to:'RP'}, // Wrist to Palm
  {from:'CHEST',to:'SPIN_T'},{from:'SPIN_T',to:'SPIN_L'},{from:'SPIN_L',to:'PELV'}, // Spine
  {from:'PELV',to:'LH'},{from:'PELV',to:'RH'},
  {from:'LH',to:'LK'},{from:'RH',to:'RK'},
  {from:'LK',to:'LA'},{from:'RK',to:'RA'},
  {from:'LA',to:'LF'},{from:'RA',to:'RF'} // Ankle to Foot Base
];
// Default 2D screen positions (0.0-1.0 relative to SVG width/height) for initial pose
export const DEFAULT_POSITIONS_2D={
  H:   {x:0.50,y:0.10}, N:   {x:0.50,y:0.18},
  CHEST:{x:0.50,y:0.25},SPIN_T:{x:0.50,y:0.30},SPIN_L:{x:0.50,y:0.40},PELV:{x:0.50,y:0.48},
  LS:  {x:0.38,y:0.26}, RS:  {x:0.62,y:0.26}, // Shoulders slightly lower than chest center
  LE:  {x:0.30,y:0.38}, RE:  {x:0.70,y:0.38},
  LW:  {x:0.25,y:0.54}, RW:  {x:0.75,y:0.54},
  LP:  {x:0.23,y:0.60}, RP:  {x:0.77,y:0.60}, // Palms slightly beyond wrists
  LH:  {x:0.42,y:0.50}, RH:  {x:0.58,y:0.50},
  LK:  {x:0.40,y:0.70}, RK:  {x:0.60,y:0.70},
  LA:  {x:0.38,y:0.88}, RA:  {x:0.62,y:0.88},
  LF:  {x:0.37,y:0.95}, RF:  {x:0.63,y:0.95}  // Foot base points
};

// --- Default Joint Values ---
export const DEFAULT_GENERAL_ORIENTATION='NEU'; // For non-ankle joints
export const DEFAULT_INTENT='Transition'; // Default intent
export const DEFAULT_JOINT_ENERGY=50; // Default energy level (0-100)
export const ENERGY_LEVEL_LABELS={LOW:"Low (1-33)",MEDIUM:"Medium (34-66)",HIGH:"High (67-100)"};

// Ankle specific defaults (plane-based orientation)
export const DEFAULT_ANKLE_SAGITTAL='NEU_SAG'; // Neutral, Dorsiflexion, Plantarflexion
export const DEFAULT_ANKLE_FRONTAL='NEU_FRON'; // Neutral, Inversion, Eversion
export const DEFAULT_ANKLE_TRANSVERSE='NEU_TRA';// Neutral, Abduction (out), Adduction (in)

// Options for Select dropdowns in JointInputPanel
export const GENERAL_ORIENTATION_OPTIONS=[
  {value:'NEU',label:'Neutral Rot/Align'},{value:'IN',label:'Internal Rotation'},{value:'OUT',label:'External Rotation'},
  {value:'FLEX',label:'Flexion (General)'},{value:'EXT',label:'Extension (General)'},
  {value:'L_BEND',label:'L Bend (Spine)'},{value:'R_BEND',label:'R Bend (Spine)'}, // For spine joints
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


// --- Foot Grounding & Joystick ---
// GROUND_ASSETS_BASE_PATH and WHEEL_IMAGE_PATH are fine.
// JOYSTICK_RADIUS_PERCENT, CENTER_TAP_RADIUS_PERCENT, HARD_CLICK_RADIUS_PERCENT are fine.
// JOYSTICK_ZONES_ANGLES definitions are fine.
// getZoneFromCoordinates function definition is fine.

// MAPPING JOYSTICK ZONES TO POSEQR™ GROUNDING POINTS
// These use the POSEQR™ grounding codes from your "Foot Notations" image.
// These are arrays of strings. FootJoystickOverlay will pass this array to onGroundingChange.
// `notationUtils.describeGroundingForSide` will then use `GROUNDING_POINT_VERBOSE_MAP`
// to translate these arrays into human-readable text.

export const LEFT_FOOT_JOYSTICK_MAP = {
  CENTER_TAP:         { points: null, label: "Left Foot Lifted" },
  CENTER_FULL_PLANT:  { points: ['LF123T12345'], label: "Left Full Foot Plant" },
  ZONE_N:  { points: ['LF12', 'LFT1', 'LFT2', 'LFT3', 'LFT4', 'LFT5'], label: "Left Toes & Ball" }, // Corresponds to LF12 + all LFT#
  ZONE_NE: { points: ['LF1T12'], label: "Left Inner Toes/Ball (Big & Pointer)" }, // Direct map to LF1T12
  ZONE_E:  { points: ['LF13'], label: "Left Inner Blade" },
  ZONE_SE: { points: ['LF3', 'LF1T1'], label: "Left Inner Heel & Big Toe Ball" }, // Example: LF3 + LF1T1
  ZONE_S:  { points: ['LF3'], label: "Left Heel" },
  ZONE_SW: { points: ['LF3', 'LF2'], label: "Left Outer Heel & Ball" }, // Example: LF3 + LF2 (Outer ball)
  ZONE_W:  { points: ['LF23'], label: "Left Outer Blade" },
  ZONE_NW: { points: ['LF12', 'LFT1Tip', 'LFT2Tip'], label: "Left Outer Toes/Ball (Tips)" }, // Example more specific
};

export const RIGHT_FOOT_JOYSTICK_MAP = {
  CENTER_TAP:         { points: null, label: "Right Foot Lifted" },
  CENTER_FULL_PLANT:  { points: ['RF123T12345'], label: "Right Full Foot Plant" },
  ZONE_N:  { points: ['RF12', 'RFT1', 'RFT2', 'RFT3', 'RFT4', 'RFT5'], label: "Right Toes & Ball" },
  ZONE_NE: { points: ['RF1T12'], label: "Right Inner Toes/Ball (Big & Pointer)" },
  ZONE_E:  { points: ['RF13'], label: "Right Inner Blade" },
  ZONE_SE: { points: ['RF3', 'RF1T1'], label: "Right Inner Heel & Big Toe Ball" },
  ZONE_S:  { points: ['RF3'], label: "Right Heel" },
  ZONE_SW: { points: ['RF3', 'RF2'], label: "Right Outer Heel & Ball" },
  ZONE_W:  { points: ['RF23'], label: "Right Outer Blade" },
  ZONE_NW: { points: ['RF12', 'RFT1Tip', 'RFT2Tip'], label: "Right Outer Toes/Ball (Tips)" },
};


// --- UI Sizing Constants ---
export const MODAL_FOOT_DISPLAY_SIZE_CLASSES = "w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40";
export const MAIN_FOOT_DISPLAY_SIZE_CLASSES = "w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48";

// --- Default Initial Song Data Structure ---
export const createDefaultBeatObject = (beatId) => ({
  id: beatId,
  sounds: [],
  jointInfo: {}, // Will be populated with {JOINT_ABBREV: {vector, rotation, orientation, intent, energy, ...}}
  grounding: { L: null, R: null, L_weight: 50 }, // L and R will store arrays of grounding point strings or null
  syllable: null,
  headOver: null, // Stores joint abbrev or 'CENTER' or null
  mediaCuePoint: null, // For future video sync
  // transitionQuality: null, // For future (e.g., from page 4 of your notes)
});

export const INITIAL_SONG_DATA = Array(BARS_PER_SEQUENCE).fill(null).map((_, barIndex) => ({
  id: barIndex,
  beats: Array(DEFAULT_NUM_BEATS_PER_BAR_CONST).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex))
}));

// --- Side Joint Selector Specific (if different from main visualizer) ---
export const SIDE_JOINT_JOYSTICK_SENSITIVITY = 0.008; // For the small joystick on SideJointSelector buttons
export const SIDE_JOINT_JOYSTICK_MAX_DISPLACEMENT = 1.0;
// Z_DOT_SCALES might be for the SideJointSelector's mini Z indicator if it has one.
// export const Z_DOT_SCALES = { NEAR: 1.3, NEUTRAL: 1.0, FAR: 0.7 }; // Already in Z_DEPTH_JOINT_SCALES
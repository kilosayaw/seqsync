import { tr808SoundsArray } from './sounds';

// =================================================================================================
// I. SEQUENCER & TIMING CONFIGURATION
// =================================================================================================

export const UI_PADS_PER_BAR = 16;
export const DATA_DEFAULT_BEATS_PER_BAR = 16;
export const BARS_PER_SEQUENCE = 4;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 20;
export const BPM_MAX = 400;
export const DEFAULT_TIME_SIGNATURE = { beatsPerBar: 4, beatUnit: 4 };
export const TAP_TEMPO_MIN_TAPS = 3;
export const TAP_TEMPO_MAX_INTERVAL_MS = 2500;
export const SKIP_OPTIONS = [ { value: "64", label: "1/64" }, { value: "32", label: "1/32" }, { value: "16", label: "1/16" }, { value: "8", label: "1/8" },   { value: "4", label: "1/4" },    { value: "2", label: "1/2" }, { value: "1", label: "Bar" } ];

// =================================================================================================
// II. APPLICATION MODES & UI SETTINGS
// =================================================================================================

export const MODES = { SEQ: 'SEQ', POS: 'POS', SYNC: 'SYNC' };
export const MAIN_FOOT_DISPLAY_SIZE_CLASSES = "w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48";

// =================================================================================================
// III. AUDIO & SOUND KITS
// =================================================================================================

export const MAX_SOUNDS_PER_BEAT = 4;
export const DEFAULT_SOUND_KIT_NAME = "TR-808";
const tr808FileMap = tr808SoundsArray.reduce((acc, sound) => { acc[sound.name] = sound.url; return acc; }, {});
export const DEFAULT_SOUND_KIT = { name: DEFAULT_SOUND_KIT_NAME, displayName: "TR-808 (Technopolis)", sounds: tr808SoundsArray, fileMap: tr808FileMap };
export const AVAILABLE_KITS = [ DEFAULT_SOUND_KIT ];

// =================================================================================================
// IV. JOINT, POSE, & SKELETON DEFINITIONS
// =================================================================================================

export const ALL_JOINTS_MAP = {
  H: { name: 'Head', group: 'Center' }, N: { name: 'Neck', group: 'Center' },
  CHEST: { name: 'Chest Center', group: 'Center' }, SPIN_T: { name: 'Thoracic Spine', group: 'Center' },
  SPIN_L: { name: 'Lumbar Spine', group: 'Center' }, PELV: { name: 'Pelvis Center', group: 'Center' },
  LS: { name: 'L Shoulder', group: 'Left' }, RS: { name: 'R Shoulder', group: 'Right' },
  LE: { name: 'L Elbow', group: 'Left' }, RE: { name: 'R Elbow', group: 'Right' },
  LW: { name: 'L Wrist', group: 'Left' }, RW: { name: 'R Wrist', group: 'Right' },
  LP: { name: 'L Palm', group: 'Left' }, RP: { name: 'R Palm', group: 'Right' },
  LH: { name: 'L Hip', group: 'Left' }, RH: { name: 'R Hip', group: 'Right' },
  LK: { name: 'L Knee', group: 'Left' }, RK: { name: 'R Knee', group: 'Right' },
  LA: { name: 'L Ankle', group: 'Left' }, RA: { name: 'R Ankle', group: 'Right' },
  LF: { name: 'L Foot Base', group: 'Left' }, RF: { name: 'R Foot Base', group: 'Right' },
};

const createJointList = (group) => Object.entries(ALL_JOINTS_MAP).filter(([, details]) => details.group === group).map(([abbrev, details]) => ({ abbrev, name: details.name }));
export const UI_LEFT_JOINTS_ABBREVS_NEW = createJointList('Left');
export const UI_RIGHT_JOINTS_ABBREVS_NEW = createJointList('Right');
export const UI_CENTER_JOINTS_ABBREVS_NEW = createJointList('Center');

export const BODY_SEGMENTS = [ {from:'N',to:'H'},{from:'CHEST',to:'N'}, {from:'CHEST',to:'LS'},{from:'CHEST',to:'RS'}, {from:'LS',to:'LE'},{from:'RS',to:'RE'}, {from:'LE',to:'LW'},{from:'RE',to:'RW'}, {from:'LW',to:'LP'},{from:'RW',to:'RP'}, {from:'CHEST',to:'SPIN_T'},{from:'SPIN_T',to:'SPIN_L'}, {from:'SPIN_L',to:'PELV'}, {from:'PELV',to:'LH'},{from:'PELV',to:'RH'}, {from:'LH',to:'LK'},{from:'RH',to:'RK'}, {from:'LK',to:'LA'},{from:'RK',to:'RA'}, {from:'LA',to:'LF'},{from:'RA',to:'RF'} ];
export const DEFAULT_POSITIONS_2D = { H: {x:0.50,y:0.10}, N: {x:0.50,y:0.18}, CHEST:{x:0.50,y:0.25}, SPIN_T:{x:0.50,y:0.32}, SPIN_L:{x:0.50,y:0.40}, PELV:{x:0.50,y:0.48}, LS: {x:0.38,y:0.26}, RS: {x:0.62,y:0.26}, LE: {x:0.30,y:0.38}, RE: {x:0.70,y:0.38}, LW: {x:0.25,y:0.54}, RW: {x:0.75,y:0.54}, LP: {x:0.23,y:0.60}, RP: {x:0.77,y:0.60}, LH: {x:0.42,y:0.50}, RH: {x:0.58,y:0.50}, LK: {x:0.40,y:0.70}, RK: {x:0.60,y:0.70}, LA: {x:0.38,y:0.88}, RA: {x:0.62,y:0.88}, LF: {x:0.37,y:0.95}, RF: {x:0.63,y:0.95} };

export const POSE_DEFAULT_VECTOR = {x:0,y:0,z:0,x_base_direction:0,y_base_direction:0};
export const DEFAULT_GENERAL_ORIENTATION='NEU';
export const DEFAULT_INTENT='Transition';
export const DEFAULT_JOINT_ENERGY=50;
export const DEFAULT_ANKLE_SAGITTAL='NEU_SAG';
export const DEFAULT_ANKLE_FRONTAL='NEU_FRON';
export const DEFAULT_ANKLE_TRANSVERSE='NEU_TRA';

export const GENERAL_ORIENTATION_OPTIONS=[ {value:'NEU',label:'Neutral Rot/Align'},{value:'IN',label:'Internal Rotation'},{value:'OUT',label:'External Rotation'}, {value:'FLEX',label:'Flexion (General)'},{value:'EXT',label:'Extension (General)'}, {value:'L_BEND',label:'L Bend (Spine)'},{value:'R_BEND',label:'R Bend (Spine)'}, {value:'PRO',label:'Pronation (Wrist/Forearm)'},{value:'SUP',label:'Supination (Wrist/Forearm)'}, {value:'ULN_DEV',label:'Ulnar Deviation (Wrist)'},{value:'RAD_DEV',label:'Radial Deviation (Wrist)'}, ];
export const INTENT_OPTIONS=[ {value:'Transition',label:'Transition'},{value:'StrikePrep',label:'Strike Prep'}, {value:'StrikeRelease',label:'Strike Release'},{value:'BlockPrep',label:'Block Prep'}, {value:'BlockImpact',label:'Block Impact'},{value:'Evasion',label:'Evasion'}, {value:'Grounding',label:'Grounding Shift'},{value:'Idle',label:'Idle/Stance'}, {value:'Recover',label:'Recover/Reset'},{value:'Coil',label:'Coil Energy'}, {value:'ReleasePwr',label:'Release Power'},{value:'Reach',label:'Reach'}, {value:'Pull',label:'Pull'},{value:'Stabilize',label:'Stabilize'}, ];
export const ANKLE_SAGITTAL_OPTIONS=[ {value:'NEU_SAG',label:'Neutral (Sagittal)'},{value:'DORSI',label:'Dorsiflexion'},{value:'PLANTAR',label:'Plantarflexion'} ];
export const ANKLE_FRONTAL_OPTIONS=[ {value:'NEU_FRON',label:'Neutral (Frontal)'},{value:'INVER',label:'Inversion'},{value:'EVER',label:'Eversion'} ];
export const ANKLE_TRANSVERSE_OPTIONS=[ {value:'NEU_TRA',label:'Neutral (Transverse)'},{value:'ABD_TRA',label:'Abduction (Toes Out)'},{value:'ADD_TRA',label:'Adduction (Toes In)'} ];

// =================================================================================================
// V. SKELETAL VISUALIZER CONSTANTS (Restored)
// =================================================================================================
export const SVG_WIDTH_DEFAULT = 220;
export const SVG_HEIGHT_DEFAULT = 300;
export const DEFAULT_JOINT_CIRCLE_RADIUS = 5;
export const Z_DEPTH_JOINT_SCALES = { NEAR: 1.25, NEUTRAL: 1.0, FAR: 0.75 };

// =================================================================================================
// VI. GROUNDING, FOOT, & JOYSTICK DEFINITIONS
// =================================================================================================
export const GROUND_ASSETS_BASE_PATH = '/assets/ground/';
export const GROUNDING_POINT_COORDS = { L: { 'LF1': { x: 55, y: 40 }, 'LF2': { x: 25, y: 50 }, 'LF3': { x: 45, y: 85 }, 'LFT1': { x: 68, y: 25 }, 'LFT2': { x: 55, y: 20 }, 'LFT3': { x: 43, y: 22 }, 'LFT4': { x: 31, y: 28 }, 'LFT5': { x: 20, y: 35 }, }, R: { 'RF1': { x: 45, y: 40 }, 'RF2': { x: 75, y: 50 }, 'RF3': { x: 55, y: 85 }, 'RFT1': { x: 32, y: 25 }, 'RFT2': { x: 45, y: 20 }, 'RFT3': { x: 57, y: 22 }, 'RFT4': { x: 69, y: 28 }, 'RFT5': { x: 80, y: 35 }, } };

// =================================================================================================
// Angles are standard (0 is East, 90 is North, 180 is West, 270 is South)
export const FOOT_JOYSTICK_ZONES = {
  L: [
    { name: 'L13', minAngle: 315, maxAngle: 360, notation: ['LF13'] },
    { name: 'L1',  minAngle: 0,   maxAngle: 45,  notation: ['LF1'] },
    { name: 'L12T12', minAngle: 45,  maxAngle: 90,  notation: ['LF1T12'] },
    { name: 'L12T12345', minAngle: 90,  maxAngle: 135, notation: ['LF123T12345'] },
    { name: 'L12', minAngle: 135, maxAngle: 180, notation: ['LF12'] },
    { name: 'L2',  minAngle: 180, maxAngle: 225, notation: ['LF2'] },
    { name: 'L23', minAngle: 225, maxAngle: 270, notation: ['LF23'] },
    { name: 'L3',  minAngle: 270, maxAngle: 315, notation: ['LF3'] },
  ],
  R: [ // Mirrored notations for the right foot
    { name: 'R13', minAngle: 315, maxAngle: 360, notation: ['RF13'] },
    { name: 'R1',  minAngle: 0,   maxAngle: 45,  notation: ['RF1'] },
    { name: 'R12T12', minAngle: 45,  maxAngle: 90,  notation: ['RF1T12'] },
    { name: 'R12T12345', minAngle: 90,  maxAngle: 135, notation: ['RF123T12345'] },
    { name: 'R12', minAngle: 135, maxAngle: 180, notation: ['RF12'] },
    { name: 'R2',  minAngle: 180, maxAngle: 225, notation: ['RF2'] },
    { name: 'R23', minAngle: 225, maxAngle: 270, notation: ['RF23'] },
    { name: 'R3',  minAngle: 270, maxAngle: 315, notation: ['RF3'] },
  ]
};

// =================================================================================================
// VII. KEYBOARD & INPUT MAPPINGS
// =================================================================================================
export const KEYBOARD_LAYOUT_MODE_SEQ = { '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, 'q':8, 'w':9, 'e':10,'r':11,'t':12,'y':13,'u':14,'i':15 };
export const KEYBOARD_MODE_SWITCH = { 's': MODES.SEQ, 'p': MODES.POS, 'c': MODES.SYNC };
export const KEYBOARD_TRANSPORT_CONTROLS = { ' ': 'playPause', 'Enter': 'stop' };
export const KEYBOARD_NAVIGATION_POS_MODE = { '[': 'prevBeat', ']': 'nextBeat' };
export const KEYBOARD_JOINT_NUDGE_CONTROLS = { 'j':{axis:'x',delta:-0.05}, 'l':{axis:'x',delta:0.05}, 'i':{axis:'y',delta:0.05},  'k':{axis:'y',delta:-0.05}, 'u':{axis:'z',delta:-0.1},  'o':{axis:'z',delta:0.1} };
export const KEYBOARD_FOOT_GROUNDING = { 'a': { side: 'L', points: ['LF123T12345'], label: "L Full Plant" }, 's': { side: 'L', points: ['LF1', 'LF2'], label: "L Ball Only" } };

// =================================================================================================
// VIII. INITIAL STATE & DATA STRUCTURES
// =================================================================================================
export const createDefaultBeatObject = (beatId) => ({
  id: beatId, sounds: [], jointInfo: {},
  grounding: { L: null, R: null, L_weight: 50 },
  syllable: null, headOver: null, thumbnail: null,
});

export const INITIAL_SONG_DATA = Array(BARS_PER_SEQUENCE).fill(null).map((_, barIndex) => ({
  id: barIndex,
  // FIX: Using the correct, more specific constant name
  beats: Array(DATA_DEFAULT_BEATS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex))
}));
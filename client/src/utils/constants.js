import { tr808SoundsArray } from './sounds';

// =================================================================================================
// I. SEQUENCER & TIMING CONFIGURATION
// =================================================================================================
export const UI_PADS_PER_BAR = 16;
export const DATA_DEFAULT_BEATS_PER_BAR = 16;
export const BARS_PER_SEQUENCE = 4;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 30;
export const BPM_MAX = 300;
export const DEFAULT_TIME_SIGNATURE = { beatsPerBar: 4, beatUnit: 4 };
export const TAP_TEMPO_MIN_TAPS = 3;
export const TAP_TEMPO_MAX_INTERVAL_MS = 2000; // 2 seconds

// =================================================================================================
// II. APPLICATION MODES & UI SETTINGS
// =================================================================================================
export const MODES = { SEQ: 'SEQ', POS: 'POS', SYNC: 'SYNC' };
export const SKIP_OPTIONS = [1, 2, 4, 8, 16];

// =================================================================================================
// III. AUDIO & SOUND KITS
// =================================================================================================
export const MAX_SOUNDS_PER_BEAT = 4;
export const DEFAULT_SOUND_KIT = { name: "TR-808", displayName: "TR-808 (Technopolis)", sounds: tr808SoundsArray, orderedKeys: tr808SoundsArray.map(sound => sound.name) };
export const AVAILABLE_KITS = [ DEFAULT_SOUND_KIT ];

// =================================================================================================
// IV. JOINT, POSE, & SKELETON DEFINITIONS
// =================================================================================================
export const ALL_JOINTS_MAP = { H: { name: 'Head', group: 'Center' }, N: { name: 'Neck', group: 'Center' }, CHEST: { name: 'Chest Center', group: 'Center' }, SPIN_T: { name: 'Thoracic Spine', group: 'Center' }, SPIN_L: { name: 'Lumbar Spine', group: 'Center' }, PELV: { name: 'Pelvis Center', group: 'Center' }, LS: { name: 'L Shoulder', group: 'Left' }, RS: { name: 'R Shoulder', group: 'Right' }, LE: { name: 'L Elbow', group: 'Left' }, RE: { name: 'R Elbow', group: 'Right' }, LW: { name: 'L Wrist', group: 'Left' }, RW: { name: 'R Wrist', group: 'Right' }, LP: { name: 'L Palm', group: 'Left' }, RP: { name: 'R Palm', group: 'Right' }, LH: { name: 'L Hip', group: 'Left' }, RH: { name: 'R Hip', group: 'Right' }, LK: { name: 'L Knee', group: 'Left' }, RK: { name: 'R Knee', group: 'Right' }, LA: { name: 'L Ankle', group: 'Left' }, RA: { name: 'R Ankle', group: 'Right' }, LF: { name: 'L Foot Base', group: 'Left' }, RF: { name: 'R Foot Base', group: 'Right' }};
export const POSE_DEFAULT_VECTOR = {x:0,y:0,z:0};
export const INTENT_OPTIONS=[ {value:'Transition',label:'Transition'},{value:'StrikePrep',label:'Strike Prep'}, {value:'StrikeRelease',label:'Strike Release'},{value:'BlockPrep',label:'Block Prep'}, {value:'BlockImpact',label:'Block Impact'},{value:'Evasion',label:'Evasion'}, {value:'Grounding',label:'Grounding Shift'},{value:'Idle',label:'Idle/Stance'}, {value:'Recover',label:'Recover/Reset'},{value:'Coil',label:'Coil Energy'}, {value:'ReleasePwr',label:'Release Power'},{value:'Reach',label:'Reach'}, {value:'Pull',label:'Pull'},{value:'Stabilize',label:'Stabilize'}, ];
export const GENERAL_ORIENTATION_OPTIONS=[ {value:'NEU',label:'Neutral Rot/Align'},{value:'IN',label:'Internal Rotation'},{value:'OUT',label:'External Rotation'}, {value:'FLEX',label:'Flexion (General)'},{value:'EXT',label:'Extension (General)'}, {value:'L_BEND',label:'L Bend (Spine)'},{value:'R_BEND',label:'R Bend (Spine)'}, {value:'PRO',label:'Pronation (Wrist/Forearm)'},{value:'SUP',label:'Supination (Wrist/Forearm)'}, {value:'ULN_DEV',label:'Ulnar Deviation (Wrist)'},{value:'RAD_DEV',label:'Radial Deviation (Wrist)'}, ];
export const UI_LEFT_JOINTS_ABBREVS_NEW = Object.entries(ALL_JOINTS_MAP).filter(([,d])=>d.group==='Left').map(([a,d])=>({abbrev:a, name:d.name}));
export const UI_RIGHT_JOINTS_ABBREVS_NEW = Object.entries(ALL_JOINTS_MAP).filter(([,d])=>d.group==='Right').map(([a,d])=>({abbrev:a, name:d.name}));

// V. SKELETAL VISUALIZER CONSTANTS
export const BODY_SEGMENTS = [ {from:'N',to:'H'},{from:'CHEST',to:'N'}, {from:'CHEST',to:'LS'},{from:'CHEST',to:'RS'}, {from:'LS',to:'LE'},{from:'RS',to:'RE'}, {from:'LE',to:'LW'},{from:'RE',to:'RW'}, {from:'LW',to:'LP'},{from:'RW',to:'RP'}, {from:'CHEST',to:'SPIN_T'},{from:'SPIN_T',to:'SPIN_L'}, {from:'SPIN_L',to:'PELV'}, {from:'PELV',to:'LH'},{from:'PELV',to:'RH'}, {from:'LH',to:'LK'},{from:'RH',to:'RK'}, {from:'LK',to:'LA'},{from:'RK',to:'RA'}, {from:'LA',to:'LF'},{from:'RA',to:'RF'} ];
export const DEFAULT_POSITIONS_2D = { H: {x:0.50,y:0.10}, N: {x:0.50,y:0.18}, CHEST:{x:0.50,y:0.25}, SPIN_T:{x:0.50,y:0.32}, SPIN_L:{x:0.50,y:0.40}, PELV:{x:0.50,y:0.48}, LS: {x:0.38,y:0.26}, RS: {x:0.62,y:0.26}, LE: {x:0.30,y:0.38}, RE: {x:0.70,y:0.38}, LW: {x:0.25,y:0.54}, RW: {x:0.75,y:0.54}, LP: {x:0.23,y:0.60}, RP: {x:0.77,y:0.60}, LH: {x:0.42,y:0.50}, RH: {x:0.58,y:0.50}, LK: {x:0.40,y:0.70}, RK: {x:0.60,y:0.70}, LA: {x:0.38,y:0.88}, RA: {x:0.62,y:0.88}, LF: {x:0.37,y:0.95}, RF: {x:0.63,y:0.95} };
export const SVG_WIDTH_DEFAULT = 220, SVG_HEIGHT_DEFAULT = 300, DEFAULT_JOINT_CIRCLE_RADIUS = 5;
export const Z_DEPTH_JOINT_SCALES = { NEAR: 1.25, NEUTRAL: 1.0, FAR: 0.75 };

// VI. TRANSITION & ANIMATION CURVES
export const TRANSITION_CURVES = { LINEAR: { label: 'Linear', function: (t) => t }, EASE_IN_QUAD: { label: 'Ease In (Slow Start)', function: (t) => t * t }, EASE_OUT_QUAD: { label: 'Ease Out (Slow End)', function: (t) => t * (2 - t) }, EASE_IN_OUT_QUAD: { label: 'Ease In-Out', function: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) } };

// VII. VECTOR GRID & INPUT MAPPINGS
export const VECTOR_GRID_CELLS = [ {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}, {x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: -1, y:-1}, {x: 0, y:-1}, {x: 1, y:-1}, ];
export const Z_DEPTH_CONFIG = { '1': { value: 1, label: 'Forward', color: 'bg-blue-400', sizeClasses: 'w-6 h-6' }, '0': { value: 0, label: 'Neutral', color: 'bg-yellow-400', sizeClasses: 'w-4 h-4' }, '-1': { value: -1, label: 'Backward', color: 'bg-red-400', sizeClasses: 'w-2 h-2' }, };

// VIII. KEYBOARD CONTROLS [RESTORED]
export const KEYBOARD_LAYOUT_MODE_SEQ = { '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, 'q':8, 'w':9, 'e':10,'r':11,'t':12,'y':13,'u':14,'i':15 };
export const KEYBOARD_MODE_SWITCH = { 'p': MODES.POS, 's': MODES.SEQ, };
export const KEYBOARD_TRANSPORT_CONTROLS = { ' ': 'playPause', 'Enter': 'stop' };
export const KEYBOARD_FOOT_GROUNDING = { 'a': { side: 'L', points: ['LF123T12345'] }, 'd': { side: 'R', points: ['RF123T12345'] }, 's': {side: 'L', points: null}, 'f': {side: 'R', points: null}};

// IX. INITIAL STATE & DATA STRUCTURES
export const createDefaultBeatObject = (beatId) => ({ id: beatId, sounds: [], jointInfo: {}, grounding: { L: null, R: null, L_weight: 50 }, thumbnail: null, transition: { curve: 'LINEAR' } });
export const INITIAL_SONG_DATA = Array(BARS_PER_SEQUENCE).fill(null).map((_, barIndex) => ({ id: barIndex, beats: Array(DATA_DEFAULT_BEATS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex)) }));

// =================================================================================================
// X. MISSING CONSTANTS ADDED FOR SYNC (to fix "No matching export" errors)
// =================================================================================================

// For notationUtils.js
export const DEFAULT_ANKLE_SAGITTAL = 'Dorsi-Plantar';
export const DEFAULT_ANKLE_FRONTAL = 'Inversion-Eversion';
export const DEFAULT_ANKLE_TRANSVERSE = 'Ab-Adduction';
export const DEFAULT_JOINT_ENERGY = 1.0;
export const DEFAULT_GENERAL_ORIENTATION = 'NEU';
export const DEFAULT_INTENT = 'Idle';
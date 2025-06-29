// src/utils/constants.js

// ===================================================================================
// SECTION 1: CORE SEQUENCER & TIMING DEFAULTS
// ===================================================================================
export const MODES = { SEQ: 'SEQ', POS: 'POS', SYNC: 'SYNC' };
export const BARS_PER_SEQUENCE = 4;
export const UI_PADS_PER_BAR = 16;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 20;
export const BPM_MAX = 400;
export const DEFAULT_TIME_SIGNATURE = { beatsPerBar: 4, beatUnit: 4 };
export const TAP_TEMPO_MIN_TAPS = 3;
export const TAP_TEMPO_MAX_INTERVAL_MS = 2500;
export const POSE_DEFAULT_VECTOR = {x:0, y:0, z:0};
export const Z_DEPTH_JOINT_SCALES = { '1': 1.25, '0': 1.0, '-1': 0.75 };
export const SVG_WIDTH_DEFAULT = 280; 
export const SVG_HEIGHT_DEFAULT = 280;
export const DEFAULT_NUM_BEATS_PER_BAR_CONST = 16;

// ===================================================================================
// SECTION 2: SOUNDS & KITS
// ===================================================================================
export const MAX_SOUNDS_PER_BEAT = 4;
export const DEFAULT_SOUND_PATH_PREFIX = '/assets/sounds/fixed-sounds/tr808/';

export const tr808SoundFilePaths = {
  'BD0000':{key:'BD0000',name:'BD0000',url:`${DEFAULT_SOUND_PATH_PREFIX}BD0000.wav`},
  'BD0010':{key:'BD0010',name:'BD0010',url:`${DEFAULT_SOUND_PATH_PREFIX}BD0010.wav`},
  'BD0025':{key:'BD0025',name:'BD0025',url:`${DEFAULT_SOUND_PATH_PREFIX}BD0025.wav`},
  'BD0050':{key:'BD0050',name:'BD0050',url:`${DEFAULT_SOUND_PATH_PREFIX}BD0050.wav`},
  'BD0075':{key:'BD0075',name:'BD0075',url:`${DEFAULT_SOUND_PATH_PREFIX}BD0075.wav`},
  'BD1000':{key:'BD1000',name:'BD1000',url:`${DEFAULT_SOUND_PATH_PREFIX}BD1000.wav`},
  'BD1010':{key:'BD1010',name:'BD1010',url:`${DEFAULT_SOUND_PATH_PREFIX}BD1010.wav`},
  'BD1025':{key:'BD1025',name:'BD1025',url:`${DEFAULT_SOUND_PATH_PREFIX}BD1025.wav`},
  'BD1050':{key:'BD1050',name:'BD1050',url:`${DEFAULT_SOUND_PATH_PREFIX}BD1050.wav`},
  'BD1075':{key:'BD1075',name:'BD1075',url:`${DEFAULT_SOUND_PATH_PREFIX}BD1075.wav`},
  'BD2500':{key:'BD2500',name:'BD2500',url:`${DEFAULT_SOUND_PATH_PREFIX}BD2500.wav`},
  'BD2510':{key:'BD2510',name:'BD2510',url:`${DEFAULT_SOUND_PATH_PREFIX}BD2510.wav`},
  'BD2525':{key:'BD2525',name:'BD2525',url:`${DEFAULT_SOUND_PATH_PREFIX}BD2525.wav`},
  'BD2550':{key:'BD2550',name:'BD2550',url:`${DEFAULT_SOUND_PATH_PREFIX}BD2550.wav`},
  'BD2575':{key:'BD2575',name:'BD2575',url:`${DEFAULT_SOUND_PATH_PREFIX}BD2575.wav`},
  'BD5000':{key:'BD5000',name:'BD5000',url:`${DEFAULT_SOUND_PATH_PREFIX}BD5000.wav`},
  'BD5010':{key:'BD5010',name:'BD5010',url:`${DEFAULT_SOUND_PATH_PREFIX}BD5010.wav`},
  'BD5025':{key:'BD5025',name:'BD5025',url:`${DEFAULT_SOUND_PATH_PREFIX}BD5025.wav`},
  'BD5050':{key:'BD5050',name:'BD5050',url:`${DEFAULT_SOUND_PATH_PREFIX}BD5050.wav`},
  'BD5075':{key:'BD5075',name:'BD5075',url:`${DEFAULT_SOUND_PATH_PREFIX}BD5075.wav`},
  'BD7500':{key:'BD7500',name:'BD7500',url:`${DEFAULT_SOUND_PATH_PREFIX}BD7500.wav`},
  'BD7510':{key:'BD7510',name:'BD7510',url:`${DEFAULT_SOUND_PATH_PREFIX}BD7510.wav`},
  'BD7525':{key:'BD7525',name:'BD7525',url:`${DEFAULT_SOUND_PATH_PREFIX}BD7525.wav`},
  'BD7550':{key:'BD7550',name:'BD7550',url:`${DEFAULT_SOUND_PATH_PREFIX}BD7550.wav`},
  'BD7575':{key:'BD7575',name:'BD7575',url:`${DEFAULT_SOUND_PATH_PREFIX}BD7575.wav`},
  'SD0000':{key:'SD0000',name:'SD0000',url:`${DEFAULT_SOUND_PATH_PREFIX}SD0000.wav`},
  'SD0010':{key:'SD0010',name:'SD0010',url:`${DEFAULT_SOUND_PATH_PREFIX}SD0010.wav`},
  'SD0025':{key:'SD0025',name:'SD0025',url:`${DEFAULT_SOUND_PATH_PREFIX}SD0025.wav`},
  'SD0050':{key:'SD0050',name:'SD0050',url:`${DEFAULT_SOUND_PATH_PREFIX}SD0050.wav`},
  'SD0075':{key:'SD0075',name:'SD0075',url:`${DEFAULT_SOUND_PATH_PREFIX}SD0075.wav`},
  'SD1000':{key:'SD1000',name:'SD1000',url:`${DEFAULT_SOUND_PATH_PREFIX}SD1000.wav`},
  'SD1010':{key:'SD1010',name:'SD1010',url:`${DEFAULT_SOUND_PATH_PREFIX}SD1010.wav`},
  'SD1025':{key:'SD1025',name:'SD1025',url:`${DEFAULT_SOUND_PATH_PREFIX}SD1025.wav`},
  'SD1050':{key:'SD1050',name:'SD1050',url:`${DEFAULT_SOUND_PATH_PREFIX}SD1050.wav`},
  'SD1075':{key:'SD1075',name:'SD1075',url:`${DEFAULT_SOUND_PATH_PREFIX}SD1075.wav`},
  'SD2500':{key:'SD2500',name:'SD2500',url:`${DEFAULT_SOUND_PATH_PREFIX}SD2500.wav`},
  'SD2510':{key:'SD2510',name:'SD2510',url:`${DEFAULT_SOUND_PATH_PREFIX}SD2510.wav`},
  'SD2525':{key:'SD2525',name:'SD2525',url:`${DEFAULT_SOUND_PATH_PREFIX}SD2525.wav`},
  'SD2550':{key:'SD2550',name:'SD2550',url:`${DEFAULT_SOUND_PATH_PREFIX}SD2550.wav`},
  'SD2575':{key:'SD2575',name:'SD2575',url:`${DEFAULT_SOUND_PATH_PREFIX}SD2575.wav`},
  'SD5000':{key:'SD5000',name:'SD5000',url:`${DEFAULT_SOUND_PATH_PREFIX}SD5000.wav`},
  'SD5010':{key:'SD5010',name:'SD5010',url:`${DEFAULT_SOUND_PATH_PREFIX}SD5010.wav`},
  'SD5025':{key:'SD5025',name:'SD5025',url:`${DEFAULT_SOUND_PATH_PREFIX}SD5025.wav`},
  'SD5050':{key:'SD5050',name:'SD5050',url:`${DEFAULT_SOUND_PATH_PREFIX}SD5050.wav`},
  'SD5075':{key:'SD5075',name:'SD5075',url:`${DEFAULT_SOUND_PATH_PREFIX}SD5075.wav`},
  'SD7500':{key:'SD7500',name:'SD7500',url:`${DEFAULT_SOUND_PATH_PREFIX}SD7500.wav`},
  'SD7510':{key:'SD7510',name:'SD7510',url:`${DEFAULT_SOUND_PATH_PREFIX}SD7510.wav`},
  'SD7525':{key:'SD7525',name:'SD7525',url:`${DEFAULT_SOUND_PATH_PREFIX}SD7525.wav`},
  'SD7550':{key:'SD7550',name:'SD7550',url:`${DEFAULT_SOUND_PATH_PREFIX}SD7550.wav`},
  'SD7575':{key:'SD7575',name:'SD7575',url:`${DEFAULT_SOUND_PATH_PREFIX}SD7575.wav`},
  'RS':{key:'RS',name:'RS',url:`${DEFAULT_SOUND_PATH_PREFIX}RS.wav`},
  'CP':{key:'CP',name:'CP',url:`${DEFAULT_SOUND_PATH_PREFIX}CP.wav`},
  'MA':{key:'MA',name:'MA',url:`${DEFAULT_SOUND_PATH_PREFIX}MA.wav`},
  'CB':{key:'CB',name:'CB',url:`${DEFAULT_SOUND_PATH_PREFIX}CB.wav`},
  'CL':{key:'CL',name:'CL',url:`${DEFAULT_SOUND_PATH_PREFIX}CL.wav`},
  'CH':{key:'CH',name:'CH',url:`${DEFAULT_SOUND_PATH_PREFIX}CH.wav`},
  'OH00':{key:'OH00',name:'OH00',url:`${DEFAULT_SOUND_PATH_PREFIX}OH00.wav`},
  'OH10':{key:'OH10',name:'OH10',url:`${DEFAULT_SOUND_PATH_PREFIX}OH10.wav`},
  'OH25':{key:'OH25',name:'OH25',url:`${DEFAULT_SOUND_PATH_PREFIX}OH25.wav`},
  'OH50':{key:'OH50',name:'OH50',url:`${DEFAULT_SOUND_PATH_PREFIX}OH50.wav`},
  'OH75':{key:'OH75',name:'OH75',url:`${DEFAULT_SOUND_PATH_PREFIX}OH75.wav`},
  'HT00':{key:'HT00',name:'HT00',url:`${DEFAULT_SOUND_PATH_PREFIX}HT00.wav`},
  'HT10':{key:'HT10',name:'HT10',url:`${DEFAULT_SOUND_PATH_PREFIX}HT10.wav`},
  'HT25':{key:'HT25',name:'HT25',url:`${DEFAULT_SOUND_PATH_PREFIX}HT25.wav`},
  'HT50':{key:'HT50',name:'HT50',url:`${DEFAULT_SOUND_PATH_PREFIX}HT50.wav`},
  'HT75':{key:'HT75',name:'HT75',url:`${DEFAULT_SOUND_PATH_PREFIX}HT75.wav`},
  'MT00':{key:'MT00',name:'MT00',url:`${DEFAULT_SOUND_PATH_PREFIX}MT00.wav`},
  'MT10':{key:'MT10',name:'MT10',url:`${DEFAULT_SOUND_PATH_PREFIX}MT10.wav`},
  'MT25':{key:'MT25',name:'MT25',url:`${DEFAULT_SOUND_PATH_PREFIX}MT25.wav`},
  'MT50':{key:'MT50',name:'MT50',url:`${DEFAULT_SOUND_PATH_PREFIX}MT50.wav`},
  'MT75':{key:'MT75',name:'MT75',url:`${DEFAULT_SOUND_PATH_PREFIX}MT75.wav`},
  'LT00':{key:'LT00',name:'LT00',url:`${DEFAULT_SOUND_PATH_PREFIX}LT00.wav`},
  'LT10':{key:'LT10',name:'LT10',url:`${DEFAULT_SOUND_PATH_PREFIX}LT10.wav`},
  'LT25':{key:'LT25',name:'LT25',url:`${DEFAULT_SOUND_PATH_PREFIX}LT25.wav`},
  'LT50':{key:'LT50',name:'LT50',url:`${DEFAULT_SOUND_PATH_PREFIX}LT50.wav`},
  'LT75':{key:'LT75',name:'LT75',url:`${DEFAULT_SOUND_PATH_PREFIX}LT75.wav`},
  'HC00':{key:'HC00',name:'HC00',url:`${DEFAULT_SOUND_PATH_PREFIX}HC00.wav`},
  'HC10':{key:'HC10',name:'HC10',url:`${DEFAULT_SOUND_PATH_PREFIX}HC10.wav`},
  'HC25':{key:'HC25',name:'HC25',url:`${DEFAULT_SOUND_PATH_PREFIX}HC25.wav`},
  'HC50':{key:'HC50',name:'HC50',url:`${DEFAULT_SOUND_PATH_PREFIX}HC50.wav`},
  'HC75':{key:'HC75',name:'HC75',url:`${DEFAULT_SOUND_PATH_PREFIX}HC75.wav`},
  'MC00':{key:'MC00',name:'MC00',url:`${DEFAULT_SOUND_PATH_PREFIX}MC00.wav`},
  'MC10':{key:'MC10',name:'MC10',url:`${DEFAULT_SOUND_PATH_PREFIX}MC10.wav`},
  'MC25':{key:'MC25',name:'MC25',url:`${DEFAULT_SOUND_PATH_PREFIX}MC25.wav`},
  'MC50':{key:'MC50',name:'MC50',url:`${DEFAULT_SOUND_PATH_PREFIX}MC50.wav`},
  'MC75':{key:'MC75',name:'MC75',url:`${DEFAULT_SOUND_PATH_PREFIX}MC75.wav`},
  'LC00':{key:'LC00',name:'LC00',url:`${DEFAULT_SOUND_PATH_PREFIX}LC00.wav`},
  'LC10':{key:'LC10',name:'LC10',url:`${DEFAULT_SOUND_PATH_PREFIX}LC10.wav`},
  'LC25':{key:'LC25',name:'LC25',url:`${DEFAULT_SOUND_PATH_PREFIX}LC25.wav`},
  'LC50':{key:'LC50',name:'LC50',url:`${DEFAULT_SOUND_PATH_PREFIX}LC50.wav`},
  'LC75':{key:'LC75',name:'LC75',url:`${DEFAULT_SOUND_PATH_PREFIX}LC75.wav`},
  'CY0000':{key:'CY0000',name:'CY0000',url:`${DEFAULT_SOUND_PATH_PREFIX}CY0000.wav`},
  'CY0010':{key:'CY0010',name:'CY0010',url:`${DEFAULT_SOUND_PATH_PREFIX}CY0010.wav`},
  'CY0025':{key:'CY0025',name:'CY0025',url:`${DEFAULT_SOUND_PATH_PREFIX}CY0025.wav`},
  'CY0050':{key:'CY0050',name:'CY0050',url:`${DEFAULT_SOUND_PATH_PREFIX}CY0050.wav`},
  'CY0075':{key:'CY0075',name:'CY0075',url:`${DEFAULT_SOUND_PATH_PREFIX}CY0075.wav`},
  'CY1000':{key:'CY1000',name:'CY1000',url:`${DEFAULT_SOUND_PATH_PREFIX}CY1000.wav`},
  'CY1010':{key:'CY1010',name:'CY1010',url:`${DEFAULT_SOUND_PATH_PREFIX}CY1010.wav`},
  'CY1025':{key:'CY1025',name:'CY1025',url:`${DEFAULT_SOUND_PATH_PREFIX}CY1025.wav`},
  'CY1050':{key:'CY1050',name:'CY1050',url:`${DEFAULT_SOUND_PATH_PREFIX}CY1050.wav`},
  'CY1075':{key:'CY1075',name:'CY1075',url:`${DEFAULT_SOUND_PATH_PREFIX}CY1075.wav`},
  'CY2500':{key:'CY2500',name:'CY2500',url:`${DEFAULT_SOUND_PATH_PREFIX}CY2500.wav`},
  'CY2510':{key:'CY2510',name:'CY2510',url:`${DEFAULT_SOUND_PATH_PREFIX}CY2510.wav`},
  'CY2525':{key:'CY2525',name:'CY2525',url:`${DEFAULT_SOUND_PATH_PREFIX}CY2525.wav`},
  'CY2550':{key:'CY2550',name:'CY2550',url:`${DEFAULT_SOUND_PATH_PREFIX}CY2550.wav`},
  'CY2575':{key:'CY2575',name:'CY2575',url:`${DEFAULT_SOUND_PATH_PREFIX}CY2575.wav`},
  'CY5000':{key:'CY5000',name:'CY5000',url:`${DEFAULT_SOUND_PATH_PREFIX}CY5000.wav`},
  'CY5010':{key:'CY5010',name:'CY5010',url:`${DEFAULT_SOUND_PATH_PREFIX}CY5010.wav`},
  'CY5025':{key:'CY5025',name:'CY5025',url:`${DEFAULT_SOUND_PATH_PREFIX}CY5025.wav`},
  'CY5050':{key:'CY5050',name:'CY5050',url:`${DEFAULT_SOUND_PATH_PREFIX}CY5050.wav`},
  'CY5075':{key:'CY5075',name:'CY5075',url:`${DEFAULT_SOUND_PATH_PREFIX}CY5075.wav`},
  'CY7500':{key:'CY7500',name:'CY7500',url:`${DEFAULT_SOUND_PATH_PREFIX}CY7500.wav`},
  'CY7510':{key:'CY7510',name:'CY7510',url:`${DEFAULT_SOUND_PATH_PREFIX}CY7510.wav`},
  'CY7525':{key:'CY7525',name:'CY7525',url:`${DEFAULT_SOUND_PATH_PREFIX}CY7525.wav`},
  'CY7550':{key:'CY7550',name:'CY7550',url:`${DEFAULT_SOUND_PATH_PREFIX}CY7550.wav`},
  'CY7575':{key:'CY7575',name:'CY7575',url:`${DEFAULT_SOUND_PATH_PREFIX}CY7575.wav`},
};

export const DEFAULT_SOUND_KIT = { name: 'TR-808', sounds: Object.values(tr808SoundFilePaths) };
export const AVAILABLE_KITS = [DEFAULT_SOUND_KIT];

// ===================================================================================
// SECTION 3: JOINTS, POSE, & SKELETON
// ===================================================================================
export const ALL_JOINTS_MAP = {
    H: { name: 'Head' }, N: { name: 'Neck' }, CHEST: { name: 'Chest Center' }, SPIN_T: { name: 'Thoracic Spine' }, SPIN_L: { name: 'Lumbar Spine' }, PELV: { name: 'Pelvis Center' },
    LS: { name: 'L Shoulder' }, RS: { name: 'R Shoulder' }, LE: { name: 'L Elbow' }, RE: { name: 'R Elbow' }, LW: { name: 'L Wrist' }, RW: { name: 'R Wrist' }, LP: { name: 'L Palm' }, RP: { name: 'R Palm' },
    LH: { name: 'L Hip' }, RH: { name: 'R Hip' }, LK: { name: 'L Knee' }, RK: { name: 'R Knee' }, LA: { name: 'L Ankle' }, RA: { name: 'R Ankle' }, LF: { name: 'L Foot Base' }, RF: { name: 'R Foot Base' },
};
export const UI_LEFT_JOINTS_ABBREVS_NEW = Object.keys(ALL_JOINTS_MAP).filter(k => k.startsWith('L')).map(k => ({ abbrev: k, name: ALL_JOINTS_MAP[k].name }));
export const UI_RIGHT_JOINTS_ABBREVS_NEW = Object.keys(ALL_JOINTS_MAP).filter(k => k.startsWith('R')).map(k => ({ abbrev: k, name: ALL_JOINTS_MAP[k].name }));
export const BODY_SEGMENTS = [ {from:'N',to:'H'},{from:'CHEST',to:'N'},{from:'CHEST',to:'LS'},{from:'CHEST',to:'RS'},{from:'LS',to:'LE'},{from:'RS',to:'RE'},{from:'LE',to:'LW'},{from:'RE',to:'RW'},{from:'LW',to:'LP'},{from:'RW',to:'RP'},{from:'CHEST',to:'SPIN_T'},{from:'SPIN_T',to:'SPIN_L'},{from:'SPIN_L',to:'PELV'},{from:'PELV',to:'LH'},{from:'PELV',to:'RH'},{from:'LH',to:'LK'},{from:'RH',to:'RK'},{from:'LK',to:'LA'},{from:'RK',to:'RA'},{from:'LA',to:'LF'},{from:'RA',to:'RF'} ];
export const DEFAULT_POSITIONS_2D = { H: {x:0.50,y:0.10}, N: {x:0.50,y:0.18}, CHEST:{x:0.50,y:0.25}, SPIN_T:{x:0.50,y:0.32}, SPIN_L:{x:0.50,y:0.40}, PELV:{x:0.50,y:0.48}, LS: {x:0.38,y:0.26}, RS: {x:0.62,y:0.26}, LE: {x:0.30,y:0.38}, RE: {x:0.70,y:0.38}, LW: {x:0.25,y:0.54}, RW: {x:0.75,y:0.54}, LP: {x:0.23,y:0.60}, RP: {x:0.77,y:0.60}, LH: {x:0.42,y:0.50}, RH: {x:0.58,y:0.50}, LK: {x:0.40,y:0.70}, RK: {x:0.60,y:0.70}, LA: {x:0.38,y:0.88}, RA: {x:0.62,y:0.88}, LF: {x:0.37,y:0.95}, RF: {x:0.63,y:0.95} };

export const DEFAULT_JOINT_CIRCLE_RADIUS = 5;

// ===================================================================================
// SECTION 4: UI & KEYBOARD
// ===================================================================================
export const KEYBOARD_LAYOUT_MODE_SEQ = { '1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6,'8':7,'q':8,'w':9,'e':10,'r':11,'t':12,'y':13,'u':14,'i':15 };
export const KEYBOARD_MODE_SWITCH = { 's': MODES.SEQ, 'p': MODES.POS, 'c': MODES.SYNC };
export const KEYBOARD_TRANSPORT_CONTROLS = { ' ': 'playPause', 'Enter': 'stop' };
export const KEYBOARD_FOOT_GROUNDING = {
    'a': { side: 'L', points: ['LF123T12345'], label: "L Full Plant" }, 's': { side: 'L', points: ['LF1', 'LF2'], label: "L Ball Only" },
    'd': { side: 'L', points: ['LF23'], label: 'L Outer Blade' }, 'f': { side: 'L', points: ['LF13'], label: 'L Inner Blade' },
    'h': { side: 'R', points: ['RF13'], label: 'R Inner Blade' }, 'j': { side: 'R', points: ['RF23'], label: 'R Outer Blade' },
    'k': { side: 'R', points: ['RF1', 'RF2'], label: "R Ball Only" }, 'l': { side: 'R', points: ['RF123T12345'], label: "R Full Plant" },
};
export const SKIP_OPTIONS = [ { value: "16", label: "1/16" }, { value: "8", label: "1/8" }, { value: "4", label: "1/4" }, { value: "2", label: "1/2" }, { value: "1", label: "Bar" } ];

// ===================================================================================
// SECTION 5: POSE, BIOMECHANICS & NOTATION
// ===================================================================================
export const TRANSITION_CURVES = { LINEAR: { label: 'Linear', function: (t) => t }, EASE_IN: { label: 'Ease In', function: (t) => t * t }, EASE_OUT: { label: 'Ease Out', function: (t) => t * (2 - t) }, EASE_IN_OUT: { label: 'Ease In-Out', function: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) }, };
export const VECTOR_GRID_CELLS = [ {x: -1, y: 1, desc: 'Up-Left'}, {x: 0, y: 1, desc: 'Up'}, {x: 1, y: 1, desc: 'Up-Right'}, {x: -1, y: 0, desc: 'Left'}, {x: 0, y: 0, desc: 'Center'}, {x: 1, y: 0, desc: 'Right'}, {x: -1, y: -1, desc: 'Down-Left'}, {x: 0, y: -1, desc: 'Down'}, {x: 1, y: -1, desc: 'Down-Right'} ];
export const Z_DEPTH_CONFIG = {
    '1': { value: 1, label: 'Forward', color: 'bg-blue-400', sizeClasses: 'w-6 h-6' },
    '0': { value: 0, label: 'Neutral', color: 'bg-yellow-400', sizeClasses: 'w-4 h-4' },
    '-1': { value: -1, label: 'Backward', color: 'bg-red-400', sizeClasses: 'w-2 h-2' }
};

export const DEFAULT_GENERAL_ORIENTATION='NEU';
export const DEFAULT_INTENT='Transition';
export const DEFAULT_JOINT_ENERGY=50;
export const ENERGY_LEVEL_LABELS={LOW:"Low (1-33)",MEDIUM:"Medium (34-66)",HIGH:"High (67-100)"};
export const DEFAULT_ANKLE_SAGITTAL='NEU_SAG';
export const DEFAULT_ANKLE_FRONTAL='NEU_FRON';
export const DEFAULT_ANKLE_TRANSVERSE='NEU_TRA';
export const GENERAL_ORIENTATION_OPTIONS=[ {value:'NEU',label:'Neutral Rot/Align'},{value:'IN',label:'Internal Rotation'},{value:'OUT',label:'External Rotation'}, {value:'FLEX',label:'Flexion (General)'},{value:'EXT',label:'Extension (General)'}, {value:'L_BEND',label:'L Bend (Spine)'},{value:'R_BEND',label:'R Bend (Spine)'}, {value:'PRO',label:'Pronation (Wrist/Forearm)'},{value:'SUP',label:'Supination (Wrist/Forearm)'}, {value:'ULN_DEV',label:'Ulnar Deviation (Wrist)'},{value:'RAD_DEV',label:'Radial Deviation (Wrist)'}, ];
export const INTENT_OPTIONS=[ {value:'Transition',label:'Transition'},{value:'StrikePrep',label:'Strike Prep'}, {value:'StrikeRelease',label:'Strike Release'},{value:'BlockPrep',label:'Block Prep'}, {value:'BlockImpact',label:'Block Impact'},{value:'Evasion',label:'Evasion'}, {value:'Grounding',label:'Grounding Shift'},{value:'Idle',label:'Idle/Stance'}, {value:'Recover',label:'Recover/Reset'},{value:'Coil',label:'Coil Energy'}, {value:'ReleasePwr',label:'Release Power'},{value:'Reach',label:'Reach'}, {value:'Pull',label:'Pull'},{value:'Stabilize',label:'Stabilize'}, ];
export const ANKLE_SAGITTAL_OPTIONS=[ {value:'NEU_SAG',label:'Neutral (Sagittal)'},{value:'DORSI',label:'Dorsiflexion'},{value:'PLANTAR',label:'Plantarflexion'} ];
export const ANKLE_FRONTAL_OPTIONS=[ {value:'NEU_FRON',label:'Neutral (Frontal)'},{value:'INVER',label:'Inversion'},{value:'EVER',label:'Eversion'} ];
export const ANKLE_TRANSVERSE_OPTIONS=[ {value:'NEU_TRA',label:'Neutral (Transverse)'},{value:'ABD_TRA',label:'Abduction (Toes Out)'},{value:'ADD_TRA',label:'Adduction (Toes In)'} ];

// ===================================================================================
// SECTION 6: BIOMECHANICS & NOTATION
// ===================================================================================
export const BIOMECHANICAL_CONSTANTS = {
  // Defines the "safe" movement boundaries for the knee relative to the foot's grounding state.
  // Values are normalized factors of total possible range.
  KNEE_BOUNDS: {
    // A fully planted foot (ball and heel) provides the most stable base.
    FULL_PLANT: { x: 0.6, y: 0.5, z: 0.8 }, // Allows moderate side-to-side and forward range.
    // When the heel is up, the base is less stable laterally, but forward mobility is increased.
    HEEL_UP:    { x: 0.4, y: 0.5, z: 1.0 },
    // When only the heel is down, forward/backward range is severely limited.
    HEEL_ONLY:  { x: 0.2, y: 0.2, z: 0.2 },
    // Default for an un-grounded or airborn state, allowing full theoretical movement.
    DEFAULT:    { x: 1.0, y: 1.0, z: 1.0 },
  },

  // Defines standard rotational limits for major joints in degrees.
  HIP_ROTATION: {
    DEFAULT_MIN: -45, // Max safe internal rotation
    DEFAULT_MAX: 45,  // Max safe external rotation
    // When the opposing hip is at its limit, the active hip's range is constrained.
    CONSTRAINED_MIN: -15,
    CONSTRAINED_MAX: 15,
  },

  // Defines standard flexion/extension limits for the hip in degrees.
  HIP_FLEXION: {
    DEFAULT_MIN: -30, // Max safe extension (glute activation)
    DEFAULT_MAX: 120, // Max safe flexion (knee to chest)
    // When the opposing hip is deeply flexed, the active hip's extension is limited.
    CONSTRAINED_MIN: -10,
  },
  
  // Defines thresholds that trigger changes in biomechanical state.
  THRESHOLDS: {
    // When a joint's rotation exceeds this percentage of its max, it's considered "loaded".
    // 40 degrees out of 45 total degrees.
    NEAR_MAX_ROTATION_PERCENT: 0.88, // ~40 degrees
    // When hip flexion exceeds this, it affects the other leg's stability.
    DEEP_FLEXION_DEGREES: 100,
  },

  // Defines values for normalizing complex multi-joint states into a simple [0, 1] or [-1, 1] range.
  NORMALIZATION: {
    // The maximum expected rotational difference between the shoulder and hip girdles.
    // e.g., Right Shoulder at +45 deg, Left Hip at -45 deg = 90 deg separation.
    MAX_SHOULDER_HIP_TWIST: 90,
    // The theoretical max "energy" from summing the absolute rotation of 4 major joints (4 * 45 deg).
    MAX_TOTAL_ROTATION_ENERGY: 180,
  },
  
  // Defines the "energy value" contributed by each segment of the kinetic chain.
  // This is used to calculate the total momentum of a movement.
  KINETIC_CHAIN: {
    // The point at which a joint's rotation is considered "engaged" enough to transfer energy.
    ROTATION_THRESHOLD_DEGREES: {
        ANKLE: 10,
        KNEE: 15,
        HIP: 20,
        SHOULDER: 25,
    },
    // Arbitrary energy units assigned to each link in the chain.
    ENERGY_VALUES: {
        GROUNDING: 10,
        ANKLE: 15,
        KNEE: 20,
        HIP: 30,
        CORE: 25,
        SHOULDER: 20,
        ELBOW: 15,
        WRIST: 10,
    }
  }
};

export const createDefaultBeatObject = (beatId) => ({
  id: beatId, sounds: [], jointInfo: {},
  grounding: { L: null, R: null, L_weight: 50 },
  rotation: { L: 0, R: 0 },
  transition: { poseCurve: 'LINEAR' },
  thumbnail: null,
});

export const INITIAL_SONG_DATA = Array(BARS_PER_SEQUENCE).fill(null).map((_, barIndex) => ({
  id: barIndex,
  beats: Array(UI_PADS_PER_BAR).fill(null).map((_, beatIndex) => createDefaultBeatObject(beatIndex))
}));

export const WHEEL_IMAGE_PATH = '/assets/ground/foot-wheel.png';
export const FOOT_CONTACT_ZONES = {
  L: [
    { notation: 'L1', cx: 50, cy: 40, radius: 12, name: 'L Ball (Big Toe Side)' },
    { notation: 'L2', cx: 28, cy: 55, radius: 10, name: 'L Ball (Pinky Side)' },
    { notation: 'L3', cx: 50, cy: 85, radius: 14, name: 'L Heel' },
    { notation: 'LT1', cx: 78, cy: 28, radius: 10, name: 'L Big Toe' },
    { notation: 'LT2', cx: 68, cy: 18, radius: 7, name: 'L 2nd Toe' },
    { notation: 'LT3', cx: 55, cy: 14, radius: 7, name: 'L 3rd Toe' },
    { notation: 'LT4', cx: 42, cy: 18, radius: 7, name: 'L 4th Toe' },
    { notation: 'LT5', cx: 30, cy: 28, radius: 7, name: 'L Pinky Toe' },
  ],
  R: [ // Mirrored on the X-axis
    { notation: 'R1', cx: 50, cy: 40, radius: 12, name: 'R Ball (Big Toe Side)' },
    { notation: 'R2', cx: 72, cy: 55, radius: 10, name: 'R Ball (Pinky Side)' },
    { notation: 'R3', cx: 50, cy: 85, radius: 14, name: 'R Heel' },
    { notation: 'RT1', cx: 22, cy: 28, radius: 10, name: 'R Big Toe' },
    { notation: 'RT2', cx: 32, cy: 18, radius: 7, name: 'R 2nd Toe' },
    { notation: 'RT3', cx: 45, cy: 14, radius: 7, name: 'R 3rd Toe' },
    { notation: 'RT4', cx: 58, cy: 18, radius: 7, name: 'R 4th Toe' },
    { notation: 'RT5', cx: 70, cy: 28, radius: 7, name: 'R Pinky Toe' },
  ]
};

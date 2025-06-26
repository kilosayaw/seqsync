// src/utils/notationMaps.js

// --- JOINT ABBREVIATIONS ---
export const JOINT_VERBOSE_MAP = {
  // ... (all previous definitions remain the same)
  H: { plain: "Head", medical: "Cranium & Cephalic Region" },
  N: { plain: "Neck", medical: "Cervical Spine" },
  LS: { plain: "Left Shoulder", medical: "Left Glenohumeral & Scapulothoracic Complex" },
  RS: { plain: "Right Shoulder", medical: "Right Glenohumeral & Scapulothoracic Complex" },
  LE: { plain: "Left Elbow", medical: "Left Cubital Joint (Humeroulnar & Humeroradial)" },
  RE: { plain: "Right Elbow", medical: "Right Cubital Joint (Humeroulnar & Humeroradial)" },
  LW: { plain: "Left Wrist", medical: "Left Radiocarpal & Midcarpal Joints" },
  RW: { plain: "Right Wrist", medical: "Right Radiocarpal & Midcarpal Joints" },
  LW1: { plain: "Left Wrist Thumb Side", medical: "Radial Aspect of Left Wrist" },
  LW2: { plain: "Left Wrist Pinky Side", medical: "Ulnar Aspect of Left Wrist" },
  RW1: { plain: "Right Wrist Thumb Side", medical: "Radial Aspect of Right Wrist" },
  RW2: { plain: "Right Wrist Pinky Side", medical: "Ulnar Aspect of Right Wrist" },
  LP: { plain: "Left Palm", medical: "Left Palmar Surface / Metacarpals" },
  RP: { plain: "Right Palm", medical: "Right Palmar Surface / Metacarpals" },
  LP1: { plain: "Left Palm base under Index Finger", medical: "Base of Left 2nd Metacarpal (Palmar)" },
  LP2: { plain: "Left Palm base under Middle Finger", medical: "Base of Left 3rd Metacarpal (Palmar)" },
  LP3: { plain: "Left Palm base under Ring Finger", medical: "Base of Left 4th Metacarpal (Palmar)" },
  LP4: { plain: "Left Palm base under Pinky Finger", medical: "Base of Left 5th Metacarpal (Palmar)" },
  LP5: { plain: "Left Palm base under Thumb (above LP7)", medical: "Base of Left 1st Metacarpal (Thenar Eminence)" },
  LP6: { plain: "Left Palm base above LP8", medical: "Ulnar border of Left Palm (Hypothenar)" },
  LP7: { plain: "Side of Left Wrist/Palm aligned with Thumb", medical: "Radial Border of Left Carpus/Metacarpus" },
  LP8: { plain: "Side of Left Wrist/Palm aligned with Pinky", medical: "Ulnar Border of Left Carpus/Metacarpus" },
  LPFP1: { plain: "Left Index Fingertip", medical: "Distal Phalanx of Left 2nd Digit (Palmar)" },
  LPFP2: { plain: "Left Middle Fingertip", medical: "Distal Phalanx of Left 3rd Digit (Palmar)" },
  LPFP3: { plain: "Left Ring Fingertip", medical: "Distal Phalanx of Left 4th Digit (Palmar)" },
  LPFP4: { plain: "Left Pinky Fingertip", medical: "Distal Phalanx of Left 5th Digit (Palmar)" },
  LPFP5: { plain: "Left Thumbtip", medical: "Distal Phalanx of Left 1st Digit (Palmar)" },
  LPFP12345: { plain: "All Left Fingertips", medical: "All Distal Phalanges of Left Hand (Palmar)" },
  LP1234FP12345: { plain: "Left Palm and Fingertips (planted except base of thumb)", medical: "Left Palmar Surface & Digits (excluding Thenar base) Ground Contact" },
  LP12345: { plain: "Full Left Palm", medical: "Entire Left Palmar Surface Contact" },
  LP1234567: { plain: "Full Left Palm including Wrist", medical: "Entire Left Palmar Surface and Wrist Contact" },
  LPBK1234: { plain: "Left Hand Base Knuckles (1-4)", medical: "Dorsal Aspect of Left Metacarpophalangeal Joints (II-V)" },
  LPMK: { plain: "Left Hand Mid Knuckles", medical: "Dorsal Aspect of Left Proximal Interphalangeal Joints" },
  LPTK: { plain: "Left Hand Top Knuckles", medical: "Dorsal Aspect of Left Distal Interphalangeal Joints" },
  RP1: { plain: "Right Palm base under Index Finger", medical: "Base of Right 2nd Metacarpal (Palmar)" },
  RP2: { plain: "Right Palm base under Middle Finger", medical: "Base of Right 3rd Metacarpal (Palmar)" },
  RP3: { plain: "Right Palm base under Ring Finger", medical: "Base of Right 4th Metacarpal (Palmar)" },
  RP4: { plain: "Right Palm base under Pinky Finger", medical: "Base of Right 5th Metacarpal (Palmar)" },
  RP5: { plain: "Right Palm base under Thumb (above RP7)", medical: "Base of Right 1st Metacarpal (Thenar Eminence)" },
  RP6: { plain: "Right Palm base above RP8", medical: "Ulnar border of Right Palm (Hypothenar)" },
  RP7: { plain: "Side of Right Wrist/Palm aligned with Thumb", medical: "Radial Border of Right Carpus/Metacarpus" },
  RP8: { plain: "Side of Right Wrist/Palm aligned with Pinky", medical: "Ulnar Border of Right Carpus/Metacarpus" },
  RPFP1: { plain: "Right Index Fingertip", medical: "Distal Phalanx of Right 2nd Digit (Palmar)" },
  RPFP2: { plain: "Right Middle Fingertip", medical: "Distal Phalanx of Right 3rd Digit (Palmar)" },
  RPFP3: { plain: "Right Ring Fingertip", medical: "Distal Phalanx of Right 4th Digit (Palmar)" },
  RPFP4: { plain: "Right Pinky Fingertip", medical: "Distal Phalanx of Right 5th Digit (Palmar)" },
  RPFP5: { plain: "Right Thumbtip", medical: "Distal Phalanx of Right 1st Digit (Palmar)" },
  RPFP12345: { plain: "All Right Fingertips", medical: "All Distal Phalanges of Right Hand (Palmar)" },
  RP1234FP12345: { plain: "Right Palm and Fingertips (planted except base of thumb)", medical: "Right Palmar Surface & Digits (excluding Thenar base) Ground Contact" },
  RP12345: { plain: "Full Right Palm", medical: "Entire Right Palmar Surface Contact" },
  RP1234567: { plain: "Full Right Palm including Wrist", medical: "Entire Right Palmar Surface and Wrist Contact" },
  RPBK1234: { plain: "Right Hand Base Knuckles (1-4)", medical: "Dorsal Aspect of Right Metacarpophalangeal Joints (II-V)" },
  RPMK: { plain: "Right Hand Mid Knuckles", medical: "Dorsal Aspect of Right Proximal Interphalangeal Joints" },
  RPTK: { plain: "Right Hand Top Knuckles", medical: "Dorsal Aspect of Right Distal Interphalangeal Joints" },
  T: { plain: "Torso/Core", medical: "Trunk (Thoracic and Lumbar Spine, Abdomen)" },
  PELV: { plain: "Pelvis", medical: "Pelvic Girdle" },
  SPIN_L: { plain: "Lumbar Spine", medical: "Lumbar Vertebrae (L1-L5)" },
  SPIN_T: { plain: "Thoracic Spine", medical: "Thoracic Vertebrae (T1-T12)" },
  CHEST: { plain: "Chest Center", medical: "Sternum / Anterior Thorax" },
  LH: { plain: "Left Hip", medical: "Left Coxal Joint" },
  RH: { plain: "Right Hip", medical: "Right Coxal Joint" },
  LK: { plain: "Left Knee", medical: "Left Genual Joint (Tibiofemoral & Patellofemoral)" },
  RK: { plain: "Right Knee", medical: "Right Genual Joint (Tibiofemoral & Patellofemoral)" },
  LA: { plain: "Left Ankle", medical: "Left Talocrural & Subtalar Complex" },
  RA: { plain: "Right Ankle", medical: "Right Talocrural & Subtalar Complex" },
  LA1: { plain: "Left Inner Ankle", medical: "Medial Malleolus of Left Ankle" },
  LA2: { plain: "Left Outer Ankle", medical: "Lateral Malleolus of Left Ankle" },
  RA1: { plain: "Right Inner Ankle", medical: "Medial Malleolus of Right Ankle" },
  RA2: { plain: "Right Outer Ankle", medical: "Lateral Malleolus of Right Ankle" },
  LF: { plain: "Left Foot", medical: "Left Pes" },
  RF: { plain: "Right Foot", medical: "Right Pes" },
  L_SH: { plain: "Left Shoulder", medical: "Left Glenohumeral & Scapulothoracic Joints" },
  R_SH: { plain: "Right Shoulder", medical: "Right Glenohumeral & Scapulothoracic Joints" },
  L_ELB: { plain: "Left Elbow", medical: "Left Humeroulnar & Humeroradial Articulations" },
  R_ELB: { plain: "Right Elbow", medical: "Right Humeroulnar & Humeroradial Articulations" },
  L_WR: { plain: "Left Wrist", medical: "Left Radiocarpal & Ulnocarpal Joints" },
  R_WR: { plain: "Right Wrist", medical: "Right Radiocarpal & Ulnocarpal Joints" },
  L_HIP: { plain: "Left Hip", medical: "Left Coxofemoral Joint" },
  R_HIP: { plain: "Right Hip", medical: "Right Coxofemoral Joint" },
  L_KNEE: { plain: "Left Knee", medical: "Left Tibiofemoral & Patellofemoral Joints" },
  R_KNEE: { plain: "Right Knee", medical: "Right Tibiofemoral & Patellofemoral Joints" },
  L_ANK: { plain: "Left Ankle", medical: "Left Talocrural & Subtalar Joints" },
  R_ANK: { plain: "Right Ankle", medical: "Right Talocrural & Subtalar Joints" },
};

// --- GENERAL ORIENTATION ---
export const ORIENTATION_VERBOSE_MAP = {
  IN: { plain: "internally rotated", medical: "Internal (Medial) Rotation" },
  OUT: { plain: "externally rotated", medical: "External (Lateral) Rotation" },
  NEU: { plain: "neutral", medical: "Neutral Alignment/Rotation" },
  FLEX: { plain: "flexed/bent", medical: "Flexion" },
  EXT: { plain: "extended/straight", medical: "Extension" },
  PRO: { plain: "pronated (palm down for hand/forearm)", medical: "Pronation" },
  SUP: { plain: "supinated (palm up for hand/forearm)", medical: "Supination" },
  ULN: { plain: "ulnar deviated (wrist bent to pinky side)", medical: "Ulnar Deviation" },
  RAD: { plain: "radial deviated (wrist bent to thumb side)", medical: "Radial Deviation" },
};

// --- ANKLE-SPECIFIC ORIENTATIONS ---
export const ANKLE_SAGITTAL_VERBOSE_MAP = {
  NEU_SAG: { plain: "neutral (foot flat)", medical: "Neutral Sagittal Plane Alignment (Talocrural)" },
  DORSI: { plain: "pointing toes up", medical: "Dorsiflexion (Talocrural)" },
  PLANTAR: { plain: "pointing toes down", medical: "Plantarflexion (Talocrural)" },
};
export const ANKLE_FRONTAL_VERBOSE_MAP = {
  NEU_FRON: { plain: "neutral (sole flat)", medical: "Neutral Frontal Plane Alignment (Subtalar)" },
  INVER: { plain: "rolling inward (sole in)", medical: "Inversion (Subtalar)" },
  EVER: { plain: "rolling outward (sole out)", medical: "Eversion (Subtalar)" },
};
export const ANKLE_TRANSVERSE_VERBOSE_MAP = {
  NEU_TRA: { plain: "neutral (toes forward)", medical: "Neutral Transverse Plane Alignment (Midtarsal/Forefoot)" },
  ABD_TRA: { plain: "toes pointing outward", medical: "Forefoot Abduction" },
  ADD_TRA: { plain: "toes pointing inward", medical: "Forefoot Adduction" },
};

// --- INTENT ---
export const INTENT_VERBOSE_MAP = {
  Transition: { plain: "transitioning", medical: "Transitional Movement Phase" },
  StrikePrep: { plain: "preparing strike", medical: "Pre-Impact/Strike Loading Phase" },
  StrikeRelease: { plain: "releasing strike", medical: "Impact/Strike Execution Phase" },
  // ... other intents you define in constants.js ...
  Neutral: { plain: "neutral", medical: "Neutral Intent / Static Posture" }, // From your example options
  Flex: { plain: "bending", medical: "Flexion" }, // If intent can be FLEX
  Extend: { plain: "straightening", medical: "Extension" }, // If intent can be EXTEND
  Abduct: { plain: "moving away from midline", medical: "Abduction" },
  Adduct: { plain: "moving towards midline", medical: "Adduction" },
  Coil: { plain: "coiling / loading", medical: "Loading Phase / Eccentric Contraction" },
  Release: { plain: "releasing / uncoiling", medical: "Release Phase / Concentric Contraction" },
  Impact: { plain: "making impact", medical: "Impact / Strike Termination" },
  Reach: { plain: "reaching", medical: "Protraction / Reaching" },
  Pull: { plain: "pulling", medical: "Retraction / Pulling" },
  Stabilize: { plain: "stabilizing", medical: "Isometric Contraction / Stabilization" },
  STRIKE_JAB: { plain: "jabbing", medical: "Jab-type Percussive Action" },
  STRIKE_CROSS: { plain: "throwing a cross", medical: "Cross-type Percussive Action" },
  STRIKE_HOOK: { plain: "hooking", medical: "Hook-type Percussive Action" },
};

// --- GROUNDING POINTS ---
export const GROUNDING_POINT_VERBOSE_MAP = {
  LF1: { plain: "inner ball of left foot", medical: "Plantar aspect of Left 1st Metatarsal Head" },
  LF2: { plain: "outer ball of left foot (pinky side)", medical: "Plantar aspect of Left 5th Metatarsal Head" },
  LF3: { plain: "heel of left foot", medical: "Plantar aspect of Left Calcaneus" },
  LF1T1: { plain: "inner ball and big toe of left foot", medical: "Plantar Left 1st Metatarsal Head & Hallux" },
  LF1T12: { plain: "inner ball, big and pointer toe of left foot", medical: "Plantar Left 1st Metatarsal Head, Hallux, & 2nd Digit" },
  LF123T12345: { plain: "full left foot plant", medical: "Full Plantar Contact Left Pes" },
  LF12: { plain: "front ball of left foot", medical: "Plantar aspect of Left Metatarsal Heads 1-5" },
  LF23: { plain: "outer blade of left foot", medical: "Lateral Border of Left Pes (5th Metatarsal Head to Calcaneus)" },
  LF13: { plain: "inner blade of left foot", medical: "Medial Border of Left Pes (1st Metatarsal Head to Calcaneus)" },
  LFT1: { plain: "left big toe", medical: "Plantar aspect of Left Hallux" },
  LFT1Tip: { plain: "tip of left big toe", medical: "Distal Plantar aspect of Left Hallux" },
  LFT1Over: { plain: "top of left big toe (nail side)", medical: "Dorsal aspect of Left Hallux" },
  RF1: { plain: "inner ball of right foot", medical: "Plantar aspect of Right 1st Metatarsal Head" },
  RF2: { plain: "outer ball of right foot (pinky side)", medical: "Plantar aspect of Right 5th Metatarsal Head" },
  RF3: { plain: "heel of right foot", medical: "Plantar aspect of Right Calcaneus" },
  RF1T1: { plain: "inner ball and big toe of right foot", medical: "Plantar Right 1st Metatarsal Head & Hallux" },
  RF1T12: { plain: "inner ball, big and pointer toe of right foot", medical: "Plantar Right 1st Metatarsal Head, Hallux, & 2nd Digit" },
  RF123T12345: { plain: "full right foot plant", medical: "Full Plantar Contact Right Pes" },
  RF2T12345: { plain: "right ball of foot and all toes", medical: "Plantar Right Metatarsal Heads & All Phalanges" }, // Adjusted based on image
  RF12: { plain: "front ball of right foot", medical: "Plantar aspect of Right Metatarsal Heads 1-5" },
  RF23: { plain: "outer blade of right foot", medical: "Lateral Border of Right Pes (5th Metatarsal Head to Calcaneus)" },
  RF13: { plain: "inner blade of right foot", medical: "Medial Border of Right Pes (1st Metatarsal Head to Calcaneus)" },
  RFT1: { plain: "right big toe", medical: "Plantar aspect of Right Hallux" },
  RFT1Tip: { plain: "tip of right big toe", medical: "Distal Plantar aspect of Right Hallux" },
  RFT1Over: { plain: "top of right big toe (nail side)", medical: "Dorsal aspect of Right Hallux" },
  L_FULL_PLANT: { plain: "full left foot contact", medical: "Full Left Pes Ground Contact"},
  R_FULL_PLANT: { plain: "full right foot contact", medical: "Full Right Pes Ground Contact"},
  L_LIFT: {plain: "left foot lifted", medical: "Left Pes Non-Weight Bearing / Swing Phase"},
  R_LIFT: {plain: "right foot lifted", medical: "Right Pes Non-Weight Bearing / Swing Phase"},
};

// --- VECTOR DIRECTIONS ---
// Corrected export:
export const VECTOR_PRIMARY_DIRECTION_MAP = {
  X_POS: { plain: "to its left", medical: "positive X-axis displacement (Leftward by convention)" }, // As per your image page 6: X=1 is LEFT
  X_NEG: { plain: "to its right", medical: "negative X-axis displacement (Rightward by convention)" },// As per your image page 6: X=-1 is RIGHT
  Y_POS: { plain: "upwards", medical: "positive Y-axis displacement (Superior)" },
  Y_NEG: { plain: "downwards", medical: "negative Y-axis displacement (Inferior)" },
  Z_POS: { plain: "further away / forward", medical: "positive Z-axis displacement (Forward/Anterior/Distal by convention)" }, // Page 6: Z=1 is FORWARD
  Z_NEG: { plain: "closer / backward", medical: "negative Z-axis displacement (Backward/Posterior/Proximal by convention)" },    // Page 6: Z=-1 is BACKWARD
};

// --- HEAD OVER TARGETS ---
export const HEAD_OVER_VERBOSE_MAP = {
  None: { plain: "not specified", medical: "Head alignment not specified" },
  CENTER: { plain: "Center of Mass/Base", medical: "Cephalic alignment over Center of Mass / Base of Support" },
  // HO RF123T12345 - "Head over right foot fully planted"
  RF123T12345: {plain: "fully planted Right Foot", medical: "fully planted Right Pes"}, // Example for direct lookup
  LF123T12345: {plain: "fully planted Left Foot", medical: "fully planted Left Pes"},   // Example for direct lookup
};

// --- DIRECTIONAL SHORTHAND (Page 3 & 6) ---
// This map is for translating older shorthand if it appears in data,
// or for understanding the "Directional Moves (Left Side)" table.
// The primary vector (X,Y,Z) is handled by describeVector.
export const DIRECTIONAL_SHORTHAND_VERBOSE_MAP = {
  "+1X": { plain: "move left one unit", medical: "Positive X-axis displacement (1 unit)" },
  "-1X": { plain: "move right one unit", medical: "Negative X-axis displacement (1 unit)" },
  "+1Y": { plain: "move up one unit", medical: "Positive Y-axis displacement (1 unit, superior)" },
  "-1Y": { plain: "move down one unit", medical: "Negative Y-axis displacement (1 unit, inferior)" },
  "+1Z": { plain: "move forward one unit", medical: "Positive Z-axis displacement (1 unit, anterior/distal)" },
  "-1Z": { plain: "move backward one unit", medical: "Negative Z-axis displacement (1 unit, posterior/proximal)" },
  "v": { plain: "downward motion", medical: "Inferior displacement/vector component" },
  "^": { plain: "upward motion", medical: "Superior displacement/vector component" },
  "/>": { plain: "forward motion", medical: "Anterior/Distal displacement/vector component" },
  "</": { plain: "backward motion", medical: "Posterior/Proximal displacement/vector component" },
  "<": { plain: "leftward motion", medical: "Medial or Left Lateral displacement/vector component (contextual)" },
  ">": { plain: "rightward motion", medical: "Lateral or Right Lateral displacement/vector component (contextual)" },
  "/8": { plain: "figure 8 motion (clockwise start)", medical: "Figure-8 trajectory (clockwise initiation)"},
  "\\8": { plain: "figure 8 motion (counter-CW start)", medical: "Figure-8 trajectory (counter-clockwise initiation)"},
  "/O": { plain: "circular motion (clockwise)", medical: "Clockwise circular trajectory"},
  "\\O": { plain: "circular motion (counter-CW)", medical: "Counter-clockwise circular trajectory"},
};

// --- ROTATION PARAMETERS (Page 6) ---
export const ROTATION_PARAM_VERBOSE_MAP = {
  "+15R": { plain: "rotate clockwise 15 degrees", medical: "Clockwise rotation by 15°" },
  "-15R": { plain: "rotate counter-clockwise 15 degrees", medical: "Counter-clockwise rotation by 15°" },
};

// --- OTHER PARAMETERS (Page 6) ---
export const OTHER_PARAM_VERBOSE_MAP = {
  "+1EXT": { plain: "extend one unit", medical: "Extension by 1 unit of measure" },
  "-1FLEX": { plain: "flex one unit", medical: "Flexion by 1 unit of measure" },
};


// --- TRANSITION TYPES & INTENSITY (Page 4) ---
export const TRANSITION_QUALITY_VERBOSE_MAP = {
  "/*": { plain: "accelerating transition (slow to fast)", medical: "Accelerating phase of movement" },
  "*-": { plain: "decelerating transition (fast to slow)", medical: "Decelerating phase of movement" }, // Corrected from image which had '*-*' to '*-'
  "~*~": { plain: "smooth transition", medical: "Fluid, continuous movement transition" },
  "^*^": { plain: "wavy/undulating transition", medical: "Undulating or oscillating movement pathway" },
  "<*>": { plain: "sharp/staccato transition", medical: "Abrupt or staccato movement transition" },
  ":*:": { plain: "on the beat", medical: "Movement synchronized precisely with beat onset" },
  "..*": { plain: "behind the beat (lazy/dragged)", medical: "Movement lagging primary beat (rubato feel)" },
  "*::": { plain: "ahead of the beat (pushed)", medical: "Movement anticipating primary beat (pushed feel)" },
  "-*+": { plain: "low to high impact/intensity", medical: "Increasing kinetic energy / impact force" },
  "+*-": { plain: "high to low impact/intensity", medical: "Decreasing kinetic energy / impact force" },
  "[*]": { plain: "even impact/intensity", medical: "Consistent kinetic energy / impact force" },
};


// --- HELPER FUNCTIONS EXPORTED FOR USE IN NOTATIONUTILS ---
export const getVerboseJointName = (abbrev, type = 'plain') => {
  return JOINT_VERBOSE_MAP[abbrev]?.[type] || abbrev;
};
export const getVerboseOrientation = (orientKey, type = 'plain', isAnkle = false, plane = null) => {
  if (isAnkle && plane) {
    if (plane === 'sagittal') return ANKLE_SAGITTAL_VERBOSE_MAP[orientKey]?.[type] || orientKey;
    if (plane === 'frontal') return ANKLE_FRONTAL_VERBOSE_MAP[orientKey]?.[type] || orientKey;
    if (plane === 'transverse') return ANKLE_TRANSVERSE_VERBOSE_MAP[orientKey]?.[type] || orientKey;
  }
  return ORIENTATION_VERBOSE_MAP[orientKey]?.[type] || orientKey;
};
export const getVerboseIntent = (intentKey, type = 'plain') => {
  return INTENT_VERBOSE_MAP[intentKey]?.[type] || intentKey;
};
export const getVerboseHeadOverTarget = (targetAbbrev, type = 'plain') => {
    if (HEAD_OVER_VERBOSE_MAP[targetAbbrev]) {
        return HEAD_OVER_VERBOSE_MAP[targetAbbrev][type];
    }
    const jointDesc = JOINT_VERBOSE_MAP[targetAbbrev]?.[type];
    if (jointDesc) return type === 'plain' ? `the ${jointDesc.toLowerCase()}` : jointDesc;
    const groundDesc = GROUNDING_POINT_VERBOSE_MAP[targetAbbrev]?.[type]; // For direct match like RF123T12345
    if (groundDesc) return type === 'plain' ? `the ${groundDesc.toLowerCase()}` : groundDesc;
    return targetAbbrev;
};
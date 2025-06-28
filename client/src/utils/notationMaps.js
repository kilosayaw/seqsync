// src/utils/notationMaps.js
// This file contains mappings from POSEQr™ abbreviations and codes
// to plain English and medical/scientific descriptions.
// It's designed to be comprehensive based on provided notation images.

// --- I. JOINT ABBREVIATIONS & DESCRIPTIONS ---
// Source: "Comprehensive List of Joint Abbreviations and Symbols" (Page 3)
//         "Hand Notations" (Page 2)
//         and common joint abbreviations from constants.js (ALL_JOINTS_MAP)
export const JOINT_VERBOSE_MAP = {
  // Head & Neck
  H: { plain: "Head", medical: "Cranium & Cephalic Region" },
  N: { plain: "Neck", medical: "Cervical Spine" },

  // Torso & Core
  LS: { plain: "Left Shoulder", medical: "Left Glenohumeral & Scapulothoracic Complex" },
  RS: { plain: "Right Shoulder", medical: "Right Glenohumeral & Scapulothoracic Complex" },
  LE: { plain: "Left Elbow", medical: "Left Cubital Joint (Humeroulnar & Humeroradial)" },
  RE: { plain: "Right Elbow", medical: "Right Cubital Joint (Humeroulnar & Humeroradial)" },
  LW: { plain: "Left Wrist", medical: "Left Radiocarpal & Midcarpal Joints" },
  RW: { plain: "Right Wrist", medical: "Right Radiocarpal & Midcarpal Joints" },
  LP: { plain: "Left Palm / Hand", medical: "Left Hand (Palmar Surface, Carpals, Metacarpals, Phalanges)" }, // Combined from Page 3 & 2
  RP: { plain: "Right Palm / Hand", medical: "Right Hand (Palmar Surface, Carpals, Metacarpals, Phalanges)" },// Combined

  LH: { plain: "Left Hip", medical: "Left Coxal (Hip) Joint" },
  RH: { plain: "Right Hip", medical: "Right Coxal (Hip) Joint" },
  LK: { plain: "Left Knee", medical: "Left Genual (Knee) Joint" },
  RK: { plain: "Right Knee", medical: "Right Genual (Knee) Joint" },
  LA: { plain: "Left Ankle", medical: "Left Talocrural & Subtalar Joint Complex" },
  RA: { plain: "Right Ankle", medical: "Right Talocrural & Subtalar Joint Complex" },
  LF: { plain: "Left Foot", medical: "Left Pes (Foot)" },
  RF: { plain: "Right Foot", medical: "Right Pes (Foot)" },

  // Detailed Hand Notations (Page 2) - For specific contact points if used as "joints"
  LW1: { plain: "Left Wrist (Thumb Side)", medical: "Radial Aspect of Left Carpus" },
  LW2: { plain: "Left Wrist (Pinky Side)", medical: "Ulnar Aspect of Left Carpus" },
  RW1: { plain: "Right Wrist (Thumb Side)", medical: "Radial Aspect of Right Carpus" },
  RW2: { plain: "Right Wrist (Pinky Side)", medical: "Ulnar Aspect of Right Carpus" },
  // LP1-LP8, LPFP1-5, etc. are more for contact points, covered in GROUNDING_POINT_VERBOSE_MAP for hands
  // If they can also be "active joints" in POSEQr that have their own vector/rotation, add them here.

  // Detailed Ankle Notations (Page 1) - if LA1/LA2 are treated as selectable joints
  LA1: { plain: "Left Inner Ankle", medical: "Medial Malleolus of Left Ankle" },
  LA2: { plain: "Left Outer Ankle", medical: "Lateral Malleolus of Left Ankle" },
  RA1: { plain: "Right Inner Ankle", medical: "Medial Malleolus of Right Ankle" },
  RA2: { plain: "Right Outer Ankle", medical: "Lateral Malleolus of Right Ankle" },
  
  // Core/Spine from constants.js (if not on page 3 explicitly)
  T: { plain: "Torso/Core Center", medical: "Trunk Midline" }, // Generic, refine if needed
  PELV: { plain: "Pelvis Center", medical: "Center of Pelvic Girdle" },
  SPIN_L: { plain: "Lumbar Spine", medical: "Lumbar Vertebral Column" },
  SPIN_T: { plain: "Thoracic Spine", medical: "Thoracic Vertebral Column" },
  CHEST: { plain: "Chest Center", medical: "Sternum / Mid-Thorax" },
};

// --- II. ORIENTATION SYMBOLS & ROTATIONS ---
// Source: "Orientation Symbols" (Page 4), "Rotation parameters" (Page 6)
export const ORIENTATION_VERBOSE_MAP = {
  IN: { plain: "internally rotated", medical: "Internal (Medial) Rotation" },
  OUT: { plain: "externally rotated", medical: "External (Lateral) Rotation" },
  NEU: { plain: "neutral", medical: "Neutral Alignment / Zero Rotation" },
  FLEX: { plain: "flexed / bent", medical: "Flexion" }, // e.g., LK FLEX
  EXT: { plain: "extended / straight", medical: "Extension" }, // e.g., LK EXT
  PRO: { plain: "pronated", medical: "Pronation" }, // e.g., LP PRO (Left Palm Down)
  SUP: { plain: "supinated", medical: "Supination" }, // e.g., RP SUP (Right Palm Up)
  ULN: { plain: "ulnar deviated", medical: "Ulnar Deviation" }, // For wrists
  RAD: { plain: "radial deviated", medical: "Radial Deviation" }, // For wrists
  // Add general L_BEND, R_BEND from constants if applicable to more than spine
};

// For specific rotation amounts like "+15R"
export const ROTATION_DETAIL_VERBOSE_MAP = {
  // This map might be less used if rotation is stored as a number + direction
  // However, if "+15R" is a direct POSEQr code:
  "+15R": { plain: "rotated clockwise 15°", medical: "15° Clockwise Angular Displacement" },
  "-15R": { plain: "rotated counter-clockwise 15°", medical: "15° Counter-Clockwise Angular Displacement" },
  // Generic CW/CCW for dynamic degrees
  "CW": { plain: "clockwise", medical: "Clockwise" },
  "CCW": { plain: "counter-clockwise", medical: "Counter-Clockwise" },
};

// --- III. ANKLE-SPECIFIC PLANE ORIENTATIONS ---
// Source: constants.js (as these were well-defined for JointInputPanel)
export const ANKLE_SAGITTAL_VERBOSE_MAP = {
  NEU_SAG: { plain: "neutral (sagittal)", medical: "Neutral Sagittal Plane Alignment (Talocrural)" },
  DORSI: { plain: "toes up / dorsiflexed", medical: "Dorsiflexion (Talocrural Joint)" },
  PLANTAR: { plain: "toes down / plantarflexed", medical: "Plantarflexion (Talocrural Joint)" },
};
export const ANKLE_FRONTAL_VERBOSE_MAP = {
  NEU_FRON: { plain: "neutral (frontal)", medical: "Neutral Frontal Plane Alignment (Subtalar Joint)" },
  INVER: { plain: "sole inward / inverted", medical: "Inversion (Subtalar Joint)" },
  EVER: { plain: "sole outward / everted", medical: "Eversion (Subtalar Joint)" },
};
export const ANKLE_TRANSVERSE_VERBOSE_MAP = {
  NEU_TRA: { plain: "neutral (transverse)", medical: "Neutral Transverse Plane Alignment (Forefoot)" },
  ABD_TRA: { plain: "toes outward / abducted", medical: "Forefoot Abduction" },
  ADD_TRA: { plain: "toes inward / adducted", medical: "Forefoot Adduction" },
};

// --- IV. INTENT & ACTION MODIFIERS ---
// Source: "Other Parameters" (Page 6), "Knee/Elbow Notation Example" (Page 1), constants.js INTENT_OPTIONS
export const INTENT_VERBOSE_MAP = {
  // From constants.js
  Transition: { plain: "transitioning", medical: "Transitional Movement Phase" },
  StrikePrep: { plain: "preparing strike", medical: "Pre-Impact Loading / Strike Preparation Phase" },
  StrikeRelease: { plain: "releasing strike", medical: "Impact Execution / Strike Release Phase" },
  BlockPrep: { plain: "preparing block", medical: "Defensive Preparation / Block Loading" },
  BlockImpact: { plain: "making block impact", medical: "Defensive Contact / Block Execution" },
  Evasion: { plain: "evading", medical: "Evasive Maneuver" },
  Grounding: { plain: "shifting ground contact", medical: "Ground Reaction Force Modulation / Weight Transfer" },
  Idle: { plain: "idle / holding stance", medical: "Static Posture / Stance Maintenance" },
  Recover: { plain: "recovering / resetting", medical: "Post-Action Recovery / Positional Reset" },
  Coil: { plain: "coiling energy", medical: "Eccentric Loading / Potential Energy Storage" },
  ReleasePwr: { plain: "releasing power", medical: "Concentric Contraction / Kinetic Energy Release" },
  Reach: { plain: "reaching", medical: "Limb Protraction / Reaching Action" },
  Pull: { plain: "pulling", medical: "Limb Retraction / Pulling Action" },
  Stabilize: { plain: "stabilizing", medical: "Isometric Contraction for Stabilization" },
  // From Page 6 (these seem like modifications of FLEX/EXT)
  "+1EXT": { plain: "extending further (1 unit)", medical: "Increased Extension (1 unit magnitude)" },
  "-1FLEX": { plain: "flexing further (1 unit)", medical: "Increased Flexion (1 unit magnitude)" },
  // Your example "LE OUT FLEX (1,0,0)" implies FLEX can be an intent or state.
  // If it's distinct from orientation, add it here. Often, FLEX/EXT are orientations.
  // Let's assume for now they are primarily orientations unless POSEQr explicitly uses them as intent codes.
};

// --- V. GROUNDING POINTS (FOOT & HAND) ---
// Source: "Foot Notations" (Page 1), "Hand Notations" (Page 2)
// Keys here should match the exact strings used in POSEQr™ for these grounding states.
export const GROUNDING_POINT_VERBOSE_MAP = {
  // === Left Foot ===
  LF1: { plain: "inner ball of left foot", medical: "Plantar aspect of Left 1st Metatarsal Head" },
  LF2: { plain: "outer ball of left foot", medical: "Plantar aspect of Left 5th Metatarsal Head (approximating 'pinky toe ball')" },
  LF3: { plain: "heel of left foot", medical: "Plantar aspect of Left Calcaneus (heel)" },
  LF1T1: { plain: "left inner ball & big toe", medical: "Plantar Left 1st Metatarsal Head & Hallux" },
  LF1T12: { plain: "left inner ball, big toe & 2nd toe", medical: "Plantar Left 1st MTH, Hallux, & 2nd Digit" }, // "pointer toe"
  LF123T12345: { plain: "full left foot plant", medical: "Full Plantar Contact Left Pes (All Metatarsal Heads, Calcaneus, & All Phalanges)" },
  // LF1T12 (duplicate from image, using first definition)
  LF12: { plain: "left front foot (ball area)", medical: "Plantar aspect of Left Metatarsal Heads (1-5)" }, // "from ball under big toe across to ball under pinky"
  LF23: { plain: "left outer blade (outer ball to heel)", medical: "Lateral Border of Left Pes (5th MTH to Calcaneus)" },
  LF13: { plain: "left inner blade (inner ball to heel)", medical: "Medial Border of Left Pes (1st MTH to Calcaneus)" },
  LFT1: { plain: "left big toe (flat print)", medical: "Plantar Aspect of Left Hallux" },
  LFT1Tip: { plain: "tip of left big toe", medical: "Distal Plantar Aspect of Left Hallux" },
  LFT1Over: { plain: "top of left big toe (nail side)", medical: "Dorsal Aspect of Left Hallux" },

  // === Right Foot === (Mirroring Left)
  RF1: { plain: "inner ball of right foot", medical: "Plantar aspect of Right 1st Metatarsal Head" },
  RF2: { plain: "outer ball of right foot", medical: "Plantar aspect of Right 5th Metatarsal Head" },
  RF3: { plain: "heel of right foot", medical: "Plantar aspect of Right Calcaneus" },
  RF1T1: { plain: "right inner ball & big toe", medical: "Plantar Right 1st Metatarsal Head & Hallux" },
  RF1T12: { plain: "right inner ball, big toe & 2nd toe", medical: "Plantar Right 1st MTH, Hallux, & 2nd Digit" },
  RF123T12345: { plain: "full right foot plant", medical: "Full Plantar Contact Right Pes" },
  RF2T12345: { plain: "right ball of foot & all toes", medical: "Plantar Right Metatarsal Heads (assumed all) & All Phalanges" }, // "Right ball of foot and the big and pointer toe prints" is ambiguous, taking wider interpretation
  RF12: { plain: "right front foot (ball area)", medical: "Plantar aspect of Right Metatarsal Heads (1-5)" },
  RF23: { plain: "right outer blade (outer ball to heel)", medical: "Lateral Border of Right Pes (5th MTH to Calcaneus)" },
  RF13: { plain: "right inner blade (inner ball to heel)", medical: "Medial Border of Right Pes (1st MTH to Calcaneus)" },
  RFT1: { plain: "right big toe (flat print)", medical: "Plantar Aspect of Right Hallux" },
  RFT1Tip: { plain: "tip of right big toe", medical: "Distal Plantar Aspect of Right Hallux" },
  RFT1Over: { plain: "top of right big toe (nail side)", medical: "Dorsal Aspect of Right Hallux" },

  // === Left Hand / Palm === (Page 2)
  LP: { plain: "left palm (general contact)", medical: "General Left Palmar Surface Contact" },
  LP1: { plain: "base of left index finger (palm side)", medical: "Palmar base of Left 2nd Metacarpal" },
  LP2: { plain: "base of left middle finger (palm side)", medical: "Palmar base of Left 3rd Metacarpal" },
  LP3: { plain: "base of left ring finger (palm side)", medical: "Palmar base of Left 4th Metacarpal" },
  LP4: { plain: "base of left pinky finger (palm side)", medical: "Palmar base of Left 5th Metacarpal" },
  LP5: { plain: "base of left thumb (palm side, above LP7)", medical: "Palmar base of Left 1st Metacarpal (Thenar)" },
  LP6: { plain: "left palm base (pinky side, above LP8)", medical: "Palmar base, Ulnar Side (Hypothenar)" },
  LP7: { plain: "left wrist/palm (thumb side alignment)", medical: "Radial Border of Left Carpus/Proximal Metacarpus" },
  LP8: { plain: "left wrist/palm (pinky side alignment)", medical: "Ulnar Border of Left Carpus/Proximal Metacarpus" },
  LPFP1: { plain: "left index fingertip (print)", medical: "Distal Volar Pad, Left 2nd Digit" },
  LPFP2: { plain: "left middle fingertip (print)", medical: "Distal Volar Pad, Left 3rd Digit" },
  LPFP3: { plain: "left ring fingertip (print)", medical: "Distal Volar Pad, Left 4th Digit" },
  LPFP4: { plain: "left pinky fingertip (print)", medical: "Distal Volar Pad, Left 5th Digit" },
  LPFP5: { plain: "left thumb tip (print)", medical: "Distal Volar Pad, Left 1st Digit (Pollux)" },
  LPFP12345: { plain: "all left fingertips (prints)", medical: "All Distal Volar Pads, Left Digits I-V" },
  LP1234FP12345: { plain: "left palm & fingertips (planted, except base of thumb)", medical: "Left Palmar Surface & Digital Volar Pads Contact (excluding Thenar base)" },
  LP12345: { plain: "full left palm flat", medical: "Full Left Palmar Surface Contact (Metacarpals)" },
  LP1234567: { plain: "full left palm including wrist", medical: "Full Left Palmar Surface and Anterior Wrist Contact" },
  LPBK1234: { plain: "left knuckles (base of fingers II-V, back of hand)", medical: "Dorsal Aspect of Left Metacarpophalangeal Joints (II-V)" },
  LPMK: { plain: "left mid-knuckles (back of hand)", medical: "Dorsal Aspect of Left Proximal Interphalangeal Joints" },
  LPTK: { plain: "left top-knuckles (back of hand)", medical: "Dorsal Aspect of Left Distal Interphalangeal Joints" },

  // === Right Hand / Palm === (Mirroring Left)
  RP: { plain: "right palm (general contact)", medical: "General Right Palmar Surface Contact" },
  RP1: { plain: "base of right index finger (palm side)", medical: "Palmar base of Right 2nd Metacarpal" },
  RP2: { plain: "base of right middle finger (palm side)", medical: "Palmar base of Right 3rd Metacarpal" },
  RP3: { plain: "base of right ring finger (palm side)", medical: "Palmar base of Right 4th Metacarpal" },
  RP4: { plain: "base of right pinky finger (palm side)", medical: "Palmar base of Right 5th Metacarpal" },
  RP5: { plain: "base of right thumb (palm side, above RP7)", medical: "Palmar base of Right 1st Metacarpal (Thenar)" },
  RP6: { plain: "right palm base (pinky side, above RP8)", medical: "Palmar base, Ulnar Side (Hypothenar)" },
  RP7: { plain: "right wrist/palm (thumb side alignment)", medical: "Radial Border of Right Carpus/Proximal Metacarpus" },
  RP8: { plain: "right wrist/palm (pinky side alignment)", medical: "Ulnar Border of Right Carpus/Proximal Metacarpus" },
  RPFP1: { plain: "right index fingertip (print)", medical: "Distal Volar Pad, Right 2nd Digit" },
  RPFP2: { plain: "right middle fingertip (print)", medical: "Distal Volar Pad, Right 3rd Digit" },
  RPFP3: { plain: "right ring fingertip (print)", medical: "Distal Volar Pad, Right 4th Digit" },
  RPFP4: { plain: "right pinky fingertip (print)", medical: "Distal Volar Pad, Right 5th Digit" },
  RPFP5: { plain: "right thumb tip (print)", medical: "Distal Volar Pad, Right 1st Digit (Pollux)" },
  RPFP12345: { plain: "all right fingertips (prints)", medical: "All Distal Volar Pads, Right Digits I-V" },
  RP1234FP12345: { plain: "right palm & fingertips (planted, except base of thumb)", medical: "Right Palmar Surface & Digital Volar Pads Contact (excluding Thenar base)" },
  RP12345: { plain: "full right palm flat", medical: "Full Right Palmar Surface Contact (Metacarpals)" },
  RP1234567: { plain: "full right palm including wrist", medical: "Full Right Palmar Surface and Anterior Wrist Contact" },
  RPBK1234: { plain: "right knuckles (base of fingers II-V, back of hand)", medical: "Dorsal Aspect of Right Metacarpophalangeal Joints (II-V)" },
  RPMK: { plain: "right mid-knuckles (back of hand)", medical: "Dorsal Aspect of Right Proximal Interphalangeal Joints" },
  RPTK: { plain: "right top-knuckles (back of hand)", medical: "Dorsal Aspect of Right Distal Interphalangeal Joints" },

  // Joystick convenience mappings if these exact strings are stored from joystickMap
  L_FULL_PLANT: { plain: "full left foot contact", medical: "Full Left Pes Ground Contact"},
  R_FULL_PLANT: { plain: "full right foot contact", medical: "Full Right Pes Ground Contact"},
  L_LIFT: {plain: "left foot lifted", medical: "Left Pes Non-Weight Bearing / Swing Phase"},
  R_LIFT: {plain: "right foot lifted", medical: "Right Pes Non-Weight Bearing / Swing Phase"},
};

// --- VI. VECTOR DIRECTIONS (from X,Y,Z values) ---
// Source: "Coordinates explained" (Page 6) & "Orientation Shorthand Mapping" (Page 6)
// Note: POSEQr X=1 means LEFT, X=-1 means RIGHT for joints relative to body midline.
// POSEQr Y=1 means UP, Y=-1 means DOWN.
// POSEQr Z=1 means FORWARD (away from body/camera), Z=-1 means BACKWARD (towards body/camera).
export const VECTOR_PRIMARY_DIRECTION_MAP = {
  X_POS: { plain: "to its left", medical: "Positive X-axis displacement (Leftward relative to midline)" },
  X_NEG: { plain: "to its right", medical: "Negative X-axis displacement (Rightward relative to midline)" },
  Y_POS: { plain: "upwards", medical: "Positive Y-axis displacement (Superiorly)" },
  Y_NEG: { plain: "downwards", medical: "Negative Y-axis displacement (Inferiorly)" },
  Z_POS: { plain: "forward / away", medical: "Positive Z-axis displacement (Anteriorly / Distally)" },
  Z_NEG: { plain: "backward / closer", medical: "Negative Z-axis displacement (Posteriorly / Proximally)" },
};

// Map for shorthand like "+1X" (Page 6) - distinct from vector triplet
export const SHORTHAND_VECTOR_MAP = {
  "+1X": { plain: "move left one unit", medical: "Displace +1 unit along X-axis (Left)" },
  "-1X": { plain: "move right one unit", medical: "Displace -1 unit along X-axis (Right)" },
  "+1Y": { plain: "move up one unit", medical: "Displace +1 unit along Y-axis (Up)" },
  "-1Y": { plain: "move down one unit", medical: "Displace -1 unit along Y-axis (Down)" },
  "+1Z": { plain: "move forward one unit", medical: "Displace +1 unit along Z-axis (Forward)" },
  "-1Z": { plain: "move backward one unit", medical: "Displace -1 unit along Z-axis (Backward)" },
};

// --- VII. DIRECTIONAL MOVES (General - Page 3) ---
// These are general symbols that might combine with a joint, e.g., "LSv"
// They often imply a primary vector component.
export const SYMBOLIC_DIRECTION_MAP = {
  "v": { plain: "downward motion", medical: "Predominantly Inferior Vector" },   // e.g., LSv
  "^": { plain: "upward motion", medical: "Predominantly Superior Vector" },     // e.g., LS^
  "/>": { plain: "forward motion", medical: "Predominantly Anterior/Distal Vector" },// e.g., LS/>
  "</": { plain: "backward motion", medical: "Predominantly Posterior/Proximal Vector" },// e.g., LS</
  "<": { plain: "leftward motion", medical: "Predominantly Left Lateral Vector" }, // e.g., LS< (or medial depending on context)
  ">": { plain: "rightward motion", medical: "Predominantly Right Lateral Vector" },// e.g., LS> (or lateral depending on context)
  // Figure 8 and Circle might be more complex path types rather than simple orientations/vectors
  "/8": { plain: "figure 8 path (clockwise start)", medical: "Figure-8 Trajectory (Clockwise Initial Phase)"},
  "\\8": { plain: "figure 8 path (counter-CW start)", medical: "Figure-8 Trajectory (Counter-Clockwise Initial Phase)"},
  "/O": { plain: "circular path (clockwise)", medical: "Clockwise Circular Trajectory"},
  "\\O": { plain: "circular path (counter-CW)", medical: "Counter-Clockwise Circular Trajectory"},
};

// --- VIII. HEAD OVER TARGETS ---
// Source: "Head Over Hop Concept" (Page 1) & constants.js
export const HEAD_OVER_VERBOSE_MAP = {
  None: { plain: "not specified", medical: "Cephalic alignment not specified or neutral over CoM" },
  CENTER: { plain: "Center of Mass / Base of Support", medical: "Cephalic alignment over estimated Center of Mass / Base of Support" },
  // For specific joints like RF123T12345, the getVerboseHeadOverTarget helper will combine JOINT and GROUNDING maps.
  RF123T12345: {plain: "fully planted Right Foot", medical: "fully planted Right Pes (as Base of Support)"},
  LF123T12345: {plain: "fully planted Left Foot", medical: "fully planted Left Pes (as Base of Support)"},
  // Add other common direct targets if they have specific non-joint names
};

// --- IX. ANGLE REPRESENTATION (Page 4) ---
// e.g., RS @12 (Right Shoulder at 12 o'clock)
// This usually implies a target direction in a 2D plane relative to the joint's current facing.
export const ANGLE_CLOCK_VERBOSE_MAP = {
  "@12": { plain: "towards 12 o'clock (straight ahead/up)", medical: "Target vector aligned with 0°/Superior (contextual)" },
  "@3": { plain: "towards 3 o'clock (to its right)", medical: "Target vector aligned with 90°/Right Lateral (contextual)" },
  "@6": { plain: "towards 6 o'clock (straight behind/down)", medical: "Target vector aligned with 180°/Inferior (contextual)" },
  "@9": { plain: "towards 9 o'clock (to its left)", medical: "Target vector aligned with 270°/Left Lateral (contextual)" },
  // Add @1, @2 etc. if used, with corresponding degrees/descriptions.
};

// --- X. TRANSITION TYPES & INTENSITY LEVELS (Page 4) ---
// These describe the quality of movement *into* the current beat's pose, or between beats.
export const TRANSITION_QUALITY_VERBOSE_MAP = {
  "/*": { plain: "accelerating into pose (slow to fast)", medical: "Movement Phase: Acceleration" },
  "*-": { plain: "decelerating into pose (fast to slow)", medical: "Movement Phase: Deceleration" },
  "~*~": { plain: "smoothly into pose", medical: "Movement Quality: Fluid / Continuous" },
  "^*^": { plain: "undulating into pose", medical: "Movement Quality: Oscillating / Undulating" }, // My interpretation of "Wavy"
  "<*>": { plain: "sharply into pose", medical: "Movement Quality: Staccato / Abrupt" },
  ":*:": { plain: "on the beat", medical: "Timing: Synchronized with Beat Onset" },
  "..*": { plain: "behind the beat", medical: "Timing: Delayed / Rubato (Lagging)" },
  "*::": { plain: "ahead of the beat", medical: "Timing: Anticipatory / Pushed" },
  "-*+": { plain: "low to high impact/intensity", medical: "Dynamics: Increasing Kinetic Energy / Impact Force" },
  "+*-": { plain: "high to low impact/intensity", medical: "Dynamics: Decreasing Kinetic Energy / Impact Force" },
  "[*]": { plain: "even impact/intensity", medical: "Dynamics: Consistent Kinetic Energy / Impact Force" },
  // The combined symbols like / = / are complex path + quality and may need specific handling or represent sequences.
};


// --- HELPER FUNCTIONS EXPORTED FOR USE ELSEWHERE ---
export const getVerboseJointName = (abbrev, type = 'plain') => {
  return JOINT_VERBOSE_MAP[abbrev]?.[type] || abbrev;
};

export const getVerboseOrientation = (orientKey, type = 'plain', isAnkle = false, plane = null) => {
  if (isAnkle && plane) {
    if (plane === 'sagittal') return ANKLE_SAGITTAL_VERBOSE_MAP[orientKey]?.[type] || orientKey;
    if (plane === 'frontal') return ANKLE_FRONTAL_VERBOSE_MAP[orientKey]?.[type] || orientKey;
    if (plane === 'transverse') return ANKLE_TRANSVERSE_VERBOSE_MAP[orientKey]?.[type] || orientKey;
    // Fallback for generic ankle orientation if plane is unknown but isAnkle is true
    return ORIENTATION_VERBOSE_MAP[orientKey]?.[type] || orientKey;
  }
  return ORIENTATION_VERBOSE_MAP[orientKey]?.[type] || orientKey;
};

export const getVerboseIntent = (intentKey, type = 'plain') => {
  return INTENT_VERBOSE_MAP[intentKey]?.[type] || intentKey;
};

export const getVerboseHeadOverTarget = (targetAbbrev, type = 'plain') => {
    if (!targetAbbrev) return HEAD_OVER_VERBOSE_MAP['None'][type];
    if (HEAD_OVER_VERBOSE_MAP[targetAbbrev]) { // Direct map like 'CENTER' or 'RF123T12345'
        return HEAD_OVER_VERBOSE_MAP[targetAbbrev][type];
    }
    // If it's a simpler joint abbrev (e.g., LS, RH)
    const jointDesc = JOINT_VERBOSE_MAP[targetAbbrev]?.[type];
    if (jointDesc) {
        return type === 'plain' ? `the ${jointDesc.toLowerCase()}` : jointDesc;
    }
    // If it's a grounding point not directly in HEAD_OVER_VERBOSE_MAP but in GROUNDING_POINT_VERBOSE_MAP
    const groundDesc = GROUNDING_POINT_VERBOSE_MAP[targetAbbrev]?.[type];
    if (groundDesc) {
         return type === 'plain' ? `the ${groundDesc.toLowerCase()}` : groundDesc;
    }
    return targetAbbrev; // Fallback to the abbreviation itself
};

// You might need more helpers, e.g., for parsing combined grounding strings if they aren't direct keys.
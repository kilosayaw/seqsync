// src/utils/keyboardMaps.js

// Maps keyboard keys to beat pad indices (0-15)
export const KEYBOARD_LAYOUT_MODE_SEQ = {
  '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7,
  'q': 8, 'w': 9, 'e': 10, 'r': 11, 't': 12, 'y': 13, 'u': 14, 'i': 15,
};

// Global mode switching
export const KEYBOARD_MODE_SWITCH = {
  'p': 'POS',
  's': 'SEQ',
  'c': 'SYNC',
};

// Global transport controls
export const KEYBOARD_TRANSPORT_CONTROLS = {
  ' ': 'playPause',
  'Enter': 'stop', // Using Enter for stop as Escape is for modals/panels
};
// Arrow keys handled separately with shift modifier check in the component

// POS Mode specific navigation
export const KEYBOARD_NAVIGATION_POS_MODE = {
  '[': 'prevBeat',
  ']': 'nextBeat',
};

// POS Mode joint vector nudging
export const KEYBOARD_JOINT_NUDGE_CONTROLS = {
  'j': { axis: 'x', delta: -1 }, // Left
  'l': { axis: 'x', delta: 1 },  // Right
  'i': { axis: 'y', delta: 1 },  // Up
  'k': { axis: 'y', delta: -1 }, // Down
  'u': { axis: 'z', delta: -1 }, // Toward (cycle)
  'o': { axis: 'z', delta: 1 },  // Away (cycle)
};

// POS Mode foot grounding hotkeys
export const KEYBOARD_FOOT_GROUNDING = {
    // Left Foot
    'z': { side: 'L', points: ['1'], label: 'L-Ball-1' },
    'x': { side: 'L', points: ['2'], label: 'L-Ball-2' },
    'v': { side: 'L', points: ['3'], label: 'L-Heel' },
    'f': { side: 'L', points: ['1', '2', '3', 'T1', 'T2', 'T3', 'T4', 'T5'], label: 'L-Full Plant' },
    // Right Foot
    ',': { side: 'R', points: ['1'], label: 'R-Ball-1' },
    '.': { side: 'R', points: ['2'], label: 'R-Ball-2' },
    '/': { side: 'R', points: ['3'], label: 'R-Heel' },
    'j': { side: 'R', points: ['1', '2', '3', 'T1', 'T2', 'T3', 'T4', 'T5'], label: 'R-Full Plant' },
    // Special Actions
    'b': { side: 'L', points: ['2', '3'], label: 'L-Outer Blade Pivot', action: 'PIV_OUT'},
    'n': { side: 'R', points: ['2', '3'], label: 'R-Outer Blade Pivot', action: 'PIV_OUT'},
};
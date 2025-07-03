export const UI_PADS_PER_BAR = 16;
export const DATA_DEFAULT_BEATS_PER_BAR = 16;
export const BARS_PER_SEQUENCE = 4;
export const DEFAULT_BPM = 120;
export const BPM_MIN = 30;
export const BPM_MAX = 300;

export const JOINT_LIST = [
    { id: 'LS', name: 'L Shoulder' }, { id: 'RS', name: 'R Shoulder' },
    { id: 'LE', name: 'L Elbow' },    { id: 'RE', name: 'R Elbow' },
    { id: 'LW', name: 'L Wrist' },    { id: 'RW', name: 'R Wrist' },
    { id: 'LP', name: 'L Palm' },     { id: 'RP', name: 'R Palm' },
    { id: 'LH', name: 'L Hip' },      { id: 'RH', name: 'R Hip' },
    { id: 'LK', name: 'L Knee' },     { id: 'RK', name: 'R Knee' },
    { id: 'LA', name: 'L Ankle' },    { id: 'RA', name: 'R Ankle' },
    { id: 'LF', name: 'L Foot' },     { id: 'RF', name: 'R Foot' },
    { id: 'H', name: 'Head' },
];

export const BASE_FOOT_PATHS = {
    L: '/ground/foot-left.png',
    R: '/ground/foot-right.png',
};

export const FOOT_CONTACT_POINTS = {
  L: [
    { notation: '1', path: '/ground/L1.png' }, { notation: '2', path: '/ground/L2.png' }, { notation: '3', path: '/ground/L3.png' },
    { notation: 'T1', path: '/ground/LT1.png' }, { notation: 'T2', path: '/ground/LT2.png' }, { notation: 'T3', path: '/ground/LT3.png' }, { notation: 'T4', path: '/ground/LT4.png' }, { notation: 'T5', path: '/ground/LT5.png' },
  ],
  R: [
    { notation: '1', path: '/ground/R1.png' }, { notation: '2', path: '/ground/R2.png' }, { notation: '3', path: '/ground/R3.png' },
    { notation: 'T1', path: '/ground/RT1.png' }, { notation: 'T2', path: '/ground/RT2.png' }, { notation: 'T3', path: '/ground/RT3.png' }, { notation: 'T4', path: '/ground/RT4.png' }, { notation: 'T5', path: '/ground/RT5.png' },
  ]
};

export const FOOT_HOTSPOT_COORDINATES = {
    L: [
        { notation: '3',  cx: 200, cy: 380, r: 38 }, // Heel
        { notation: '1',  cx: 240, cy: 265, r: 36 }, // Ball (inside)
        { notation: '2',  cx: 160, cy: 275, r: 32 }, // Ball (outside)
        { notation: 'T1', cx: 265, cy: 170, r: 26 }, // Big Toe
        { notation: 'T2', cx: 220, cy: 135, r: 22 }, // Toe 2
        { notation: 'T3', cx: 175, cy: 138, r: 20 }, // Toe 3
        { notation: 'T4', cx: 140, cy: 165, r: 18 }, // Toe 4
        { notation: 'T5', cx: 115, cy: 195, r: 20 }, // Toe 5
    ],
    R: [ // Mirrored from L around a vertical axis at x=200
        { notation: '3',  cx: 200, cy: 380, r: 38 }, // Heel
        { notation: '1',  cx: 160, cy: 265, r: 36 }, // Ball (inside)
        { notation: '2',  cx: 240, cy: 275, r: 32 }, // Ball (outside)
        { notation: 'T1', cx: 135, cy: 170, r: 26 }, // Big Toe
        { notation: 'T2', cx: 180, cy: 135, r: 22 }, // Toe 2
        { notation: 'T3', cx: 225, cy: 138, r: 20 }, // Toe 3
        { notation: 'T4', cx: 260, cy: 165, r: 18 }, // Toe 4
        { notation: 'T5', cx: 285, cy: 195, r: 20 }, // Toe 5
    ]
};
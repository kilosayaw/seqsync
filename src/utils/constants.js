// ==================================================================
// SĒQsync - Definitive Constants and Notation Mapping
// ==================================================================

// The full map of all 33 BlazePose keypoints to our naming convention.
// This is the absolute source of truth for joint indices.
export const BLAZEPOSE_KEYPOINTS = [
    { name: 'Nose', id: 'Nose', index: 0 },
    { name: 'Left Eye Inner', id: 'LEyeInner', index: 1 },
    { name: 'Left Eye', id: 'LEye', index: 2 },
    { name: 'Left Eye Outer', id: 'LEyeOuter', index: 3 },
    { name: 'Right Eye Inner', id: 'REyeInner', index: 4 },
    { name: 'Right Eye', id: 'REye', index: 5 },
    { name: 'Right Eye Outer', id: 'REyeOuter', index: 6 },
    { name: 'Left Ear', id: 'LEar', index: 7 },
    { name: 'Right Ear', id: 'REar', index: 8 },
    { name: 'Mouth Left', id: 'MouthL', index: 9 },
    { name: 'Mouth Right', id: 'MouthR', index: 10 },
    { name: 'Left Shoulder', id: 'LS', index: 11 },
    { name: 'Right Shoulder', id: 'RS', index: 12 },
    { name: 'Left Elbow', id: 'LE', index: 13 },
    { name: 'Right Elbow', id: 'RE', index: 14 },
    { name: 'Left Wrist', id: 'LW', index: 15 },
    { name: 'Right Wrist', id: 'RW', index: 16 },
    { name: 'Left Pinky', id: 'LPinky', index: 17 },
    { name: 'Right Pinky', id: 'RPinky', index: 18 },
    { name: 'Left Index', id: 'LIndex', index: 19 },
    { name: 'Right Index', id: 'RIndex', index: 20 },
    { name: 'Left Thumb', id: 'LThumb', index: 21 },
    { name: 'Right Thumb', id: 'RThumb', index: 22 },
    { name: 'Left Hip', id: 'LH', index: 23 },
    { name: 'Right Hip', id: 'RH', index: 24 },
    { name: 'Left Knee', id: 'LK', index: 25 },
    { name: 'Right Knee', id: 'RK', index: 26 },
    { name: 'Left Ankle', id: 'LA', index: 27 },
    { name: 'Right Ankle', id: 'RA', index: 28 },
    { name: 'Left Heel', id: 'LHeel', index: 29 },
    { name: 'Right Heel', id: 'RHeel', index: 30 },
    { name: 'Left Foot Index', id: 'LFoot', index: 31 },
    { name: 'Right Foot Index', id: 'RFoot', index: 32 },
];

// A filtered list of joints that we want to make selectable in the UI.
// This decouples the UI from the raw data source.
export const UI_JOINT_LIST = [
    { name: 'L Shoulder', id: 'LS', index: 11, side: 'left' },
    { name: 'L Elbow', id: 'LE', index: 13, side: 'left' },
    { name: 'L Wrist', id: 'LW', index: 15, side: 'left' },
    { name: 'L Hip', id: 'LH', index: 23, side: 'left' },
    { name: 'L Knee', id: 'LK', index: 25, side: 'left' },
    { name: 'L Ankle', id: 'LA', index: 27, side: 'left' },
    { name: 'R Shoulder', id: 'RS', index: 12, side: 'right' },
    { name: 'R Elbow', id: 'RE', index: 14, side: 'right' },
    { name: 'R Wrist', id: 'RW', index: 16, side: 'right' },
    { name: 'R Hip', id: 'RH', index: 24, side: 'right' },
    { name: 'R Knee', id: 'RK', index: 26, side: 'right' },
    { name: 'R Ankle', id: 'RA', index: 28, side: 'right' },
];

// Pre-filtered lists for the UI components to use directly
export const UI_LEFT_JOINTS = UI_JOINT_LIST.filter(j => j.side === 'left');
export const UI_RIGHT_JOINTS = UI_JOINT_LIST.filter(j => j.side === 'right');


// Grounding notations from your document. This can be expanded.
export const GROUNDING_STATES = {
    // Left Foot
    L_FULL: '/ground/L123T12345.png',
    L_HEEL_UP: '/ground/L12T12345.png',
    L_HEEL: '/ground/LF3.png', // Assuming LF3 is heel ball
    // Right Foot
    R_FULL: '/ground/R123T12345.png',
    R_HEEL_UP: '/ground/R12T12345.png',
    R_HEEL: '/ground/RF3.png', // Assuming RF3 is heel ball
};
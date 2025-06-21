/* @refresh skip */

// Function to create an empty pose object with default values
const createEmptyPose = () => {
    const pose = {};
    const parts = [
        'N', 'LS', 'LE', 'LW', 'RS', 'RE', 'RW',
        'LH', 'LK', 'LA', 'LF', 'RH', 'RK', 'RA', 'RF'
    ];
    parts.forEach(part => {
        pose[part] = {
            x: 0, y: 0, z: 0, // Position
            rx: 0, ry: 0, rz: 0, // Rotation
            grounded: false, // For feet and hands
            weight: 0, // Weight distribution for grounded parts
            visibility: 0, // Visibility score from model
            // Add any other relevant properties here
        };
    });
    // Set default grounded state for feet
    pose.LF.grounded = true;
    pose.RF.grounded = true;
    pose.LF.weight = 50;
    pose.RF.weight = 50;
    return pose;
};

export default createEmptyPose;
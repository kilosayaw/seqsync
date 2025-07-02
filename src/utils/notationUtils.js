// A new utility to format our complex notation data into a human-readable string.
export const formatNotationShorthand = (beatData, selectedJointId) => {
    if (!beatData || !beatData.joints || !selectedJointId) return '----';

    const joint = beatData.joints[selectedJointId];
    if (!joint) return '----';

    const parts = [];
    parts.push(selectedJointId); // e.g., 'LK'

    if (joint.rotation && joint.rotation !== 'NEU') {
        parts.push(joint.rotation); // e.g., 'IN'
    }

    if (joint.angle !== 0) {
        const sign = joint.angle > 0 ? '+' : '';
        parts.push(`${sign}${joint.angle}R`); // e.g., '+20R'
    }

    if (joint.position && joint.position !== 'EXT') {
        parts.push(`@ ${joint.flexion} ${joint.position}`); // e.g., '@ 90 FLEX'
    }
    
    // Handle special case for foot grounding
    if (selectedJointId === 'LF' || selectedJointId === 'RF') {
        if (joint.grounding) {
            return joint.grounding;
        }
    }
    
    return parts.join(' ');
};
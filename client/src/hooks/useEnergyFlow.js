import { useState, useEffect } from 'react';
import { getNextEnergyTransfer } from '../utils/biomechanics'; // This function needs to be created

export const useEnergyFlow = (currentPose) => {
    const [flow, setFlow] = useState({ path: [], nextBestJoint: null, momentum: 0 });

    useEffect(() => {
        if (currentPose && currentPose.jointInfo) {
            // Call a new, complex function in biomechanics.js
            // This function will analyze the current pose (grounding, rotations)
            // and return the calculated energy path.
            const newFlow = getNextEnergyTransfer(currentPose);
            setFlow(newFlow);
        }
    }, [currentPose]);

    return flow;
};
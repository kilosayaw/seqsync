// src/components/FullWidthNotation/FullWidthNotation.jsx
import React from 'react';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import './FullWidthNotation.css';

const FullWidthNotation = () => {
    const { songData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentTime, beat: currentBeat } = usePlayback();
    const { selectedBar, activePad } = useUIState();

    // Determine which beat's data to display
    const beatToDisplay = isPlaying ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatToDisplay;
    const currentData = songData[globalIndex];

    // Format the notation string
    let leftFootNotation = "--";
    if (currentData?.joints?.LF) {
        const { grounding, angle } = currentData.joints.LF;
        if (grounding && !grounding.endsWith('0')) {
            leftFootNotation = `${grounding}@${Math.round(angle || 0)}°`;
        }
    }

    let rightFootNotation = "--";
    if (currentData?.joints?.RF) {
        const { grounding, angle } = currentData.joints.RF;
        if (grounding && !grounding.endsWith('0')) {
            rightFootNotation = `${grounding}@${Math.round(angle || 0)}°`;
        }
    }

    // This formatTime function should be imported from your utils if available
    const formatTime = (seconds) => new Date((seconds || 0) * 1000).toISOString().substr(11, 8);
    const barStr = String(currentData?.bar || 1).padStart(2, '0');
    const beatStr = String((currentData?.beat || 0) + 1).padStart(2, '0');

    const displayString = `poSĒQr™ | ${formatTime(currentTime)} | ${barStr}:${beatStr} | ${leftFootNotation} | ${rightFootNotation}`;

    return (
        <div className="full-width-notation-container">
            <span className="notation-string">
                {displayString}
            </span>
        </div>
    );
};

export default FullWidthNotation;
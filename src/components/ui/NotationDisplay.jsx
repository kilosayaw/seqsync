import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useUIState } from '../../context/UIStateContext';
import { formatTime } from '../../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { songData, STEPS_PER_BAR } = useSequence();
    const { isPlaying, currentTime } = usePlayback();
    // In a real scenario, we'd get the current beat from playback context
    const currentBeat = usePlayback().currentBeat || 0; 
    const { selectedBar, activePad } = useUIState();

    const beatToDisplay = isPlaying ? currentBeat : (activePad ?? 0);
    const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + beatToDisplay;
    const beatData = songData[globalIndex];

    const timeStr = formatTime(currentTime);
    const barStr = String(beatData?.bar || 1).padStart(2, '0');
    
    const lfNotation = beatData?.joints?.LF?.grounding ? `${beatData.joints.LF.grounding}@${Math.round(beatData.joints.LF.angle || 0)}°` : 'LF123T12345@0°';
    const rfNotation = beatData?.joints?.RF?.grounding ? `${beatData.joints.RF.grounding}@${Math.round(beatData.joints.RF.angle || 0)}°` : 'RF123T12345@0°';

    const displayString = `poSĒQr™ | ${timeStr} | ${barStr} | ${lfNotation} | ${rfNotation}`;

    return (
        <div className="notation-display-container">
            <div className="notation-text">
                {displayString}
            </div>
        </div>
    );
};
export default NotationDisplay;
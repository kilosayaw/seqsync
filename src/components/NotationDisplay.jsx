import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePlayback } from '../context/PlaybackContext';
// FIX: The function name is corrected from formatNotationShorthand to formatFullNotation.
import { formatFullNotation } from '../utils/notationUtils';
import './NotationDisplay.css';

const NotationDisplay = () => {
    const { selectedBeat, selectedBar } = useUIState();
    const { songData } = useSequence();
    const { currentTime } = usePlayback();

    const globalIndex = selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1;
    const currentBeatData = globalIndex !== -1 ? songData[globalIndex] : null;

    // FIX: The function call is also updated to use the correct name.
    const shorthand = formatFullNotation(currentBeatData, currentTime, selectedBar, selectedBeat);

    return (
        <div className="notation-display-compact">
            <span className="notation-label">poSĒQr™:</span>
            <span className="notation-content">{shorthand}</span>
        </div>
    );
};

export default NotationDisplay;
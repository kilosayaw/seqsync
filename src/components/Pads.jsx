import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePadMapping } from '../hooks/usePadMapping';
import { usePlayback } from '../context/PlaybackContext';
import './Pads.css';

const Pads = ({ side }) => {
    const { selectedBar, activePad } = useUIState();
    const { songData, STEPS_PER_BAR } = useSequence();
    const { activePadIndex, handlePadDown, handlePadUp } = usePadMapping();
    const { isPlaying } = usePlayback();
    
    const padOffset = side === 'left' ? 0 : STEPS_PER_BAR / 2;

    return (
        <div className="pads-container">
            {Array.from({ length: STEPS_PER_BAR / 2 }).map((_, i) => {
                const padIndexInBar = padOffset + i;
                const globalStepIndex = ((selectedBar - 1) * STEPS_PER_BAR) + padIndexInBar;
                const beatData = songData.length > globalStepIndex ? songData[globalStepIndex] : null;
                const isCurrentlyPlaying = isPlaying && padIndexInBar === activePadIndex;
                const isUserPressing = activePad === padIndexInBar;
                
                return (
                    <PerformancePad
                        key={padIndexInBar}
                        beatNum={i + 1}
                        beatData={beatData}
                        isActive={isCurrentlyPlaying || isUserPressing}
                        onMouseDown={() => handlePadDown(padIndexInBar, selectedBar)}
                        onMouseUp={handlePadUp}
                    />
                );
            })}
        </div>
    );
};

export default Pads;
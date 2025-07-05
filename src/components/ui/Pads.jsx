import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePadMapping } from '../../hooks/usePadMapping';
import { usePlayback } from '../../context/PlaybackContext';
import './Pads.css';

const Pads = ({ side }) => {
    const { selectedBar, activePad, setSelectedPad } = useUIState();
    const { songData, STEPS_PER_BAR } = useSequence();
    const { activePadIndex } = usePadMapping();
    const { isPlaying } = usePlayback();
    
    // Determine the pad range for this deck (left is 0-7, right is 8-15)
    const padOffset = side === 'left' ? 0 : STEPS_PER_BAR / 2;

    return (
        <div className="pads-container">
            {Array.from({ length: STEPS_PER_BAR / 2 }).map((_, i) => {
                const padIndexInBar = padOffset + i;
                const globalStepIndex = ((selectedBar - 1) * STEPS_PER_BAR) + padIndexInBar;
                const beatData = songData.length > globalStepIndex ? songData[globalStepIndex] : null;

                // A pad is "active" if it's the one currently hit by the playhead
                const isCurrentlyPlaying = isPlaying && padIndexInBar === activePadIndex;

                // A pad is "pressed" if the user is currently holding it down
                const isUserPressing = activePad === padIndexInBar;
                
                return (
                    <PerformancePad
                        key={`${side}-${padIndexInBar}`}
                        // Display 1-8 for both sides
                        beatNum={i + 1} 
                        beatData={beatData}
                        isActive={isCurrentlyPlaying || isUserPressing}
                        // We will add handlers for click/press later
                        onMouseDown={() => {
                            console.log(`Pad ${i + 1} on ${side} deck pressed.`);
                            // This is where we'd trigger a sound or set the active pad for editing
                        }}
                        onMouseUp={() => {}}
                    />
                );
            })}
        </div>
    );
};

export default Pads;
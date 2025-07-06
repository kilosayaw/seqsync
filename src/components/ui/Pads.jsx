// src/components/ui/Pads.jsx

import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import './Pads.css';

const Pads = ({ side }) => {
    // THE FIX - STEP 1: We consume `activePad` here. This makes this component
    // "state-aware" of which pad is selected. When `setActivePad` is called
    // anywhere, this component will now re-render.
    const { selectedBar, setActivePad, activePad } = useUIState();

    // These hooks provide the necessary data for playback and sequencing.
    const { barStartTimes, STEPS_PER_BAR, songData } = useSequence();
    const { isPlaying, currentBar, currentBeat, seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();
    
    // This correctly calculates whether we are rendering the left pads (0-7) or right pads (8-15).
    const padOffset = side === 'left' ? 0 : STEPS_PER_BAR / 2;

    const handlePadClick = (padIndexInBar) => {
        if (!isMediaReady) return;
        
        // This log confirms the handler is being called with the correct pad index.
        console.log(`%c[Pads.jsx] handlePadClick received for index: ${padIndexInBar}. Calling setActivePad.`, 'color: lightblue;');
        
        // This updates the global state.
        setActivePad(padIndexInBar);
        
        // This logic correctly seeks the timeline to the selected pad.
        const barStartTime = barStartTimes[selectedBar - 1] || 0;
        const timePerSixteenth = (60 / bpm) / 4;
        const padTimeOffset = padIndexInBar * timePerSixteenth;
        const targetTime = barStartTime + padTimeOffset;
        seekToTime(targetTime);
    };

    return (
        <div className="pads-container">
            {/* We loop 8 times for each side (16 total pads / 2 sides) */}
            {Array.from({ length: STEPS_PER_BAR / 2 }).map((_, i) => {
                const padIndexInBar = padOffset + i;
                const displayNumber = padIndexInBar + 1;
                
                // This logic determines if the playhead is currently on this pad.
                const isPulsing = isPlaying && selectedBar === currentBar && padIndexInBar === currentBeat;
                
                return (
                    <PerformancePad
                        key={`${side}-${padIndexInBar}`}
                        padIndex={padIndexInBar} 
                        beatNum={displayNumber}
                        isPulsing={isPulsing}
                        
                        // THE FIX - STEP 2: We pass the global `activePad` state down
                        // as a prop named `activePadIndex`. This forces the child
                        // to re-render with the new value.
                        activePadIndex={activePad}
                        
                        onMouseDown={() => handlePadClick(padIndexInBar)}
                    />
                );
            })}
        </div>
    );
};

export default Pads;
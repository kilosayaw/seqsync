// src/components/ui/Pads.jsx
import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import './Pads.css';

const Pads = ({ side }) => {
    const { selectedBar, setActivePad } = useUIState();
    const { barStartTimes, STEPS_PER_BAR, songData } = useSequence();
    const { seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();
    
    const padOffset = side === 'left' ? 0 : STEPS_PER_BAR / 2;

    const handlePadClick = (padIndexInBar) => {
        if (!isMediaReady) return;

        // **DIAGNOSTIC LOG - THE CRITICAL TEST**
        // This log MUST appear immediately after the "RAW MOUSE DOWN" log.
        console.log(`%c[Pads.jsx] handlePadClick received call for pad index: ${padIndexInBar}. Calling setActivePad...`, 'color: lightblue;');

        setActivePad(padIndexInBar);

        const globalIndex = ((selectedBar - 1) * STEPS_PER_BAR) + padIndexInBar;
        const beatData = songData[globalIndex];
        const hasData = beatData?.joints?.LF?.grounding !== 'LF0' || beatData?.joints?.RF?.grounding !== 'RF0' || beatData?.joints?.LF?.angle !== 0 || beatData?.joints?.RF?.angle !== 0;

        const barStartTime = barStartTimes[selectedBar - 1] || 0;
        const timePerSixteenth = (60 / bpm) / 4;
        const padTimeOffset = padIndexInBar * timePerSixteenth;
        const targetTime = barStartTime + padTimeOffset;

        console.log(
            `[PadInteraction] INFO | Bar: ${selectedBar} | Time: ${targetTime.toFixed(3)}s | Status: ${hasData ? 'Contains Data' : 'Empty'}`
        );

        seekToTime(targetTime);
    };

    return (
        <div className="pads-container">
            {Array.from({ length: STEPS_PER_BAR / 2 }).map((_, i) => {
                const padIndexInBar = padOffset + i;
                const displayNumber = padIndexInBar + 1;
                const { isPlaying, currentBar, currentBeat } = usePlayback();
                const isPulsing = isPlaying && selectedBar === currentBar && padIndexInBar === currentBeat;
                
                return (
                    <PerformancePad
                        key={`${side}-${padIndexInBar}`}
                        padIndex={padIndexInBar} 
                        beatNum={displayNumber}
                        isPulsing={isPulsing}
                        // This passes the handlePadClick function down to the child
                        onMouseDown={() => handlePadClick(padIndexInBar)}
                    />
                );
            })}
        </div>
    );
};

export default Pads;
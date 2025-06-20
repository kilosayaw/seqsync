// client/src/components/core/transport/TimecodeDisplay.jsx
import React, { useMemo } from 'react';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { UI_PADS_PER_BAR, DEFAULT_TIME_SIGNATURE } from '../../../utils/constants';

const TimecodeDisplay = () => {
    const { currentStep, currentBar } = usePlayback();
    const { bpm, timeSignature } = useSequence();

    const timecode = useMemo(() => {
        const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
        const timePerStep = (60 / bpm) / (UI_PADS_PER_BAR / sig.beatsPerBar);
        if (!isFinite(timePerStep) || timePerStep <= 0) return { mm: '00', ss: '00', cs: '00' };
        const absoluteStepIndex = (currentBar * UI_PADS_PER_BAR) + currentStep;
        const timeInSeconds = absoluteStepIndex * timePerStep;
        return {
            mm: String(Math.floor(timeInSeconds / 60)).padStart(2, '0'),
            ss: String(Math.floor(timeInSeconds % 60)).padStart(2, '0'),
            cs: String(Math.floor((timeInSeconds * 100) % 100)).padStart(2, '0'),
        };
    }, [bpm, timeSignature, currentBar, currentStep]);

    return (
        <div className="flex items-end gap-3 font-mono select-none bg-black/30 px-4 py-1 rounded-lg">
            {/* H1/H2 Size for Bar */}
            <div className="text-5xl text-pos-yellow font-black leading-none tracking-tighter">{String(currentBar + 1).padStart(2, '0')}</div>
            <div className="flex flex-col items-center leading-none -translate-y-1">
                {/* H3/H4 Size for Timecode */}
                <span className="text-lg text-white">{timecode.mm}:{timecode.ss}:{timecode.cs}</span>
            </div>
             {/* H1/H2 Size for Beat */}
            <div className="text-5xl text-pos-yellow font-black leading-none tracking-tighter">{String(currentStep + 1).padStart(2, '0')}</div>
        </div>
    );
};
export default TimecodeDisplay;
import React, { useState, useEffect, useMemo } from 'react';

// Context Hooks
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';

// Utility and Constants - Make sure these paths are correct
import { generateNotationForBeat } from '../../../utils/notationUtils'; // YOUR powerful engine
import { UI_PADS_PER_BAR, DEFAULT_TIME_SIGNATURE } from '../../../utils/constants';

const NotationDisplay = () => {
    const { activeBeatData, currentEditingBar, activeBeatIndex } = useUIState();
    const { isPlaying, currentStep, currentBar, bpm, timeSignature } = usePlayback();
    const { songData } = useSequence();

    const [notationText, setNotationText] = useState({
        shorthand: "Select a beat to view notation.",
        plainEnglish: "...",
        analysis: "..." // This will now be the "medical" output
    });

    const beatTimecodes = useMemo(() => {
        // ... (This function remains the same as my previous version)
        const timecodes = [];
        if (bpm <= 0) return [];
        const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
        const timePerStep = (60 / bpm) / (UI_PADS_PER_BAR / sig.beatsPerBar);
        if (!isFinite(timePerStep) || timePerStep <= 0) return [];
        const totalBars = songData.length;
        for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < UI_PADS_PER_BAR; beat++) {
                const absoluteStepIndex = (bar * UI_PADS_PER_BAR) + beat;
                const timeInSeconds = absoluteStepIndex * timePerStep;
                timecodes.push({
                    mm: String(Math.floor(timeInSeconds / 60)).padStart(2, '0'),
                    ss: String(Math.floor(timeInSeconds % 60)).padStart(2, '0'),
                    cs: String(Math.floor((timeInSeconds * 100) % 100)).padStart(2, '0'),
                });
            }
        }
        return timecodes;
    }, [bpm, songData.length, timeSignature]);

    useEffect(() => {
        let dataToNotate, barToNotate, beatToNotate;

        if (isPlaying) {
            barToNotate = currentBar;
            beatToNotate = currentStep;
            dataToNotate = songData[barToNotate]?.beats[beatToNotate];
        } else {
            barToNotate = currentEditingBar;
            beatToNotate = activeBeatIndex;
            dataToNotate = activeBeatData;
        }

        const absoluteBeatIndex = (barToNotate * UI_PADS_PER_BAR) + beatToNotate;
        const timecode = beatTimecodes[absoluteBeatIndex] || { mm: '00', ss: '00', cs: '00' };

        // Call YOUR powerful notation function with the correct arguments
        const newNotation = generateNotationForBeat(
            barToNotate, 
            beatToNotate, 
            dataToNotate, 
            timecode
        );
        
        setNotationText(newNotation);

    }, [
        isPlaying, currentBar, currentStep, currentEditingBar, activeBeatIndex, 
        activeBeatData, beatTimecodes, songData
    ]);

    const displayBar = isPlaying ? currentBar + 1 : currentEditingBar + 1;
    const displayBeat = isPlaying ? currentStep + 1 : activeBeatIndex + 1;

    return (
        <section aria-label="Notation Display" className="w-full bg-gray-800/60 rounded-md text-sm space-y-1 flex-shrink-0 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                {/* Shorthand Panel */}
                <div>
                    <h4 className="font-bold text-pos-yellow mb-1 uppercase tracking-wider text-xs">
                        Shorthand:
                        <span className="text-xs text-gray-400 font-normal normal-case ml-2">
                            (B{displayBar}:S{displayBeat})
                        </span>
                    </h4>
                    <pre className="text-white font-mono bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto whitespace-pre-wrap break-all text-xs scrollbar-thin scrollbar-thumb-element-bg">
                        {notationText.shorthand}
                    </pre>
                </div>
                {/* Plain English Panel */}
                <div>
                    <h4 className="font-bold text-text-secondary mb-1 uppercase tracking-wider text-xs">Plain Eng:</h4>
                    <p className="text-text-primary font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-element-bg">
                        {notationText.plainEnglish}
                    </p>
                </div>
                {/* Analysis/Medical Panel */}
                <div>
                    <h4 className="font-bold text-text-muted mb-1 uppercase tracking-wider text-xs">Analysis:</h4>
                    <p className="text-text-secondary font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-element-bg">
                        {notationText.analysis}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NotationDisplay;
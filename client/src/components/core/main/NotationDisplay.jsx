import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { generateNotationForBeat } from '../../../utils/notationUtils';
import { UI_PADS_PER_BAR, DEFAULT_TIME_SIGNATURE } from '../../../utils/constants';

const NotationDisplay = () => {
    const { activeBeatData, currentEditingBar, activeBeatIndex, handleBeatClick, openPoseEditor } = useUIState();
    const { isPlaying, currentStep, currentBar, bpm, timeSignature } = usePlayback();
    const { songData } = useSequence();

    const [notationText, setNotationText] = useState({ shorthand: "...", plainEnglish: "...", analysis: "..." });
    const [notatedBeatInfo, setNotatedBeatInfo] = useState({ bar: 0, beat: 0 });

    const beatTimecodes = useMemo(() => {
        const timecodes = [];
        if (bpm <= 0) return [];
        const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
        const timePerStep = (60 / bpm) / (UI_PADS_PER_BAR / sig.beatsPerBar);
        if (!isFinite(timePerStep) || timePerStep <= 0) return [];
        for (let bar = 0; bar < songData.length; bar++) {
            for (let beat = 0; beat < UI_PADS_PER_BAR; beat++) {
                const timeInSeconds = ((bar * UI_PADS_PER_BAR) + beat) * timePerStep;
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
        } else {
            barToNotate = currentEditingBar;
            beatToNotate = activeBeatIndex;
        }
        dataToNotate = songData[barToNotate]?.beats[beatToNotate];
        setNotatedBeatInfo({ bar: barToNotate, beat: beatToNotate });

        const timecode = beatTimecodes[(barToNotate * UI_PADS_PER_BAR) + beatToNotate] || {};
        setNotationText(generateNotationForBeat(barToNotate, beatToNotate, dataToNotate, timecode));

    }, [isPlaying, currentBar, currentStep, currentEditingBar, activeBeatIndex, activeBeatData, beatTimecodes, songData]);

    const handleNotationClick = useCallback(() => {
        // First, ensure the clicked beat is the active one for editing
        handleBeatClick(notatedBeatInfo.bar, notatedBeatInfo.beat);
        // Then, open the detailed editor for it
        openPoseEditor();
    }, [notatedBeatInfo, handleBeatClick, openPoseEditor]);

    const displayBar = isPlaying ? currentBar + 1 : currentEditingBar + 1;
    const displayBeat = isPlaying ? currentStep + 1 : activeBeatIndex + 1;

    const interactiveClasses = "cursor-pointer hover:bg-yellow-400/10 transition-colors duration-200";

    return (
        <section aria-label="Notation Display" className="w-full bg-gray-800/60 rounded-md text-sm space-y-1 flex-shrink-0 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <div>
                    <h4 className="font-bold text-pos-yellow mb-1 uppercase tracking-wider text-xs">
                        Shorthand: <span className="text-xs text-gray-400 font-normal normal-case ml-2">(B{displayBar}:S{displayBeat})</span>
                    </h4>
                    <pre onClick={handleNotationClick} title="Click to edit pose" className={`text-white font-mono bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto whitespace-pre-wrap break-all text-xs scrollbar-thin scrollbar-thumb-element-bg ${interactiveClasses}`}>
                        {notationText.shorthand}
                    </pre>
                </div>
                <div>
                    <h4 className="font-bold text-text-secondary mb-1 uppercase tracking-wider text-xs">Plain Eng:</h4>
                    <p onClick={handleNotationClick} title="Click to edit pose" className={`text-text-primary font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-element-bg ${interactiveClasses}`}>
                        {notationText.plainEnglish}
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-text-muted mb-1 uppercase tracking-wider text-xs">Analysis:</h4>
                    <p onClick={handleNotationClick} title="Click to edit pose" className={`text-text-secondary font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-element-bg ${interactiveClasses}`}>
                        {notationText.analysis}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NotationDisplay;
import React, { useEffect, useState } from 'react';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useMotionAnalysisContext } from '../../../contexts/MotionAnalysisContext';
import { generateNotationForBeat } from '../../../utils/notationUtils';

const NotationDisplay = () => {
    const { selectedBar, selectedBeat, isLiveCamActive } = useUIState();
    const { isPlaying, currentBar, currentStep } = usePlayback();
    const { getBeatData } = useSequence();
    const { livePose } = useMotionAnalysisContext(); // livePose now contains analysis data

    const [notation, setNotation] = useState({ shorthand: '...', plainEnglish: '...', analysis: '...' });

    useEffect(() => {
        let barToNotate, beatToNotate, beatData, analysisData;

        if (isPlaying && isLiveCamActive && livePose) {
            barToNotate = currentBar;
            beatToNotate = currentStep;
            beatData = { pose: livePose }; // Use the live pose
            analysisData = livePose.analysis; // Use the live analysis
        } else {
            barToNotate = selectedBar;
            beatToNotate = selectedBeat;
            beatData = getBeatData(barToNotate, beatToNotate);
            analysisData = beatData?.pose?.analysis;
        }
        
        const timecodePlaceholder = {};
        setNotation(generateNotationForBeat(barToNotate, beatToNotate, beatData, analysisData));

    }, [isLiveCamActive, isPlaying, currentBar, currentStep, selectedBar, selectedBeat, livePose, getBeatData]);

    return (
        <section aria-label="Notation Display" className="w-full bg-gray-800/60 rounded-md text-sm space-y-1 flex-shrink-0 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <div>
                    <h4 className="font-bold text-yellow-400 mb-1 uppercase tracking-wider text-xs">Shorthand</h4>
                    {/* FIX: Use the correct state variable 'notation' */}
                    <pre className="text-white font-mono bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto whitespace-pre-wrap break-all text-xs scrollbar-thin scrollbar-thumb-gray-600">
                        {notation.shorthand}
                    </pre>
                </div>
                <div>
                    <h4 className="font-bold text-gray-300 mb-1 uppercase tracking-wider text-xs">Plain English</h4>
                    <p className="text-gray-100 font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-600">
                        {notation.plainEnglish}
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-500 mb-1 uppercase tracking-wider text-xs">Analysis</h4>
                    <p className="text-gray-300 font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-600">
                        {notation.analysis}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NotationDisplay;
import React, { useState, useEffect } from 'react';

// --- CONTEXT HOOKS (Corrected imports) ---
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useMotionAnalysisContext } from '../../../contexts/MotionAnalysisContext';

// --- UTILS ---
import { generateNotationForBeat } from '../../../utils/notationUtils';

// --- COMPONENT ---
const NotationDisplay = () => {
    const { selectedBar, selectedBeat, isLiveCamActive } = useUIState();
    const { isPlaying, currentStep, currentBar } = usePlayback();
    const { getBeatData } = useSequence();
    const { liveAnalysis } = useMotionAnalysisContext(); // <-- FIX: Use the correct hook

    const [notationText, setNotationText] = useState({ shorthand: "...", plainEnglish: "...", analysis: "..." });

    useEffect(() => {
        let barToNotate, beatToNotate, dataToNotate, analysisToDisplay;

        // Determine what data to display based on the app's state
        if (isPlaying && isLiveCamActive) {
            barToNotate = currentBar;
            beatToNotate = currentStep;
            dataToNotate = getBeatData(barToNotate, beatToNotate); 
            analysisToDisplay = liveAnalysis;
        } else {
            barToNotate = selectedBar;
            beatToNotate = selectedBeat;
            dataToNotate = getBeatData(barToNotate, beatToNotate);
            analysisToDisplay = dataToNotate?.analysis || { notation: 'Paused' };
        }
        
        const dataWithAnalysis = { ...dataToNotate, analysis: analysisToDisplay };
        const timecodePlaceholder = {};
        setNotationText(generateNotationForBeat(barToNotate, beatToNotate, dataWithAnalysis, timecodePlaceholder));

    }, [
        isPlaying, currentBar, currentStep, 
        selectedBar, selectedBeat, 
        getBeatData, liveAnalysis, isLiveCamActive
    ]);
    
    return (
        <section aria-label="Notation Display" className="w-full bg-gray-800/60 rounded-md text-sm space-y-1 flex-shrink-0 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <div>
                    <h4 className="font-bold text-yellow-400 mb-1 uppercase tracking-wider text-xs">
                        Shorthand
                    </h4>
                    <pre className="text-white font-mono bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto whitespace-pre-wrap break-all text-xs scrollbar-thin scrollbar-thumb-gray-600">
                        {notationText.shorthand}
                    </pre>
                </div>
                <div>
                    <h4 className="font-bold text-gray-300 mb-1 uppercase tracking-wider text-xs">Plain English</h4>
                    <p className="text-gray-100 font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-600">
                        {notationText.plainEnglish}
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-500 mb-1 uppercase tracking-wider text-xs">Analysis</h4>
                    <p className="text-gray-300 font-sans bg-gray-900/50 p-1.5 rounded-md h-12 overflow-y-auto text-xs whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-600">
                        {notationText.analysis}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NotationDisplay;
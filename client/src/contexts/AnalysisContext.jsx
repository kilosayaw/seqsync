import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSequence } from './SequenceContext';
import { usePlayback } from './PlaybackContext';
import { analyzePoseDynamics } from '../utils/biomechanics';
import { UI_PADS_PER_BAR, DEFAULT_TIME_SIGNATURE } from '../utils/constants';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
    const { songData, version } = useSequence(); // Listen to the version for changes
    const { bpm, timeSignature } = usePlayback();
    const [analysisData, setAnalysisData] = useState({});

    useEffect(() => {
        console.log('[AnalysisContext] Sequence changed. Recalculating biomechanics...');
        
        const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
        const timePerStep = (60 / bpm) / (UI_PADS_PER_BAR / sig.beatsPerBar);
        const newAnalysisData = {};

        for (let bar = 0; bar < songData.length; bar++) {
            for (let beat = 0; beat < songData[bar].beats.length; beat++) {
                const currentBeatData = songData[bar].beats[beat];
                // Get previous beat, handling wrapping from the first beat of a bar
                const prevBeatData = beat > 0 
                    ? songData[bar].beats[beat - 1] 
                    : (bar > 0 ? songData[bar - 1].beats[UI_PADS_PER_BAR - 1] : null);

                // Use the new, comprehensive analysis function
                const dynamics = analyzePoseDynamics(currentBeatData, prevBeatData, timePerStep);
                
                // Store the results using a simple key
                const key = `${bar}:${beat}`;
                newAnalysisData[key] = dynamics;
            }
        }
        
        setAnalysisData(newAnalysisData);

    }, [songData, version, bpm, timeSignature]); // Rerun analysis when these change

    const value = useMemo(() => ({
        analysisData,
    }), [analysisData]);

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    );
};

export const useAnalysis = () => {
    const context = useContext(AnalysisContext);
    if (!context) {
        throw new Error('useAnalysis must be used within an AnalysisProvider');
    }
    return context;
};
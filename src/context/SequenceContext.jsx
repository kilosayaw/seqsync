import React, { createContext, useContext, useState, useCallback } from 'react';

const SequenceContext = createContext(null);

export const useSequence = () => useContext(SequenceContext);

const createBeatData = (bar, beat) => ({
    bar: bar,
    beat: beat,
    poseData: null,
    waveform: null,
    rotary: { left: { angle: 0, grounding: null }, right: { angle: 0, grounding: null } },
});

const createDefaultSequence = () => Array.from({ length: 16 }, (_, i) => createBeatData(1, i));

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);

    const initializeSequenceFromBpm = useCallback((trackDuration, bpm) => {
        if (!trackDuration || !bpm || bpm <= 0) {
            setSongData(createDefaultSequence());
            setTotalBars(1);
            return 0;
        }

        const beatsPerBar = 4; // Using a standard 4/4 time signature
        const totalStepsPerBar = 16;
        const totalBeatsInSong = (trackDuration / 60) * bpm;

        // KEY FIX: The hardcoded '4' has been replaced with the 'beatsPerBar' variable.
        const calculatedTotalBars = Math.ceil(totalBeatsInSong / beatsPerBar);
        
        const totalStepsInSong = calculatedTotalBars * totalStepsPerBar;

        const newSongData = Array.from({ length: totalStepsInSong }, (_, i) => {
            const bar = Math.floor(i / totalStepsPerBar) + 1;
            const beat = i % totalStepsPerBar;
            return createBeatData(bar, beat);
        });

        console.log(`[SequenceContext] Initialized sequence. Total Bars: ${calculatedTotalBars}, Total Steps: ${totalStepsInSong}`);
        setSongData(newSongData);
        setTotalBars(calculatedTotalBars);
        return totalStepsInSong;
    }, []);
    
    const mapWaveformToSequence = useCallback((fullPeaks) => {
        if (!fullPeaks || fullPeaks.length === 0) return;

        setSongData(prevData => {
            if (prevData.length === 0) return [];
            const totalSteps = prevData.length;
            const totalSamples = fullPeaks.length;
            const samplesPerStep = totalSamples / totalSteps;

            return prevData.map((beat, index) => {
                const startSample = Math.floor(index * samplesPerStep);
                const endSample = Math.floor((index + 1) * samplesPerStep);
                const waveformSlice = fullPeaks.slice(startSample, endSample);
                return { ...beat, waveform: waveformSlice };
            });
        });
        console.log("[SequenceContext] Waveform mapped to sequence.");
    }, []);

    const getCurrentBarData = useCallback((selectedBar) => {
        const stepsPerBar = 16;
        const startIndex = (selectedBar - 1) * stepsPerBar;
        if (startIndex >= songData.length) return [];
        const endIndex = startIndex + stepsPerBar;
        return songData.slice(startIndex, endIndex);
    }, [songData]);
    
    const updateBeatData = useCallback((globalBeatIndex, newBeatData) => {
        console.log(`[SequenceContext] Updating beat data for global index: ${globalBeatIndex}`, newBeatData);
        
        setSongData(prevData => {
            const newData = [...prevData];
            if (newData[globalBeatIndex]) {
                newData[globalBeatIndex] = { ...newData[globalBeatIndex], ...newBeatData };
            }
            return newData;
        });
    }, []);

    const value = { songData, totalBars, initializeSequenceFromBpm, getCurrentBarData, updateBeatData, mapWaveformToSequence };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
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

// The default sequence is always a single bar of 16 steps.
const createDefaultSequence = () => Array.from({ length: 16 }, (_, i) => createBeatData(1, i));

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);
    
    const STEPS_PER_BAR = 16; // This is now a constant. A musical bar is 16 sixteenths.

    const initializeSequenceFromBpm = useCallback((trackDuration, bpm) => {
        if (!trackDuration || !bpm || bpm <= 0) {
            setSongData(createDefaultSequence());
            setTotalBars(1);
            return;
        }

        const beatsPerBar = 4; // Standard 4/4 time for calculation
        const totalBeatsInSong = (trackDuration / 60) * bpm;
        const calculatedTotalBars = Math.ceil(totalBeatsInSong / beatsPerBar);
        
        const totalStepsInSong = calculatedTotalBars * STEPS_PER_BAR;

        const newSongData = Array.from({ length: totalStepsInSong }, (_, i) => {
            const bar = Math.floor(i / STEPS_PER_BAR) + 1;
            const beat = i % STEPS_PER_BAR;
            return createBeatData(bar, beat);
        });

        console.log(`[SequenceContext] Initialized sequence. Total Bars: ${calculatedTotalBars}, Total Steps: ${totalStepsInSong}`);
        setSongData(newSongData);
        setTotalBars(calculatedTotalBars);
    }, []); // No dependencies needed for this version
    
    const getCurrentBarData = useCallback((selectedBar) => {
        const startIndex = (selectedBar - 1) * STEPS_PER_BAR;
        if (startIndex >= songData.length) return [];
        const endIndex = startIndex + STEPS_PER_BAR;
        return songData.slice(startIndex, endIndex);
    }, [songData]);
    
    const updateBeatData = useCallback((globalBeatIndex, newBeatData) => {
        setSongData(prevData => {
            const newData = [...prevData];
            if (newData[globalBeatIndex]) {
                newData[globalBeatIndex] = { ...newData[globalBeatIndex], ...newBeatData };
            }
            return newData;
        });
    }, []);

    const value = { 
        songData, 
        totalBars, 
        initializeSequenceFromBpm, 
        getCurrentBarData, 
        updateBeatData
    };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
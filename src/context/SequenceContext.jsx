import React, { createContext, useContext, useState, useCallback } from 'react';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

const createBeatData = (bar, beat) => ({
    bar, beat, poseData: null, waveform: null,
    rotary: { left: { angle: 0, grounding: null }, right: { angle: 0, grounding: null } },
});

const createDefaultSequence = () => Array.from({ length: 16 }, (_, i) => createBeatData(1, i));

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);
    const [barStartTimes, setBarStartTimes] = useState([0]);

    const STEPS_PER_BAR = 16;

    // === THIS FUNCTION DEFINITION WAS MISSING AND IS NOW RESTORED ===
    const initializeSequenceFromBpm = useCallback((trackDuration, bpm) => {
        if (!trackDuration || !bpm || bpm <= 0) {
            setSongData(createDefaultSequence());
            setTotalBars(1);
            setBarStartTimes([0]);
            return;
        }

        const beatsPerBar = 4;
        const totalBeatsInSong = (trackDuration / 60) * bpm;
        const calculatedTotalBars = Math.ceil(totalBeatsInSong / beatsPerBar);
        const totalStepsInSong = calculatedTotalBars * STEPS_PER_BAR;

        const newSongData = Array.from({ length: totalStepsInSong }, (_, i) => {
            const bar = Math.floor(i / STEPS_PER_BAR) + 1;
            const beat = i % STEPS_PER_BAR;
            return createBeatData(bar, beat);
        });

        const beatsPerSecond = bpm / 60;
        const timePerSixteenth = 1 / (beatsPerSecond * 4);
        const newBarStartTimes = Array.from({ length: calculatedTotalBars }, (_, i) => {
            return i * STEPS_PER_BAR * timePerSixteenth;
        });
        
        console.log(`[SequenceContext] Pre-calculated ${newBarStartTimes.length} bar start times.`);
        setBarStartTimes(newBarStartTimes);

        console.log(`[SequenceContext] Initialized sequence. Total Bars: ${calculatedTotalBars}, Total Steps: ${totalStepsInSong}`);
        setSongData(newSongData);
        setTotalBars(calculatedTotalBars);
    }, []);

    // === THIS FUNCTION DEFINITION WAS MISSING AND IS NOW RESTORED ===
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

    const updateRotaryState = useCallback((globalBeatIndex, side, newRotaryState) => {
        setSongData(prevData => {
            const newData = [...prevData];
            if (newData[globalBeatIndex]) {
                const existingRotary = newData[globalBeatIndex].rotary || { left: {}, right: {} };
                newData[globalBeatIndex] = {
                    ...newData[globalBeatIndex],
                    rotary: {
                        ...existingRotary,
                        [side]: { ...existingRotary[side], ...newRotaryState },
                    },
                };
            }
            return newData;
        });
    }, []);

    const value = { 
        songData, 
        totalBars, 
        initializeSequenceFromBpm, 
        getCurrentBarData, 
        updateBeatData,
        barStartTimes,
        updateRotaryState
    };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
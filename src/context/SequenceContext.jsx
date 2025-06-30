import React, { createContext, useContext, useState, useCallback } from 'react';

const SequenceContext = createContext(null);

export const useSequence = () => useContext(SequenceContext);

const createBeatData = (bar, beat) => ({
    bar: bar, beat: beat, poseData: null,
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
            return;
        }

        const beatsPerBar = 4;
        const totalStepsPerBar = 16;
        const totalBeatsInSong = (trackDuration / 60) * bpm;
        const calculatedTotalBars = Math.ceil(totalBeatsInSong / beatsPerBar);
        const totalStepsInSong = calculatedTotalBars * totalStepsPerBar;

        const newSongData = Array.from({ length: totalStepsInSong }, (_, i) => {
            const bar = Math.floor(i / totalStepsPerBar) + 1;
            const beat = i % totalStepsPerBar;
            return createBeatData(bar, beat);
        });

        setSongData(newSongData);
        setTotalBars(calculatedTotalBars);
    }, []);

    const getCurrentBarData = useCallback((selectedBar) => {
        const stepsPerBar = 16;
        const startIndex = (selectedBar - 1) * stepsPerBar;
        if (startIndex >= songData.length) return [];
        const endIndex = startIndex + stepsPerBar;
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

    const value = { songData, totalBars, initializeSequenceFromBpm, getCurrentBarData, updateBeatData };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
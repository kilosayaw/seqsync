import React, { createContext, useContext, useState, useCallback } from 'react';
import { JOINT_LIST, DEFAULT_BPM } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

const STEPS_PER_BAR = 16;

// --- THIS IS THE FIX ---
// The factory for creating new beat data now includes the correct defaults.
const createBeatData = (bar, beat) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        joints[joint.id] = { 
            rotation: 'NEU', 
            angle: 0, 
            position: 'EXT', 
            flexion: 0, 
            grounding: null, 
            directionalMove: null, 
            transition: null 
        };
    });

    // Set the specific defaults for the feet.
    if (joints['LF']) {
        joints['LF'].grounding = 'LF123T12345';
        joints['LF'].angle = 0;
    }
    if (joints['RF']) {
        joints['RF'].grounding = 'RF123T12345';
        joints['RF'].angle = 0;
    }

    return { bar, beat, joints };
};

const createDefaultSequence = () => Array.from({ length: STEPS_PER_BAR }, (_, i) => createBeatData(1, i + 1));

const createDefaultBarStartTimes = () => {
    const timePerSixteenth = 1 / ((DEFAULT_BPM / 60) * 4);
    return [0];
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);
    const [barStartTimes, setBarStartTimes] = useState(createDefaultBarStartTimes());

    const addBar = useCallback(() => {
        const newBarNumber = totalBars + 1;
        console.log(`[SequenceContext] Adding new bar: ${newBarNumber}`);
        const newBeats = Array.from({ length: STEPS_PER_BAR }, (_, i) => 
            createBeatData(newBarNumber, i + 1)
        );
        setSongData(currentData => [...currentData, ...newBeats]);
        setTotalBars(prev => prev + 1);
    }, [totalBars]);

    const initializeSequenceFromBpm = useCallback((trackDuration, bpm) => {
        if (!trackDuration || !bpm || bpm <= 0) return;
        const beatsPerBar = 4;
        const totalBeatsInSong = (trackDuration / 60) * bpm;
        const calculatedTotalBars = Math.ceil(totalBeatsInSong / beatsPerBar);
        const newTotalSteps = calculatedTotalBars * STEPS_PER_BAR;
        setSongData(currentData => {
            const currentLength = currentData.length;
            if (newTotalSteps > currentLength) {
                const beatsToAdd = newTotalSteps - currentLength;
                const newBeats = Array.from({ length: beatsToAdd }, (_, i) => {
                    const stepIndex = currentLength + i;
                    return createBeatData(Math.floor(stepIndex / STEPS_PER_BAR) + 1, (stepIndex % STEPS_PER_BAR) + 1);
                });
                return [...currentData, ...newBeats];
            }
            return currentData;
        });
        const timePerSixteenth = 1 / ((bpm / 60) * 4);
        setBarStartTimes(Array.from({ length: calculatedTotalBars }, (_, i) => i * STEPS_PER_BAR * timePerSixteenth));
        setTotalBars(calculatedTotalBars);
    }, []);

    const updateJointData = useCallback((globalBeatIndex, jointId, jointDataUpdate) => {
        setSongData(prevData => {
            const newData = [...prevData];
            if (newData[globalBeatIndex]?.joints?.[jointId]) {
                newData[globalBeatIndex].joints[jointId] = { ...newData[globalBeatIndex].joints[jointId], ...jointDataUpdate };
            }
            return newData;
        });
    }, []);

    const value = { 
        songData, 
        totalBars, 
        barStartTimes, 
        initializeSequenceFromBpm, 
        updateJointData, 
        addBar
    };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
import React, { createContext, useContext, useState, useCallback } from 'react';
import { JOINT_LIST, DEFAULT_BPM } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

const createBeatData = (bar, beat) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        joints[joint.id] = {
            rotation: 'NEU', angle: 0, position: 'EXT', flexion: 0,
            grounding: null, directionalMove: null, transition: null,
        };
    });
    return { bar, beat, joints };
};

const STEPS_PER_BAR = 16;
const createDefaultSequence = () => Array.from({ length: STEPS_PER_BAR }, (_, i) => createBeatData(1, i + 1));

// Calculate default start times for one bar at the default BPM
const createDefaultBarStartTimes = () => {
    const beatsPerSecond = DEFAULT_BPM / 60;
    const timePerSixteenth = 1 / (beatsPerSecond * 4);
    return Array.from({ length: 1 }, (_, i) => i * STEPS_PER_BAR * timePerSixteenth);
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);
    const [barStartTimes, setBarStartTimes] = useState(createDefaultBarStartTimes()); // Initialized by default

    const addBar = useCallback(() => {
        setSongData(currentData => {
            const newBeats = Array.from({ length: STEPS_PER_BAR }, (_, i) => 
                createBeatData(totalBars + 1, i + 1)
            );
            return [...currentData, ...newBeats];
        });
        setTotalBars(prev => prev + 1);
        // Note: barStartTimes will be recalculated if/when media is loaded.
        // This is primarily for sequence length.
    }, [totalBars]);

    // --- UPGRADED: NON-DESTRUCTIVE INITIALIZATION LOGIC ---
    const initializeSequenceFromBpm = useCallback((trackDuration, bpm) => {
        const beatsPerBar = 4;
        const totalBeatsInSong = (trackDuration / 60) * bpm;
        const calculatedTotalBars = Math.ceil(totalBeatsInSong / beatsPerBar);
        const newTotalSteps = calculatedTotalBars * STEPS_PER_BAR;

        setSongData(currentData => {
            const currentLength = currentData.length;
            let newData = [...currentData];
            if (newTotalSteps > currentLength) {
                for (let i = currentLength; i < newTotalSteps; i++) {
                    newData.push(createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, (i % STEPS_PER_BAR) + 1));
                }
            } else if (newTotalSteps < currentLength) {
                newData = newData.slice(0, newTotalSteps);
            }
            return newData;
        });

        const beatsPerSecond = bpm / 60;
        const timePerSixteenth = 1 / (beatsPerSecond * 4);
        const newBarStartTimes = Array.from({ length: calculatedTotalBars }, (_, i) => i * STEPS_PER_BAR * timePerSixteenth);
        
        setBarStartTimes(newBarStartTimes);
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

    const value = { songData, totalBars, barStartTimes, initializeSequenceFromBpm, updateJointData, addBar };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
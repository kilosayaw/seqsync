import React, { createContext, useContext, useState, useCallback } from 'react';
import { JOINT_LIST } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

// The new data structure, directly reflecting our notation system.
const createBeatData = (bar, beat) => {
    const joints = {};
    // For every beat, create a default state for every joint in our system.
    JOINT_LIST.forEach(joint => {
        joints[joint.id] = {
            rotation: 'NEU',      // 'IN', 'OUT', 'NEU'
            angle: 0,             // e.g., 20 for +20R
            position: 'EXT',      // 'FLEX', 'EXT'
            flexion: 0,           // e.g., 90 for @ 90 FLEX
            grounding: null,      // e.g., 'LF12', 'RF3' - only used by LF/RF
            directionalMove: null,// e.g., '/>', 'v'
            transition: null,     // e.g., '/*'
        };
    });
    // Set a default grounding state for the feet
    if (joints['LF']) joints['LF'].grounding = 'LF123T12345';
    if (joints['RF']) joints['RF'].grounding = 'RF123T12345';
    
    return { bar, beat, joints };
};

const createDefaultSequence = () => Array.from({ length: 16 }, (_, i) => createBeatData(1, i));

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);
    const [barStartTimes, setBarStartTimes] = useState([0]);

    const STEPS_PER_BAR = 16;

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

    const getCurrentBarData = useCallback((selectedBar) => {
        const startIndex = (selectedBar - 1) * STEPS_PER_BAR;
        if (startIndex >= songData.length) return [];
        const endIndex = startIndex + STEPS_PER_BAR;
        return songData.slice(startIndex, endIndex);
    }, [songData]);

    // This is the NEW and ONLY function for modifying sequence data.
    // It is precise, allowing us to change specific properties of a single joint on a single beat.
    const updateJointData = useCallback((globalBeatIndex, jointId, jointDataUpdate) => {
        setSongData(prevData => {
            const newData = [...prevData];
            const beatData = newData[globalBeatIndex];

            if (beatData && beatData.joints && beatData.joints[jointId]) {
                // Use spread syntax to merge the update with the existing data for that joint
                beatData.joints[jointId] = {
                    ...beatData.joints[jointId],
                    ...jointDataUpdate,
                };
            } else {
                console.warn(`[SequenceContext] Could not update joint data. Beat or Joint not found at index ${globalBeatIndex}, jointId ${jointId}`);
            }
            return newData;
        });
        console.log(`[SequenceContext] Updated Joint '${jointId}' at index ${globalBeatIndex}`, jointDataUpdate);
    }, []);

    // The 'value' object provided to the rest of the app.
    // The old, confusing functions have been removed.
    const value = { 
        songData, 
        totalBars, 
        initializeSequenceFromBpm, 
        getCurrentBarData, 
        barStartTimes,
        updateJointData, // This is the new, primary mutation function
    };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
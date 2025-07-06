import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMedia } from './MediaContext';
import { JOINT_LIST } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

const STEPS_PER_BAR = 16;

const createBeatData = (bar, beatInBar) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        // Default to ungrounded state
        joints[joint.id] = { angle: 0, grounding: `${joint.id.charAt(0)}F0` };
    });
    return { bar, beat: beatInBar, joints };
};

const createDefaultSequence = () => Array.from({ length: 16 }, (_, i) => createBeatData(1, i));

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);
    const [barStartTimes, setBarStartTimes] = useState([0]);
    // Depend on the media context for analysis results
    const { isMediaReady, duration, detectedBpm } = useMedia();

    // THE FIX: This effect now correctly rebuilds the sequence when new media is loaded.
    useEffect(() => {
        if (isMediaReady && duration > 0 && detectedBpm) {
            console.log("[SequenceContext] Media is ready. Initializing sequence...");
            
            const beatsPerMinute = detectedBpm;
            // A beat is a quarter note. 4 beats per bar.
            const totalBeatsInSong = (duration / 60) * beatsPerMinute;
            const calculatedTotalBars = Math.ceil(totalBeatsInSong / 4);
            
            setTotalBars(calculatedTotalBars);
            console.log(`[SequenceContext] Detected BPM: ${detectedBpm}, Duration: ${duration.toFixed(2)}s. Calculated Total Bars: ${calculatedTotalBars}`);

            const totalSixteenths = calculatedTotalBars * STEPS_PER_BAR;
            const newSongData = Array.from({ length: totalSixteenths }, (_, i) => 
                createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
            );
            setSongData(newSongData);

            // Calculate the start time of each bar
            const timePerBar = (60 / beatsPerMinute) * 4;
            const newBarStartTimes = Array.from({ length: calculatedTotalBars }, (_, i) => i * timePerBar);
            setBarStartTimes(newBarStartTimes);

            console.log(`[SequenceContext] Sequence initialized with ${calculatedTotalBars} bars.`);

        } else {
            // Reset to a single bar if no media is loaded
            setSongData(createDefaultSequence());
            setTotalBars(1);
            setBarStartTimes([0]);
        }
    }, [isMediaReady, duration, detectedBpm]);


    const updateJointData = useCallback((globalBeatIndex, jointId, jointDataUpdate) => {
        setSongData(prevData => {
            const newData = [...prevData];
            if (newData[globalBeatIndex]?.joints?.[jointId]) {
                newData[globalBeatIndex].joints[jointId] = { ...newData[globalBeatIndex].joints[jointId], ...jointDataUpdate };
            }
            return newData;
        });
    }, []);
    
    const value = { songData, totalBars, barStartTimes, STEPS_PER_BAR, updateJointData };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
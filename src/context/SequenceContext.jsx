// src/context/SequenceContext.jsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMedia } from './MediaContext';
import { JOINT_LIST } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

export const STEPS_PER_BAR = 16;
const DEFAULT_BAR_COUNT = 16;

const createBeatData = (bar, beatInBar) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        joints[joint.id] = { angle: 0, grounding: `${joint.id.charAt(0)}F0` };
    });
    
    // ADDED: Each beat now has a place to store sounds
    const sounds = [];

    return { bar, beat: beatInBar, joints, sounds };
};

// ... the rest of the file is identical to our last version ...
const createDefaultSequence = () => {
    const totalSixteenths = DEFAULT_BAR_COUNT * STEPS_PER_BAR;
    return Array.from({ length: totalSixteenths }, (_, i) => 
        createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
    );
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(DEFAULT_BAR_COUNT);
    const [barStartTimes, setBarStartTimes] = useState([]);
    const { isMediaReady, duration, detectedBpm, firstBeatOffset } = useMedia();

    useEffect(() => {
        if (isMediaReady && duration > 0 && detectedBpm) {
            console.log("SequenceContext: Re-initializing sequence for loaded media.");
            const beatsPerMinute = detectedBpm;
            const totalBeats = (duration / 60) * beatsPerMinute;
            const calculatedTotalBars = Math.ceil(totalBeats / 4);
            setTotalBars(calculatedTotalBars);
            const totalSixteenths = calculatedTotalBars * STEPS_PER_BAR;
            const newSongData = Array.from({ length: totalSixteenths }, (_, i) => 
                createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
            );
            setSongData(newSongData);
            const timePerBar = (60 / beatsPerMinute) * 4;
            const newBarStartTimes = Array.from({ length: calculatedTotalBars }, (_, i) => 
                (i * timePerBar) + (firstBeatOffset || 0)
            );
            setBarStartTimes(newBarStartTimes);
        }
    }, [isMediaReady, duration, detectedBpm, firstBeatOffset]);

    const updateJointData = useCallback((globalBeatIndex, jointId, jointDataUpdate) => {
        setSongData(prevData => {
            const newData = [...prevData];
            if (newData[globalBeatIndex]?.joints?.[jointId]) {
                newData[globalBeatIndex].joints[jointId] = { ...newData[globalBeatIndex].joints[jointId], ...jointDataUpdate };
            }
            return newData;
        });
    }, []);
    
    const value = { songData, setSongData, totalBars, barStartTimes, STEPS_PER_BAR, updateJointData };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
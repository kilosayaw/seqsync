// src/context/SequenceContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { JOINT_LIST } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);
export const STEPS_PER_BAR = 16;
const DEFAULT_BAR_COUNT = 16;

const createBeatData = (bar, beatInBar) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        const side = joint.id.charAt(0);
        const initialGrounding = joint.id.endsWith('F') 
            ? `${side}F123T12345` 
            : `${side}F0`;
        joints[joint.id] = { angle: 0, grounding: initialGrounding };
    });
    const sounds = [];
    return { bar, beat: beatInBar, joints, sounds };
};

const createDefaultSequence = (bars = DEFAULT_BAR_COUNT) => {
    const totalSixteenths = bars * STEPS_PER_BAR;
    return Array.from({ length: totalSixteenths }, (_, i) => 
        createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
    );
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(DEFAULT_BAR_COUNT);
    const [barStartTimes, setBarStartTimes] = useState([]);

    const handleMediaReady = useCallback(({ duration, detectedBpm, firstBeatOffset }) => {
        console.log("SequenceContext: Media is ready. Recalculating sequence.");
        if (!duration || !detectedBpm) return;

        const beatsPerMinute = detectedBpm;
        const timePerBar = (60 / beatsPerMinute) * 4;
        const calculatedTotalBars = Math.ceil(duration / timePerBar);
        
        setTotalBars(calculatedTotalBars);
        const newBarStartTimes = Array.from({ length: calculatedTotalBars }, (_, i) => 
            (i * timePerBar) + (firstBeatOffset || 0)
        );
        setBarStartTimes(newBarStartTimes);

        setSongData(currentData => {
            const currentLength = currentData.length;
            const newLength = calculatedTotalBars * STEPS_PER_BAR;
            if (newLength > currentLength) {
                const additionalBeats = Array.from({ length: newLength - currentLength }, (_, i) => {
                    const globalIndex = currentLength + i;
                    return createBeatData(Math.floor(globalIndex / STEPS_PER_BAR) + 1, globalIndex % STEPS_PER_BAR);
                });
                return [...currentData, ...additionalBeats];
            }
            return currentData.slice(0, newLength);
        });
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

    const assignSoundToPad = useCallback((globalPadIndex, soundNote) => {
        setSongData(prevData => {
            const newData = [...prevData];
            const beat = newData[globalPadIndex];
            if (beat) {
                if (!beat.sounds) beat.sounds = [];
                if (beat.sounds.length < 4 && !beat.sounds.includes(soundNote)) {
                    beat.sounds.push(soundNote);
                }
            }
            return newData;
        });
    }, []);

    const clearSoundsFromPad = useCallback((globalPadIndex) => {
        setSongData(prevData => {
            const newData = [...prevData];
            const beat = newData[globalPadIndex];
            if (beat) {
                beat.sounds = [];
            }
            return newData;
        });
    }, []);
    
    const value = { 
        songData, setSongData, totalBars, barStartTimes, STEPS_PER_BAR, 
        updateJointData, assignSoundToPad, clearSoundsFromPad,
        handleMediaReady 
    };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
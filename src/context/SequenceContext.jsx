import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMedia } from './MediaContext';
import { JOINT_LIST } from '../utils/constants'; // We will need to update constants.js

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

const STEPS_PER_BAR = 16;

const createBeatData = (bar, beatInBar) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        joints[joint.id] = {
            rotation: 'NEU', angle: 0, position: 'EXT', flexion: 0,
            grounding: null, directionalMove: null, transition: null,
        };
    });
    if (joints['LF']) joints['LF'].grounding = 'LF123T12345';
    if (joints['RF']) joints['RF'].grounding = 'RF123T12345';
    
    return { bar, beat: beatInBar, joints };
};

const createDefaultSequence = () => Array.from({ length: 16 }, (_, i) => createBeatData(1, i));

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(1);
    const [barStartTimes, setBarStartTimes] = useState([0]);
    const { isMediaReady, duration, detectedBpm } = useMedia();

    const initializeSequence = useCallback((trackDuration, bpm) => {
        if (!trackDuration || !bpm) { setSongData(createDefaultSequence()); return; }
        const totalBeats = (trackDuration / 60) * bpm;
        const calculatedTotalBars = Math.ceil(totalBeats / 4);
        setTotalBars(calculatedTotalBars);
        const newSongData = Array.from({ length: calculatedTotalBars * STEPS_PER_BAR }, (_, i) => 
            createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
        );
        setSongData(newSongData);
        const timePerSixteenth = 15 / bpm;
        setBarStartTimes(Array.from({ length: calculatedTotalBars }, (_, i) => i * STEPS_PER_BAR * timePerSixteenth));
    }, []);

    useEffect(() => {
        if (isMediaReady && duration > 0 && detectedBpm) {
            initializeSequence(duration, detectedBpm);
        } else {
            setSongData(createDefaultSequence()); setTotalBars(1); setBarStartTimes([0]);
        }
    }, [isMediaReady, duration, detectedBpm, initializeSequence]);

    const updateJointData = useCallback((globalBeatIndex, jointId, jointDataUpdate) => {
        setSongData(prevData => {
            const newData = [...prevData];
            const beatData = newData[globalBeatIndex];
            if (beatData?.joints?.[jointId]) {
                beatData.joints[jointId] = { ...beatData.joints[jointId], ...jointDataUpdate };
            }
            return newData;
        });
    }, []);
    
    const value = { songData, totalBars, barStartTimes, STEPS_PER_BAR, updateJointData };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
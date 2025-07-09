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
        joints[joint.id] = { 
            position: [0, 0, 0], // [x, y, z] vector
            rotation: 0,         // Rotational value in degrees
            orientation: 'NEU',  // 'IN', 'OUT', 'NEU'
            grounding: joint.id.endsWith('F') ? `${joint.id.charAt(0)}F123T12345` : null,
        };
    });
    const sounds = [];
    // DEFINITIVE: Prepare data structure for future facial detection logic
    const meta = { isFacingCamera: false };
    return { bar, beat: beatInBar, joints, sounds, meta };
};

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
        if (globalBeatIndex === null || jointId === null) return;

        setSongData(prevData => {
            // Create a shallow copy to avoid direct mutation
            const newData = [...prevData];
            const beatToUpdate = newData[globalBeatIndex];
            const jointToUpdate = beatToUpdate?.joints?.[jointId];

            if (jointToUpdate) {
                // Log the exact update for debugging
                console.log(`[Sequence] Updating Pad ${globalBeatIndex}, Joint ${jointId} with:`, jointDataUpdate);
                // Create new objects for immutability
                newData[globalBeatIndex] = {
                    ...beatToUpdate,
                    joints: {
                        ...beatToUpdate.joints,
                        [jointId]: { ...jointToUpdate, ...jointDataUpdate }
                    }
                };
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
    
    const value = { songData, setSongData, totalBars, barStartTimes, STEPS_PER_BAR, updateJointData, assignSoundToPad };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
// src/context/SequenceContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMedia } from './MediaContext';
import { JOINT_LIST } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);
// DEFINITIVE: The sequencer now works with 8 steps per bar (4 per deck)
export const STEPS_PER_BAR = 8;
const DEFAULT_BAR_COUNT = 16;

const createBeatData = (bar, beatInBar) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        // We only create data for actual body joints, not control objects like LF/RF
        if (!['LF', 'RF'].includes(joint.id)) {
            joints[joint.id] = { 
                position: [0, 0, 0],
                rotation: 0,
                orientation: 'NEU',
                // DEFINITIVE: Add the 'role' property
                role: 'frame', // Default role
            };
        }
    });
    // Add grounding property only to the foot controllers
    joints['LF'] = { grounding: 'LF123T12345' };
    joints['RF'] = { grounding: 'RF123T12345' };

    const sounds = [];
    const meta = { isFacingCamera: false };
    return { bar, beat: beatInBar, joints, sounds, meta };
};

const createDefaultSequence = () => {
    const totalSteps = DEFAULT_BAR_COUNT * STEPS_PER_BAR;
    return Array.from({ length: totalSteps }, (_, i) => 
        createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
    );
};

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [totalBars, setTotalBars] = useState(DEFAULT_BAR_COUNT);
    const [barStartTimes, setBarStartTimes] = useState([]);
    const { isMediaReady, duration, detectedBpm } = useMedia();

    useEffect(() => {
        if (isMediaReady && duration > 0 && detectedBpm) {
            console.log("SequenceContext: Re-initializing sequence for loaded media.");
            const beatsPerMinute = detectedBpm;
            // A "beat" in music is a quarter note. Our steps are now eighth notes.
            const timePerStep = (60 / beatsPerMinute) / 2;
            const totalSteps = Math.ceil(duration / timePerStep);
            const calculatedTotalBars = Math.ceil(totalSteps / STEPS_PER_BAR);

            setTotalBars(calculatedTotalBars);
            const newSongData = Array.from({ length: totalSteps }, (_, i) => 
                createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
            );
            setSongData(newSongData);

            const timePerBar = timePerStep * STEPS_PER_BAR;
            const newBarStartTimes = Array.from({ length: calculatedTotalBars }, (_, i) => i * timePerBar);
            setBarStartTimes(newBarStartTimes);
        }
    }, [isMediaReady, duration, detectedBpm]);

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
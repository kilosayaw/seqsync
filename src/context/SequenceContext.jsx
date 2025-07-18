import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { produce } from 'immer';
import { useMedia } from './MediaContext.jsx';
import { useUIState } from './UIStateContext.jsx';
import { JOINT_LIST } from '../utils/constants.js';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

const STEPS_PER_BAR = 8;
const DEFAULT_BAR_COUNT = 16;
const PRESET_PAGES = 3;
const PRESETS_PER_PAGE = 4;

// Your data creation helpers are correct and do not need changes.
const createBeatData = (bar, beatInBar) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        if (!['LF', 'RF'].includes(joint.id)) {
            joints[joint.id] = { 
                rotation: 0, 
                rotationType: 'NEU',
                rotationIntensity: 100,
                intentType: 'BASE',
                forceLevel: 0,
                role: 'frame' 
            };
        }
    });
    joints['LF'] = { grounding: 'LF123T12345', rotation: 0, pivotPoint: 'L3' };
    joints['RF'] = { grounding: 'RF123T12345', rotation: 0, pivotPoint: 'R3' };
    
    return { bar, beat: beatInBar, joints, sounds: [], meta: {} };
};

const createDefaultSequence = () => {
    const totalSteps = DEFAULT_BAR_COUNT * STEPS_PER_BAR;
    return Array.from({ length: totalSteps }, (_, i) => 
        createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
    );
};

const createDefaultPresets = () => ({
    left: Array(PRESET_PAGES).fill(null).map(() => Array(PRESETS_PER_PAGE).fill(null)),
    right: Array(PRESET_PAGES).fill(null).map(() => Array(PRESETS_PER_PAGE).fill(null)),
});

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(createDefaultSequence());
    const [presets, setPresets] = useState(createDefaultPresets());
    const [totalBars, setTotalBars] = useState(DEFAULT_BAR_COUNT);
    const [barStartTimes, setBarStartTimes] = useState([]);
    const { isMediaReady, duration, detectedBpm } = useMedia();
    const { setActivePad, setSelectedBar } = useUIState(); // Get setSelectedBar to reset UI

    // --- DEFINITIVE FIX ---
    // This effect now correctly handles the sequence generation workflow.
    useEffect(() => {
        // The condition is now less strict. It runs as long as the media is ready and has a duration.
        if (isMediaReady && duration > 0) {
            
            // Step 1: Default to 80 BPM if detection failed (returned 0 or less).
            const bpm = detectedBpm > 0 ? detectedBpm : 80;
            console.log(`[SequenceContext] Building sequence with Duration: ${duration}s, BPM: ${bpm}`);

            // Step 2: Calculate total steps based on the determined BPM.
            // Assuming 8 steps (eighth notes) per bar in 4/4 time.
            const timePerStep = (60 / bpm) / 2; 
            const totalSteps = Math.ceil(duration / timePerStep);
            const calculatedTotalBars = Math.max(1, Math.ceil(totalSteps / STEPS_PER_BAR));
            
            setTotalBars(calculatedTotalBars);
            
            // Step 3: Create the main songData array with the correct number of steps.
            const newSongData = Array.from({ length: totalSteps }, (_, i) => 
                createBeatData(Math.floor(i / STEPS_PER_BAR) + 1, i % STEPS_PER_BAR)
            );
            setSongData(newSongData);
            
            // Step 4: Create the barStartTimes array, crucial for accurate seeking.
            const timePerBar = timePerStep * STEPS_PER_BAR;
            const newBarStartTimes = Array.from({ length: calculatedTotalBars }, (_, i) => i * timePerBar);
            setBarStartTimes(newBarStartTimes);
            
            // Step 5: Reset the UI to the start of the new sequence.
            setActivePad(0);
            setSelectedBar(1);
        }
    }, [isMediaReady, duration, detectedBpm, setActivePad, setSelectedBar]); // Added setSelectedBar to dependency array

    // All your update functions below this are correct and do not need to be changed.
    const updateJointData = useCallback((globalBeatIndex, jointId, jointDataUpdate) => {
        setSongData(produce(draft => {
            const beat = draft[globalBeatIndex];
            if (beat?.joints?.[jointId]) {
                Object.assign(beat.joints[jointId], jointDataUpdate);
            }
        }));
    }, []);

    const updateJointVectorForActivePad = useCallback((jointId, newVector, activePad) => {
        if (activePad === null || !jointId) return;
        setSongData(produce(draft => {
            const beat = draft[activePad];
            if (beat?.joints?.[jointId]) {
                beat.joints[jointId].vector = { ...beat.joints[jointId].vector, ...newVector };
            }
        }));
    }, []);

    const updateBeatMetaData = useCallback((globalBeatIndex, metaDataUpdate) => {
        setSongData(produce(draft => {
            const beat = draft[globalBeatIndex];
            if (beat) {
                beat.meta = { ...(beat.meta || {}), ...metaDataUpdate };
            }
        }));
    }, []);

    const assignSoundToPad = useCallback((globalBeatIndex, soundNote) => {
        setSongData(produce(draft => {
            const beat = draft[globalBeatIndex];
            if (beat) {
                if (!beat.sounds) beat.sounds = [];
                if (beat.sounds.length < 4 && !beat.sounds.includes(soundNote)) {
                    beat.sounds.push(soundNote);
                }
            }
        }));
    }, []);
    
    const savePoseToPreset = useCallback((side, pageIndex, presetIndex, activePad) => {
        if (activePad === null) return;
        const sidePrefix = side === 'left' ? 'L' : 'R';
        const poseToSave = {};
        const sourceJoints = songData[activePad]?.joints || {};
        for (const jointId in sourceJoints) {
            if (jointId.startsWith(sidePrefix)) {
                poseToSave[jointId] = sourceJoints[jointId];
            }
        }
        setPresets(produce(draft => {
            draft[side][pageIndex][presetIndex] = poseToSave;
        }));
    }, [songData]);

    const loadPoseFromPreset = useCallback((side, pageIndex, presetIndex, activePad) => {
        if (activePad === null) return;
        const presetPose = presets[side][pageIndex][presetIndex];
        if (!presetPose) return;
        setSongData(produce(draft => {
            const beat = draft[activePad];
            if (beat) {
                beat.joints = { ...beat.joints, ...presetPose };
            }
        }));
    }, [presets]);
    
    const value = { 
        songData, setSongData, 
        totalBars, barStartTimes, STEPS_PER_BAR, 
        updateJointData, assignSoundToPad, updateBeatMetaData,
        updateJointVectorForActivePad,
        presets, savePoseToPreset, loadPoseFromPreset
    };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
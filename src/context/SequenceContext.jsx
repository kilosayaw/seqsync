import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMedia } from './MediaContext';
import { useUIState } from './UIStateContext';
import { JOINT_LIST } from '../utils/constants';

const SequenceContext = createContext(null);
export const useSequence = () => useContext(SequenceContext);

export const STEPS_PER_BAR = 8;
const DEFAULT_BAR_COUNT = 16;
const PRESET_PAGES = 3;
const PRESETS_PER_PAGE = 4;

const createBeatData = (bar, beatInBar) => {
    const joints = {};
    JOINT_LIST.forEach(joint => {
        if (!['LF', 'RF'].includes(joint.id)) {
            // DEFINITIVE: Added new properties to the joint data model.
            joints[joint.id] = { 
                position: [0, 0, 0], 
                rotation: 0, 
                rotationType: 'NEU', // 'IN', 'OUT', 'NEU', 'SUP', 'PRO', etc.
                energyType: 'BASE',   // Placeholder for NRG options
                intentType: 'PASS',   // 'PASS', 'BASE', 'FORCE'
                role: 'frame' 
            };
        }
    });
    // DEFINITIVE: Foot data now includes pivotPoint.
    joints['LF'] = { grounding: 'LF123T12345', rotation: 0, pivotPoint: 'L3' };
    joints['RF'] = { grounding: 'RF123T12345', rotation: 0, pivotPoint: 'R3' };
    
    return { bar, beat: beatInBar, joints, sounds: [], meta: { isFacingCamera: false } };
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
    const { activePad } = useUIState(); 

    const updateBeatMetaData = useCallback((globalBeatIndex, metaDataUpdate) => {
        if (globalBeatIndex === null) return;
        setSongData(prevData => {
            const newData = [...prevData];
            const beatToUpdate = newData[globalBeatIndex];
            if (beatToUpdate) {
                const newMeta = { ...(beatToUpdate.meta || {}), ...metaDataUpdate };
                newData[globalBeatIndex] = { ...beatToUpdate, meta: newMeta };
            }
            return newData;
        });
    }, []);

    useEffect(() => {
        if (isMediaReady && duration > 0 && detectedBpm) {
            console.log(`[SequenceContext] Media ready. Re-initializing sequence for ${duration.toFixed(2)}s song at ${detectedBpm} BPM.`);
            const beatsPerMinute = detectedBpm;
            // A "beat" in music is a quarter note. Our steps are eighth notes.
            const timePerStep = (60 / beatsPerMinute) / 2;
            const totalSteps = Math.ceil(duration / timePerStep);
            const calculatedTotalBars = Math.max(1, Math.ceil(totalSteps / STEPS_PER_BAR));

            console.log(`[SequenceContext] Calculated: ${totalSteps} total steps, ${calculatedTotalBars} total bars.`);

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
            const newData = [...prevData];
            const beatToUpdate = newData[globalBeatIndex];
            const jointToUpdate = beatToUpdate?.joints?.[jointId];
            if (jointToUpdate) {
                newData[globalBeatIndex] = { ...beatToUpdate, joints: { ...beatToUpdate.joints, [jointId]: { ...jointToUpdate, ...jointDataUpdate } } };
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
                if (beat.sounds.length < 4 && !beat.sounds.includes(soundNote)) beat.sounds.push(soundNote);
            }
            return newData;
        });
    }, []);
    
    const savePoseToPreset = useCallback((side, pageIndex, presetIndex) => {
        if (activePad === null) return;
        const sidePrefix = side === 'left' ? 'L' : 'R';
        const poseToSave = {};
        const sourceJoints = songData[activePad]?.joints || {};
        for (const jointId in sourceJoints) {
            if (jointId.startsWith(sidePrefix)) {
                poseToSave[jointId] = sourceJoints[jointId];
            }
        }
        setPresets(prev => {
            const newPresets = JSON.parse(JSON.stringify(prev));
            newPresets[side][pageIndex][presetIndex] = poseToSave;
            return newPresets;
        });
    }, [activePad, songData]);

    const loadPoseFromPreset = useCallback((side, pageIndex, presetIndex) => {
        if (activePad === null) return;
        const presetPose = presets[side][pageIndex][presetIndex];
        if (!presetPose) return;
        setSongData(prevData => {
            const newData = [...prevData];
            const beatToUpdate = { ...newData[activePad] };
            beatToUpdate.joints = { ...beatToUpdate.joints, ...presetPose };
            newData[activePad] = beatToUpdate;
            return newData;
        });
    }, [activePad, presets]);
    
    const value = { 
        songData, setSongData, 
        totalBars, barStartTimes, STEPS_PER_BAR, 
        updateJointData,
        updateBeatMetaData, 
        assignSoundToPad,
        presets, savePoseToPreset, loadPoseFromPreset
    };
    
    return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>;
};
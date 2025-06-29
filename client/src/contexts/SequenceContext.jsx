// src/contexts/SequenceContext.jsx
import React, { createContext, useState, useCallback, useContext, useMemo, useRef } from 'react';
import { produce } from 'immer';
import { toast } from 'react-toastify';
import {
    INITIAL_SONG_DATA, DEFAULT_BPM, DEFAULT_TIME_SIGNATURE, DEFAULT_SOUND_KIT
} from '../utils/constants';

const SequenceContext = createContext(null);

export const SequenceProvider = ({ children }) => {
    const [songData, setSongData] = useState(INITIAL_SONG_DATA);
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [timeSignature, setTimeSignature] = useState(DEFAULT_TIME_SIGNATURE);
    const [selectedKitName, setSelectedKitName] = useState(DEFAULT_SOUND_KIT.name);
    const [version, setVersion] = useState(0); // Simple version tracker to trigger updates

    const updateState = useCallback((producer) => {
        setSongData(prevData => produce(prevData, producer));
        setVersion(v => v + 1);
    }, []);

    const addSoundToBeat = useCallback((barIndex, beatIndex, soundName) => {
        updateState(draft => {
            const beat = draft[barIndex].beats[beatIndex];
            if (!beat.sounds.includes(soundName)) beat.sounds.push(soundName);
        });
    }, [updateState]);

    const removeSoundFromBeat = useCallback((barIndex, beatIndex, soundName) => {
        updateState(draft => {
            const beat = draft[barIndex].beats[beatIndex];
            beat.sounds = beat.sounds.filter(s => s !== soundName);
        });
    }, [updateState]);
    
    const updateBeatDynamics = useCallback((barIndex, beatIndex, dynamics) => {
        updateState(draft => {
            const beat = draft[barIndex].beats[beatIndex];
            if (dynamics.jointInfo) {
                if (!beat.jointInfo) beat.jointInfo = {};
                Object.keys(dynamics.jointInfo).forEach(key => {
                    beat.jointInfo[key] = { ...(beat.jointInfo[key] || {}), ...dynamics.jointInfo[key] };
                });
            }
            if (dynamics.grounding) {
                if (!beat.grounding) beat.grounding = { L: null, R: null, L_weight: 50 };
                Object.assign(beat.grounding, dynamics.grounding);
            }
            if (dynamics.rotation) {
                if (!beat.rotation) beat.rotation = { L: 0, R: 0 };
                Object.assign(beat.rotation, dynamics.rotation);
            }
        });
    }, [updateState]);

    const value = useMemo(() => ({
        songData, version, bpm, timeSignature, selectedKitName,
        setBpm, setTimeSignature, setSelectedKitName,
        addSoundToBeat, removeSoundFromBeat, updateBeatDynamics
    }), [songData, version, bpm, timeSignature, selectedKitName, setBpm, setTimeSignature, setSelectedKitName, addSoundToBeat, removeSoundFromBeat, updateBeatDynamics]);

    return (
        <SequenceContext.Provider value={value}>
            {children}
        </SequenceContext.Provider>
    );
};

export const useSequence = () => useContext(SequenceContext);
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSequence } from './SequenceContext';
import { ALL_JOINTS_MAP, MODES, DEFAULT_FADER_MODE } from '../utils/constants';
import { SOUND_KITS } from '../data/soundKits';
import { calculateValidKneePolygon } from '../utils/biomechanics';
import { getVectorFromXY } from '../utils/helpers'; // Assuming this is also needed for clamping

const UIStateContext = createContext(null);

const getEffectiveBeatData = (songData, barIndex, beatIndex) => {
    if (!songData || !songData[barIndex] || !songData[barIndex].beats[beatIndex]) {
        return { jointInfo: {}, grounding: {} };
    }
    const effectiveData = JSON.parse(JSON.stringify(songData[barIndex].beats[beatIndex]));
    const beatsInBar = songData[barIndex].beats;

    Object.keys(ALL_JOINTS_MAP).forEach(jointAbbrev => {
        for (let i = beatIndex; i >= 0; i--) {
            const sourceBeat = beatsInBar[i];
            const sourceJoint = sourceBeat?.jointInfo?.[jointAbbrev];

            if (sourceJoint?.lockDuration) {
                const lockEndBeat = i + sourceJoint.lockDuration;
                if (beatIndex < lockEndBeat) {
                    effectiveData.jointInfo[jointAbbrev] = sourceJoint;
                    return;
                }
            }
        }
    });
    return effectiveData;
};

export const UIStateProvider = ({ children }) => {
    // --- DEFINITIVE FIX: Destructure the missing `updateStateAndHistory` function ---
    const { songData, updateBeatDynamics, updateStateAndHistory } = useSequence();
    
    const [faderValue, setFaderValue] = useState(50);
    const [activeBeatIndex, setActiveBeatIndex] = useState(0);
    const [currentEditingBar, setCurrentEditingBar] = useState(0);
    const [activeEditingJoint, setActiveEditingJoint] = useState(null);
    const [isPoseEditorOpen, setIsPoseEditorOpen] = useState(false);
    const [isIntentPaletteOpen, setIsIntentPaletteOpen] = useState(false);
    const [viewMode, setViewMode] = useState(MODES.POS);
    const [faderMode, setFaderMode] = useState(DEFAULT_FADER_MODE);
    const [selectedKitName, setSelectedKitName] = useState(Object.keys(SOUND_KITS)[0] || 'default');
    const [currentSoundInBank, setCurrentSoundInBank] = useState(null);
    
    const activeBeatData = useMemo(() => {
        if (!songData[currentEditingBar]) return { jointInfo: {}, grounding: {} };
        return getEffectiveBeatData(songData, currentEditingBar, activeBeatIndex);
    }, [songData, currentEditingBar, activeBeatIndex]);
    
    const activeIntent = useMemo(() => {
        if (activeEditingJoint && activeBeatData?.jointInfo) {
            return activeBeatData.jointInfo[activeEditingJoint]?.intent;
        }
        return null;
    }, [activeEditingJoint, activeBeatData]);

    const handleFaderChange = useCallback((newValue) => setFaderValue(newValue), []);
    const handleBeatClick = useCallback((beatIndex) => setActiveBeatIndex(beatIndex), []);
    const handleNavigateEditingBar = useCallback((direction) => {
        setCurrentEditingBar(prev => {
            const newBar = prev + direction;
            if (newBar >= 0 && newBar < songData.length) return newBar;
            return prev;
        });
    }, [songData.length]);

    const openPoseEditor = useCallback(() => setIsPoseEditorOpen(true), []);
    const closePoseEditor = useCallback(() => setIsPoseEditorOpen(false), []);
    const openIntentPalette = useCallback(() => setIsIntentPaletteOpen(true), []);
    const closeIntentPalette = useCallback(() => setIsIntentPaletteOpen(false), []);

    const nudgeFaderValue = useCallback((amount) => {
        const beat = songData[currentEditingBar]?.beats[activeBeatIndex];
        if (!beat) return;

        if (faderMode === 'WEIGHT') {
            const currentWeight = beat.grounding.L_weight ?? 50;
            const newWeight = Math.max(0, Math.min(100, currentWeight + amount));
            updateStateAndHistory(draft => {
                draft[currentEditingBar].beats[activeBeatIndex].grounding.L_weight = newWeight;
            }, `Nudge Fader WEIGHT`);
        } else if (faderMode === 'HEAD') {
            const currentHeadX = beat.jointInfo?.H?.vector?.x ?? 0;
            const newHeadX = Math.max(-1, Math.min(1, currentHeadX + (amount / 100)));
            updateStateAndHistory(draft => {
                if (!draft[currentEditingBar].beats[activeBeatIndex].jointInfo.H) {
                    draft[currentEditingBar].beats[activeBeatIndex].jointInfo.H = { vector: { x:0, y:0, z:0 } };
                }
                draft[currentEditingBar].beats[activeBeatIndex].jointInfo.H.vector.x = newHeadX;
            }, `Nudge Fader HEAD`);
        }
    }, [faderMode, currentEditingBar, activeBeatIndex, songData, updateStateAndHistory]);

    const nudgeKneeValue = useCallback((side, deltaX, deltaY) => {
        const beat = songData[currentEditingBar]?.beats[activeBeatIndex];
        if (!beat || !beat.jointInfo) return;
        
        const kneeAbbrev = `${side}K`;
        const currentVector = beat.jointInfo[kneeAbbrev]?.vector || { x: 0, y: -0.2, z: 0 };
        const validPath = calculateValidKneePolygon(beat.jointInfo, side);
        
        const targetVector = {
            x: currentVector.x + deltaX,
            y: currentVector.y + deltaY
        };
        
        // Clamp the new vector to the valid path
        const newVector = getVectorFromXY(targetVector, validPath);
        
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            jointInfo: { [kneeAbbrev]: { vector: { ...newVector, z: 0 } } }
        });

    }, [songData, currentEditingBar, activeBeatIndex, updateBeatDynamics]);

    const value = useMemo(() => ({
        activeBeatIndex, currentEditingBar, activeEditingJoint, isPoseEditorOpen, isIntentPaletteOpen,
        viewMode, faderMode, selectedKitName, currentSoundInBank, activeBeatData,
        handleBeatClick, setCurrentEditingBar, handleNavigateEditingBar, setActiveEditingJoint,
        openPoseEditor, closePoseEditor, openIntentPalette, closeIntentPalette,
        setViewMode, setFaderMode, setSelectedKitName, setCurrentSoundInBank, faderValue,
        handleFaderChange, soundKitsObject: SOUND_KITS, nudgeFaderValue, nudgeKneeValue,
        activeIntent,
    }), [
        activeBeatIndex, currentEditingBar, activeEditingJoint, isPoseEditorOpen, isIntentPaletteOpen,
        viewMode, faderMode, selectedKitName, currentSoundInBank, activeBeatData,
        handleBeatClick, handleNavigateEditingBar, setActiveEditingJoint,
        openPoseEditor, closePoseEditor, openIntentPalette, closeIntentPalette,
        setViewMode, setFaderMode, setSelectedKitName, setCurrentSoundInBank, faderValue,
        handleFaderChange, nudgeFaderValue, nudgeKneeValue,
        activeIntent,
    ]);

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (!context) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
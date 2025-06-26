import React, { createContext, useState, useCallback, useMemo, useContext } from 'react';
import { useSequence } from './SequenceContext';
import { MODES, AVAILABLE_KITS, DEFAULT_SOUND_KIT, createDefaultBeatObject } from '../utils/constants';

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    // --- State Declarations ---
    const [viewMode, setViewMode] = useState(MODES.POS);
    const [activeEditingJoint, setActiveEditingJoint] = useState(null);
    const [currentEditingBar, setCurrentEditingBar] = useState(0);
    const [activeBeatIndex, setActiveBeatIndex] = useState(0);
    const [faderMode, setFaderMode] = useState('WEIGHT');
    const [isPoseEditorOpen, setIsPoseEditorOpen] = useState(false); // State for the modal
    const [selectedKitName, setSelectedKitName] = useState(DEFAULT_SOUND_KIT.name);
    const [currentSoundInBank, setCurrentSoundInBank] = useState(null);
    const { songData } = useSequence();

    // --- Derived State ---
    const soundKitsObject = useMemo(() => AVAILABLE_KITS.reduce((acc, kit) => ({ ...acc, [kit.name]: kit }), {}), []);
    const currentSelectedKitObject = useMemo(() => soundKitsObject[selectedKitName] || soundKitsObject[DEFAULT_SOUND_KIT.name], [soundKitsObject, selectedKitName]);
    const activeBeatData = useMemo(() => songData?.[currentEditingBar]?.beats?.[activeBeatIndex] || createDefaultBeatObject(activeBeatIndex), [songData, currentEditingBar, activeBeatIndex]);

    // --- UI Handlers ---
    const handleBeatClick = useCallback((barIdx, beatIdx) => {
        setCurrentEditingBar(barIdx);
        setActiveBeatIndex(beatIdx);
    }, []);

    const handleNavigateEditingBar = useCallback((direction) => {
        const totalBars = songData.length;
        setCurrentEditingBar(prevBar => (prevBar + direction + totalBars) % totalBars);
        setActiveBeatIndex(0);
    }, [songData.length]);

    // --- NEW: Handlers for the Pose Editor Modal ---
    const openPoseEditor = useCallback(() => {
        setIsPoseEditorOpen(true);
    }, []);

    const closePoseEditor = useCallback(() => {
        setIsPoseEditorOpen(false);
    }, []);

    // --- Context Value ---
    const value = useMemo(() => ({
        viewMode, setViewMode,
        activeEditingJoint, setActiveEditingJoint,
        currentEditingBar, setCurrentEditingBar,
        activeBeatIndex, setActiveBeatIndex,
        faderMode, setFaderMode,
        selectedKitName, setSelectedKitName,
        currentSoundInBank, setCurrentSoundInBank,
        isPoseEditorOpen, openPoseEditor, closePoseEditor, // Expose modal controls
        activeBeatData, soundKitsObject, currentSelectedKitObject,
        handleBeatClick, handleNavigateEditingBar
    }), [
        viewMode, activeEditingJoint, currentEditingBar, activeBeatIndex, faderMode,
        selectedKitName, currentSoundInBank, isPoseEditorOpen,
        activeBeatData, soundKitsObject, currentSelectedKitObject,
        handleBeatClick, handleNavigateEditingBar, openPoseEditor, closePoseEditor
    ]);

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (!context) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
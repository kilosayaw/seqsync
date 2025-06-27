import React, { createContext, useState, useContext, useCallback } from 'react';

// Assuming you have a constants file with this defined
export const MODES = { SEQ: 'SEQ', POS: 'POS' };

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    // --- MODE SWITCHING & NUDGE STATE ---
    const [currentMode, setCurrentMode] = useState(MODES.SEQ);
    const [isNudgeModeActive, setNudgeModeActive] = useState(false);

    // Existing state...
    const [selectedBeat, setSelectedBeat] = useState(0);
    const [selectedBar, setSelectedBar] = useState(0);
    const [visualizerMode, setVisualizerMode] = useState('2D');
    const [isLiveCamActive, setLiveCamActive] = useState(false);
    const [isMirrored, setIsMirrored] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBeatIndex, setEditingBeatIndex] = useState(null);
    const [selectedJoint, setSelectedJoint] = useState(null);

    const toggleLiveCam = useCallback(() => setLiveCamActive(p => !p), []);
    const toggleMirror = useCallback(() => setIsMirrored(p => !p), []);
    const toggleEditMode = useCallback(() => {
        setIsEditMode(prev => {
            if (prev) setEditingBeatIndex(null); // Clear editing index when exiting edit mode
            return !prev;
        });
    }, []);
    
    // Deactivate nudge mode when switching main modes
    const handleSetCurrentMode = (mode) => {
        setNudgeModeActive(false);
        setCurrentMode(mode);
    };

    const value = {
        currentMode,
        setCurrentMode: handleSetCurrentMode,
        isNudgeModeActive,
        setNudgeModeActive,
        selectedBeat, setSelectedBeat,
        selectedBar, setSelectedBar,
        visualizerMode, setVisualizerMode,
        isLiveCamActive, toggleLiveCam,
        isMirrored, toggleMirror,
        isEditMode, toggleEditMode,
        editingBeatIndex, setEditingBeatIndex,
        selectedJoint, setSelectedJoint,
    };

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
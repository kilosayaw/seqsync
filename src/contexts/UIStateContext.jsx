import React, { createContext, useState, useContext, useCallback } from 'react';

// Define the modes for type safety
export const MODES = {
  SEQ: 'SEQ',
  POS: 'POS',
};

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    // --- MODE & UI TOGGLE STATE ---
    const [currentMode, setCurrentMode] = useState(MODES.SEQ);
    const [isNudgeModeActive, setNudgeModeActive] = useState(false);
    const [isLiveCamActive, setLiveCamActive] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isMirrored, setIsMirrored] = useState(false);
    
    // --- FIX: Add the state for the 2D overlay toggle ---
    const [is2dOverlayEnabled, set2dOverlayEnabled] = useState(true); // Default to ON

    // --- SELECTION STATE ---
    const [selectedBar, setSelectedBar] = useState(0);
    const [selectedBeat, setSelectedBeat] = useState(0);
    const [selectedJoint, setSelectedJoint] = useState(null);
    const [editingBeatIndex, setEditingBeatIndex] = useState(null);
    
    const toggleLiveCam = useCallback(() => setLiveCamActive(p => !p), []);
    const toggleMirror = useCallback(() => setIsMirrored(p => !p), []);
    const toggleEditMode = useCallback(() => setIsEditMode(p => !p), []);

    const value = {
        currentMode, setCurrentMode,
        isNudgeModeActive, setNudgeModeActive,
        isLiveCamActive, toggleLiveCam,
        isEditMode, toggleEditMode,
        isMirrored, toggleMirror,
        is2dOverlayEnabled, set2dOverlayEnabled, // Expose the new state
        selectedBar, setSelectedBar,
        selectedBeat, setSelectedBeat,
        selectedJoint, setSelectedJoint,
        editingBeatIndex, setEditingBeatIndex,
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
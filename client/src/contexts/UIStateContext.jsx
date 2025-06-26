// /client/src/contexts/UIStateContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

export const MODES = { SEQ: 'SEQ', POS: 'POS' };
const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    const [currentMode, setCurrentMode] = useState(MODES.SEQ);
    // ... other states
    const [selectedBeat, setSelectedBeat] = useState(0);
    const [selectedBar, setSelectedBar] = useState(0);
    const [isLiveCamActive, setLiveCamActive] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBeatIndex, setEditingBeatIndex] = useState(null);

    // --- NEW: Separate Mirroring States ---
    const [isFeedMirrored, setFeedMirrored] = useState(true); // Default to mirrored for a natural feel
    const [isOverlayMirrored, setOverlayMirrored] = useState(false); // Default to not mirrored (true to source)

    const toggleLiveCam = useCallback(() => setLiveCamActive(p => !p), []);
    const toggleEditMode = useCallback(() => setIsEditMode(p => !p), []);
    const toggleFeedMirror = useCallback(() => setFeedMirrored(p => !p), []);
    const toggleOverlayMirror = useCallback(() => setOverlayMirrored(p => !p), []);
    
    const value = {
        currentMode, setCurrentMode,
        selectedBeat, setSelectedBeat,
        selectedBar, setSelectedBar,
        isLiveCamActive, toggleLiveCam,
        isEditMode, toggleEditMode,
        editingBeatIndex, setEditingBeatIndex,
        // Provide new states and toggles
        isFeedMirrored, toggleFeedMirror,
        isOverlayMirrored, toggleOverlayMirror,
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
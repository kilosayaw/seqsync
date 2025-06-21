import React, { createContext, useState, useContext, useCallback } from 'react';

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    const [selectedBeat, setSelectedBeat] = useState(null);
    const [selectedBar, setSelectedBar] = useState(0);
    const [totalBars, setTotalBars] = useState(2);
    const [selectedJoint, setSelectedJoint] = useState(null);
    const [visualizerMode, setVisualizerMode] = useState('2D');
    const [isLiveCamActive, setLiveCamActive] = useState(false);
    const [isMirrored, setIsMirrored] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const toggleEditMode = useCallback(() => setIsEditMode(p => !p), []);
    const toggleLiveCam = useCallback(() => setLiveCamActive(p => !p), []);
    const toggleMirror = useCallback(() => setIsMirrored(p => !p), []);

    const value = {
        selectedBeat, setSelectedBeat,
        selectedBar, setSelectedBar,
        totalBars, setTotalBars,
        selectedJoint, setSelectedJoint,
        visualizerMode, setVisualizerMode,
        isLiveCamActive, toggleLiveCam,
        isMirrored, toggleMirror, isEditMode,
        toggleEditMode,
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
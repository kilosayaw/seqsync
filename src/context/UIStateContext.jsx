// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const UIStateContext = createContext(null);

const initialMixerState = {
    kitSounds: true,
    uploadedMedia: true,
    cameraFeed: false,
    motionOverlay: false,
    motionOverlayOpacity: 0.5,
};

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [activePad, setActivePadState] = useState(null);
    const [animationState, setAnimationState] = useState('idle');
    const previousActivePadRef = useRef(null);
    
    // Other states
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(16);
    const [padMode, setPadMode] = useState('TRIGGER');
    const [activePanel, setActivePanel] = useState('none');
    const [notification, setNotification] = useState(null);
    const [selectedJoints, setSelectedJoints] = useState([]);
    const [mixerState, setMixerState] = useState(initialMixerState);
    const [activeDirection, setActiveDirection] = useState('l_r');

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 2000);
    };

    const setActivePad = (padIndex) => {
        previousActivePadRef.current = activePad; 
        setActivePadState(padIndex);
    };

    const triggerAnimation = () => {
        const startPad = previousActivePadRef.current;
        const endPad = activePad;

        if (startPad !== null && endPad !== null && startPad !== endPad) {
            setAnimationState('playing');
            setTimeout(() => setAnimationState('idle'), 500); 
        } else {
            showNotification("Select a start pad, then a different end pad to preview.");
        }
    };

    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        previousActivePad: previousActivePadRef.current,
        animationState, triggerAnimation,
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        padMode, setPadMode,
        activePanel, setActivePanel,
        selectedJoints, setSelectedJoints,
        mixerState, setMixerState,
        activeDirection, setActiveDirection,
        notification, showNotification,
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
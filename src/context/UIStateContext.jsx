// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState, useRef } from 'react';

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
    const [animationRange, setAnimationRange] = useState({ start: null, end: null });
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [coreViewMode, setCoreViewMode] = useState('2d');
    const [selectedJoints, setSelectedJoints] = useState([]);
    
    // Other state declarations...
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(16);
    const [padMode, setPadMode] = useState('TRIGGER');
    const [activePanel, setActivePanel] = useState('none');
    const [notification, setNotification] = useState(null);
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
        let startPad, endPad;

        if (activePad !== null) {
            startPad = previousActivePadRef.current;
            endPad = activePad;
        } else {
            const barStartIndex = (selectedBar - 1) * 16;
            startPad = barStartIndex;
            endPad = barStartIndex + 1;
        }

        if (startPad !== null && endPad !== null && startPad !== endPad) {
            setAnimationRange({ start: startPad, end: endPad });
            setAnimationState('playing');
            setTimeout(() => setAnimationState('idle'), 500); 
        } else {
            showNotification("Select a start pad, then a different end pad to preview.");
        }
    };

    const toggleCoreView = () => {
        setCoreViewMode(prev => (prev === '2d' ? '3d' : '2d'));
    };

    const togglePreviewMode = () => {
        setIsPreviewMode(prev => !prev);
    };

    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        animationState, triggerAnimation,
        animationRange, // DEFINITIVE FIX: Export animationRange
        isPreviewMode, togglePreviewMode,
        coreViewMode, setCoreViewMode,
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        padMode, setPadMode,
        activePanel, setActivePanel,
        selectedJoints, setSelectedJoints,
        mixerState, setMixerState,
        activeDirection, setActiveDirection,
        notification, showNotification,
        selectedJoints, setSelectedJoints,
        coreViewMode, toggleCoreView,
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
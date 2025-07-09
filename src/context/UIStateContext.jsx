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
    // DEFINITIVE: Default activePad to 0 for immediate visual feedback
    const [activePad, setActivePadState] = useState(0); 
    const [animationState, setAnimationState] = useState('idle');
    const previousActivePadRef = useRef(null);

    const [animationRange, setAnimationRange] = useState({ start: null, end: null });
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [coreViewMode, setCoreViewMode] = useState('2d');
    const [activeVisualizer, setActiveVisualizer] = useState('none');
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(8); // Default to 8 steps
    const [padMode, setPadMode] = useState('TRIGGER');
    const [activePanel, setActivePanel] = useState('none');
    const [notification, setNotification] = useState(null);
    const [selectedJoints, setSelectedJoints] = useState([]);
    const [mixerState, setMixerState] = useState(initialMixerState);
    const [activeDirection, setActiveDirection] = useState('l_r');

    const setActivePad = (padIndex) => {
        previousActivePadRef.current = activePad; 
        setActivePadState(padIndex);
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 2000);
    };

    const triggerAnimation = () => {
        const startPad = previousActivePadRef.current;
        const endPad = activePad;
        if (startPad !== null && endPad !== null && startPad !== endPad) {
            setAnimationRange({ start: startPad, end: endPad });
            setAnimationState('playing');
            setTimeout(() => setAnimationState('idle'), 500); 
        } else {
            showNotification("Select two pads to preview an animation.");
        }
    };

    const togglePreviewMode = () => {
        setIsPreviewMode(prev => !prev);
    };

    const toggleCoreView = () => {
        setCoreViewMode(prev => (prev === '2d' ? '3d' : '2d'));
    };

    // DEFINITIVE FIX: Removed all duplicate keys from the value object.
    const value = {
        animationState, triggerAnimation,
        animationRange,
        isPreviewMode, togglePreviewMode,
        coreViewMode, toggleCoreView,
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        padMode, setPadMode,
        activePanel, setActivePanel,
        selectedJoints, setSelectedJoints,
        mixerState, setMixerState,
        activeDirection, setActiveDirection,
        notification, showNotification,
        activeVisualizer, setActiveVisualizer,
        selectedBar, setSelectedBar,
        activePad, setActivePad,
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
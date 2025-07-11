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
    const [mixerState, setMixerState] = useState(initialMixerState);
    const [selectedBar, setSelectedBar] = useState(1);
    const [activePad, setActivePadState] = useState(0); 
    const [animationState, setAnimationState] = useState('idle');
    const [animationRange, setAnimationRange] = useState({ start: null, end: null });
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(8);
    const [padMode, setPadMode] = useState('TRIGGER');
    const [activePanel, setActivePanel] = useState('none');
    const [notification, setNotification] = useState(null);
    const [movementFaderValue, setMovementFaderValue] = useState(0.1);
    const [selectedJoints, setSelectedJoints] = useState([]);
    const [activeDirection, setActiveDirection] = useState('l_r');
    const [activeVisualizer, setActiveVisualizer] = useState('none');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [activePresetPage, setActivePresetPage] = useState({ left: 0, right: 0 });
    const previousActivePadRef = useRef(null);
    
    // DEFINITIVE: Removed the activeCornerTool state as it is no longer used.

    const setActivePad = (padIndex) => {
        previousActivePadRef.current = activePad; 
        setActivePadState(padIndex);
    };

    const showNotification = (message, duration = 2000) => {
        setNotification(message);
        setTimeout(() => setNotification(null), duration);
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
    
    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        animationState, triggerAnimation,
        animationRange,
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        padMode, setPadMode,
        activePanel, setActivePanel,
        selectedJoints, setSelectedJoints,
        activeDirection, setActiveDirection,
        notification, showNotification,
        movementFaderValue, setMovementFaderValue,
        activeVisualizer, setActiveVisualizer,
        mixerState, setMixerState,
        activePresetPage, setActivePresetPage,
        isCameraActive, setIsCameraActive,
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
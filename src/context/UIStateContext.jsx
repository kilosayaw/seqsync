// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState, useRef, useMemo, useCallback } from 'react';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

const initialMixerState = {
    kitSounds: true,
    uploadedMedia: true,
    cameraFeed: false,
    motionOverlay: false,
    motionOverlayOpacity: 0.5,
};

export const UIStateProvider = ({ children }) => {
    // All existing states from your project are preserved
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isVisualizerPoppedOut, setIsVisualizerPoppedOut] = useState(false);
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
    const [activePresetPage, setActivePresetPage] = useState({ left: 0, right: 0 });
    const previousActivePadRef = useRef(null);
    const [cameraCommand, setCameraCommand] = useState(null);
    const [weightDistribution, setWeightDistribution] = useState(0);
    const [jointEditMode, setJointEditMode] = useState('position');

    // DEFINITIVE FIX: State is now an object to handle each side's tool independently.
    const [activeCornerTools, setActiveCornerTools] = useState({
        left: 'none',
        right: 'none',
    });

    const setActivePad = (padIndex) => {
        previousActivePadRef.current = activePad; 
        setActivePadState(padIndex);
    };
    const showNotification = useCallback((message, duration = 2000) => {
        setNotification(message);
        setTimeout(() => setNotification(null), duration);
    }, []);
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
    
    const value = useMemo(() => ({
        selectedBar, setSelectedBar, activePad, setActivePad, animationState, triggerAnimation,
        animationRange, editMode, setEditMode, noteDivision, setNoteDivision, padMode, setPadMode,
        activePanel, setActivePanel, selectedJoints, setSelectedJoints, activeDirection, setActiveDirection,
        notification, showNotification, movementFaderValue, setMovementFaderValue, activeVisualizer, setActiveVisualizer,
        mixerState, setMixerState, activePresetPage, setActivePresetPage, isCameraActive, setIsCameraActive,
        isVisualizerPoppedOut, setIsVisualizerPoppedOut, cameraCommand, setCameraCommand,
        weightDistribution, setWeightDistribution, jointEditMode, setJointEditMode,
        activeCornerTools, setActiveCornerTools,
    }), [
        selectedBar, activePad, animationState, animationRange, editMode, noteDivision, padMode,
        activePanel, selectedJoints, activeDirection, notification, movementFaderValue, activeVisualizer,
        mixerState, activePresetPage, 
        // DEFINITIVE: Added activeCornerTools to the dependency array
        activeCornerTools, 
        isCameraActive, isVisualizerPoppedOut,
        cameraCommand, weightDistribution, jointEditMode, showNotification
    ]);

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};
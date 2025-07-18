import React, { createContext, useContext, useState, useRef, useMemo, useCallback } from 'react';
import { produce } from 'immer'; // For safe and easy state updates

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
    const [selectedJoints, setSelectedJoints] = useState([]);
    const [activeDirection, setActiveDirection] = useState('l_r');
    const [activeVisualizer, setActiveVisualizer] = useState('none');
    const [activePresetPage, setActivePresetPage] = useState({ left: 0, right: 0 });
    const previousActivePadRef = useRef(null);
    const [cameraCommand, setCameraCommand] = useState(null);
    const [weightDistribution, setWeightDistribution] = useState(0);
    const [jointEditMode, setJointEditMode] = useState('position');
    const [activeCornerTools, setActiveCornerTools] = useState({ left: 'none', right: 'none' });
    const [movementFaderValues, setMovementFaderValues] = useState({
        left: 0.1,
        right: 0.1,
    });
    
    // --- LOGIC ADDED: New state for the Master Fader's mode ---
    const [masterFaderMode, setMasterFaderMode] = useState('hip'); // Default to 'hip' mode for weight distribution
    // --- END OF LOGIC ADDED ---

    const setMovementFaderValue = useCallback((side, value) => {
        setMovementFaderValues(produce(draft => {
            draft[side] = value;
        }));
    }, []);

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
        // All original values
        selectedBar, setSelectedBar, activePad, setActivePad, animationState, triggerAnimation,
        animationRange, editMode, setEditMode, noteDivision, setNoteDivision, padMode, setPadMode,
        activePanel, setActivePanel, selectedJoints, setSelectedJoints, activeDirection, setActiveDirection,
        notification, showNotification, activeVisualizer, setActiveVisualizer,
        mixerState, setMixerState, activePresetPage, setActivePresetPage, isCameraActive, setIsCameraActive,
        isVisualizerPoppedOut, setIsVisualizerPoppedOut, cameraCommand, setCameraCommand,
        weightDistribution, setWeightDistribution, jointEditMode, setJointEditMode,
        activeCornerTools, setActiveCornerTools, movementFaderValues, setMovementFaderValue,
        
        // --- LOGIC ADDED: Export the new state and setter for MasterFader ---
        masterFaderMode, setMasterFaderMode,
        // --- END OF LOGIC ADDED ---
    }), [
        // All original dependencies
        selectedBar, activePad, animationState, animationRange, editMode, noteDivision, padMode,
        activePanel, selectedJoints, activeDirection, notification, activeVisualizer,
        mixerState, activePresetPage, activeCornerTools, isCameraActive, isVisualizerPoppedOut,
        cameraCommand, weightDistribution, jointEditMode, showNotification,
        movementFaderValues, setMovementFaderValue,

        // --- LOGIC ADDED: Add new state to dependency array ---
        masterFaderMode,
        // --- END OF LOGIC ADDED ---
    ]);

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};
// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState, useRef } from 'react';

const UIStateContext = createContext(null);
const initialMixerState = { /* ... */ };

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [activePad, setActivePadState] = useState(0); 
    const [animationState, setAnimationState] = useState('idle');
    const [previewMode, setPreviewMode] = useState('off');
    const previousActivePadRef = useRef(null);
    const [animationRange, setAnimationRange] = useState({ start: null, end: null });
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(8);
    const [padMode, setPadMode] = useState('TRIGGER');
    const [activePanel, setActivePanel] = useState('none');
    const [notification, setNotification] = useState(null);
    const [movementFaderValue, setMovementFaderValue] = useState(0.1);
    const [selectedJoints, setSelectedJoints] = useState([]);
    const [mixerState, setMixerState] = useState(initialMixerState);
    const [activeDirection, setActiveDirection] = useState('l_r');

    const cyclePreviewMode = () => {
        setPreviewMode(current => {
            if (current === 'off') return '2d';
            if (current === '2d') return '3d';
            return 'off';
        });
    };

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

    const togglePreviewMode = () => {
        setIsPreviewMode(prev => !prev);
    };

    const toggleCoreView = () => {
        setCoreViewMode(prev => (prev === '2d' ? '3d' : '2d'));
    };

    // DEFINITIVE FIX: Removed all duplicate keys from the value object.
    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        animationState, triggerAnimation,
        animationRange,
        previewMode, cyclePreviewMode, // Export new state and cycle function
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        padMode, setPadMode,
        activePanel, setActivePanel,
        selectedJoints, setSelectedJoints,
        mixerState, setMixerState,
        activeDirection, setActiveDirection,
        notification, showNotification,
        previewMode, cyclePreviewMode,
        movementFaderValue, setMovementFaderValue,
        
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
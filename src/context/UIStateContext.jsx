// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';

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
    const [activePad, setActivePad] = useState(null);
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(16);
    const [padMode, setPadMode] = useState('TRIGGER');
    const [activePanel, setActivePanel] = useState('none');
    const [notification, setNotification] = useState(null);
    const [selectedJoints, setSelectedJoints] = useState([]);
    const [mixerState, setMixerState] = useState(initialMixerState);
    
    // NEW STATE for the directional control mode
    const [activeDirection, setActiveDirection] = useState('l_r'); // 'up_down', 'l_r', or 'fwd_bwd'

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 2000);
    };

    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        padMode, setPadMode,
        activePanel, setActivePanel,
        selectedJoints, setSelectedJoints,
        mixerState, setMixerState,
        activeDirection, setActiveDirection, // Export the new state and setter
        notification,
        showNotification,
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};
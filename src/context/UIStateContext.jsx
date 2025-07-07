// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [activePad, setActivePad] = useState(null);
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(16);
    
    // REPLACES padDisplayMode with a more flexible system
    const [activePanel, setActivePanel] = useState('none'); // 'none', 'sound', 'foot', 'pose', 'abbr'
    
    const [notification, setNotification] = useState(null);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 2000);
    };

    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        activePanel, setActivePanel, // Export the new state
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
// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [activePad, setActivePad] = useState(null);
    const [editMode, setEditMode] = useState('none');
    const [noteDivision, setNoteDivision] = useState(16);
    const [activePanel, setActivePanel] = useState('none');
    const [notification, setNotification] = useState(null);
    const [selectedJoints, setSelectedJoints] = useState([]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 2000);
    };

    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        editMode, setEditMode,
        noteDivision, setNoteDivision,
        activePanel, setActivePanel,
        selectedJoints, setSelectedJoints,
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
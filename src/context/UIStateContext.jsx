// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [activePad, setActivePad] = useState(null);
    const [editMode, setEditMode] = useState('none');
    
    // NEW STATE for sequencer mode: 16 = 1/16th notes, 8 = 1/8th notes
    const [noteDivision, setNoteDivision] = useState(16);

    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad,
        editMode, setEditMode,
        noteDivision, setNoteDivision, // Export the new state and setter
    };

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) {
        throw new Error('useUIState must be used within a UIStateProvider');
    }
    return context;
};
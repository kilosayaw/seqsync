// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { NOTE_DIVISIONS } from '../utils/constants';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    
    // This is the single source of truth for which pad is selected.
    // It must start as null (no pad selected).
    const [activePad, setActivePad] = useState(null);
    
    // This controls which foot is being edited.
    const [editMode, setEditMode] = useState('none');

    const value = {
        selectedBar, setSelectedBar,
        activePad, setActivePad, // Provide the state and the setter
        editMode, setEditMode,
    };

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};
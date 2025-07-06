// src/context/UIStateContext.jsx - NO CHANGES NEEDED
import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [activePad, setActivePad] = useState(null);
    const [editMode, setEditMode] = useState('none');

    const value = { selectedBar, setSelectedBar, activePad, setActivePad, editMode, setEditMode };

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};
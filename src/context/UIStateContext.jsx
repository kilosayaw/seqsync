// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { NOTE_DIVISIONS } from '../utils/constants';

// 1. Create the context
const UIStateContext = createContext(null);

// 2. Create the provider component
export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [selectedJoint, setSelectedJoint] = useState(null);
    const [noteDivision, setNoteDivision] = useState(NOTE_DIVISIONS[0].value);
    const [activePad, setActivePad] = useState(null);
    const [editMode, setEditMode] = useState('none');

    // 3. Assemble the value to be provided
    const value = {
        selectedBar, setSelectedBar,
        selectedJoint, setSelectedJoint,
        noteDivision, setNoteDivision,
        activePad, setActivePad,
        editMode, setEditMode,
    };

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};

// 4. Create the custom hook for consuming the context
export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === null) {
        throw new Error('useUIState must be used within a UIStateProvider');
    }
    return context;
};
// src/context/UIStateContext.jsx

import React, { createContext, useContext, useState } from 'react';
import { NOTE_DIVISIONS } from '../utils/constants';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [selectedJoint, setSelectedJoint] = useState(null);
    const [noteDivision, setNoteDivision] = useState(NOTE_DIVISIONS[0].value);
    
    // DEFINITIVE FIX: The initial state for "no pad selected" should be null.
    const [activePad, setActivePad] = useState(null);
    
    // Manages which deck is being edited. Can be 'none', 'left', 'right', or 'both'.
    const [editMode, setEditMode] = useState('none');

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
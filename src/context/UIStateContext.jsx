// src/context/UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { NOTE_DIVISIONS } from '../utils/constants';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [selectedJoint, setSelectedJoint] = useState(null);
    const [noteDivision, setNoteDivision] = useState(NOTE_DIVISIONS[0].value);
    const [padPlayMode, setPadPlayMode] = useState('TRIGGER');
    const [activePad, setActivePad] = useState(null);
    
    // NEW STATE: Manages which deck is being edited. Can be 'none', 'left', 'right', or 'both'.
    const [editMode, setEditMode] = useState('none');

    const value = {
        selectedBar, setSelectedBar,
        selectedJoint, setSelectedJoint,
        noteDivision, setNoteDivision,
        padPlayMode, setPadPlayMode,
        activePad, setActivePad,
        // NEW: Expose editMode state and its setter
        editMode, setEditMode,
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};
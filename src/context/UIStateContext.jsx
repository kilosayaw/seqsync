import React, { createContext, useContext, useState } from 'react';
import { NOTE_DIVISIONS } from '../utils/constants';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [selectedJoint, setSelectedJoint] = useState(null); // This will still be used for other joints
    const [noteDivision, setNoteDivision] = useState(NOTE_DIVISIONS[0].value);
    const [activePad, setActivePad] = useState(null);
    
    // NEW STATE: Manages which deck's grounding is being edited.
    const [editMode, setEditMode] = useState('none'); // 'none', 'left', 'right'

    const value = {
        selectedBar, setSelectedBar,
        selectedJoint, setSelectedJoint,
        noteDivision, setNoteDivision,
        activePad, setActivePad,
        editMode, setEditMode, // Expose the new state and its setter
    };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};
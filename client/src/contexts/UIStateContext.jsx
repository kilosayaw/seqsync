// src/contexts/UIStateContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useSequence } from './SequenceContext';
import { MODES } from '../utils/constants';

const UIStateContext = createContext(null);

export const UIStateProvider = ({ children }) => {
    const [activeEditingJoint, setActiveEditingJoint] = useState(null);
    const [currentEditingBar, setCurrentEditingBar] = useState(0);
    const [activeBeatIndex, setActiveBeatIndex] = useState(0);
    const [viewMode, setViewMode] = useState(MODES.POS);
    const [currentSoundInBank, setCurrentSoundInBank] = useState(null);
    const { songData } = useSequence();

    const activeBeatData = songData?.[currentEditingBar]?.beats?.[activeBeatIndex];

    const value = {
        activeEditingJoint, setActiveEditingJoint,
        currentEditingBar, setCurrentEditingBar,
        activeBeatIndex, setActiveBeatIndex,
        viewMode, setViewMode,
        currentSoundInBank, setCurrentSoundInBank,
        activeBeatData
    };

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};

export const useUIState = () => useContext(UIStateContext);
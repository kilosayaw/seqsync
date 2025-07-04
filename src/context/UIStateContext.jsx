import React, { createContext, useContext, useState, useCallback } from 'react';
import { usePlayback } from './PlaybackContext'; // It needs this to call seekToBeat

const initialUIState = {
    selectedBar: 1,
    selectedBeat: 0,
    activePad: null,
    footEditState: { left: false, right: false },
    noteDivision: 16,
    padPlayMode: 'TRIGGER',
    setSelectedBar: () => {},
    setSelectedBeat: () => {},
    toggleFootEdit: () => {},
    handlePadDown: () => {},
    handlePadUp: () => {},
    setNoteDivision: () => {},
    setPadPlayMode: () => {},
};

const UIStateContext = createContext(initialUIState);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    // This hook is not defined in the original code, but it's needed for functionality
    // If PlaybackContext isn't ready, this will crash. We need to make this robust.
    const playback = usePlayback();

    const [selectedBar, setSelectedBar] = useState(1);
    const [selectedBeat, setSelectedBeat] = useState(0);
    const [activePad, setActivePad] = useState(null);
    const [footEditState, setFootEditState] = useState({ left: false, right: false });
    const [noteDivision, setNoteDivision] = useState(16);
    const [padPlayMode, setPadPlayMode] = useState('TRIGGER');

    const handlePadDown = useCallback((padIndex) => {
        console.log(`[UIState] Pad Down: index ${padIndex} in Bar ${selectedBar}`);
        setActivePad(padIndex);
        setSelectedBeat(padIndex);
        // Safely call seekToBeat only if the context is ready
        if (playback && playback.seekToBeat) {
            playback.seekToBeat(selectedBar - 1, padIndex);
        }
    }, [selectedBar, playback]);

    const handlePadUp = useCallback(() => {
        setActivePad(null);
    }, []);

    const toggleFootEdit = useCallback((side) => {
        console.log(`[UIState] Toggling foot edit for: ${side}`);
        setFootEditState(prev => ({ ...prev, [side]: !prev[side] }));
    }, []);

    const value = {
        selectedBar, setSelectedBar,
        selectedBeat, setSelectedBeat,
        activePad,
        footEditState, toggleFootEdit,
        noteDivision, setNoteDivision,
        padPlayMode, setPadPlayMode,
        handlePadDown, handlePadUp,
    };

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};
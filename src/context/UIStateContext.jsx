import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);

export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    // --- All the states for the UI ---
    const [selectedBar, setSelectedBar] = useState(1);
    const [selectedBeat, setSelectedBeat] = useState(0); 
    const [selectedJoint, setSelectedJointState] = useState(null); // Renamed setter to avoid conflict
    const [isLiveFeed, setIsLiveFeed] = useState(true);
    const [noteDivision, setNoteDivision] = useState(16);
    const [padPlayMode, setPadPlayMode] = useState('TRIGGER');
    const [isPoseEditorOpen, setIsPoseEditorOpen] = useState(false);
    const [beatToEdit, setBeatToEdit] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    // --- The correct toggle logic for joint selection ---
    const handleJointSelect = (jointId) => {
        // If the same joint is clicked, deselect it. Otherwise, select the new one.
        setSelectedJointState(prevJoint => prevJoint === jointId ? null : jointId);
    };

    // --- The value object provided to the context ---
    // This has been carefully constructed to have NO DUPLICATE KEYS.
    const value = {
        selectedBar, 
        setSelectedBar,
        selectedBeat, 
        setSelectedBeat,
        selectedJoint, // The state variable itself
        setSelectedJoint: handleJointSelect, // The setter function, correctly named
        isLiveFeed, 
        setIsLiveFeed,
        noteDivision, 
        setNoteDivision,
        padPlayMode, 
        setPadPlayMode,
        isPoseEditorOpen, 
        setIsPoseEditorOpen,
        beatToEdit, 
        setBeatToEdit,
        isRecording, 
        setIsRecording,
    };
    
    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};
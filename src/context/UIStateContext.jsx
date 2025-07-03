import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);

export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
    const [selectedBar, setSelectedBar] = useState(1);
    const [selectedBeat, setSelectedBeat] = useState(0); 
    const [selectedJoint, setSelectedJointState] = useState(null);
    const [isLiveFeed, setIsLiveFeed] = useState(true);
    const [noteDivision, setNoteDivision] = useState(16);
    // --- THIS IS THE FIX ---
    // The default play mode is now 'GATE'.
    const [padPlayMode, setPadPlayMode] = useState('GATE');
    const [isPoseEditorOpen, setIsPoseEditorOpen] = useState(false);
    const [beatToEdit, setBeatToEdit] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [footEditState, setFootEditState] = useState({ left: false, right: false });

    const handleJointSelect = (jointId) => {
        setSelectedJointState(prevJoint => prevJoint === jointId ? null : jointId);
    };

    const toggleFootEdit = (side, mode = 'single') => {
        if (mode === 'dual') {
            setFootEditState(prev => {
                const areBothActive = prev.left && prev.right;
                return { left: !areBothActive, right: !areBothActive };
            });
        } else {
            setFootEditState(prev => ({
                ...prev,
                [side]: !prev[side]
            }));
        }
    };

    const value = {
        selectedBar, setSelectedBar,
        selectedBeat, setSelectedBeat,
        selectedJoint, setSelectedJoint: handleJointSelect,
        isLiveFeed, setIsLiveFeed,
        noteDivision, setNoteDivision,
        padPlayMode, setPadPlayMode,
        isPoseEditorOpen, setIsPoseEditorOpen,
        beatToEdit, setBeatToEdit,
        isRecording, setIsRecording,
        footEditState, toggleFootEdit,
    };
    
    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};
import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
  const [selectedBar, setSelectedBar] = useState(1);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [selectedJoint, setSelectedJoint] = useState(null);
  const [isLiveFeed, setIsLiveFeed] = useState(true);
  const [isPoseEditorOpen, setIsPoseEditorOpen] = useState(false);
  const [beatToEdit, setBeatToEdit] = useState(null);
  
  // NEW: State for note division
  const [noteDivision, setNoteDivision] = useState('1/16'); // '1/16', '1/8', '1/4'

  const value = {
    selectedBar, setSelectedBar,
    selectedBeat, setSelectedBeat,
    selectedJoint, setSelectedJoint,
    isLiveFeed, setIsLiveFeed,
    isPoseEditorOpen, setIsPoseEditorOpen,
    beatToEdit, setBeatToEdit, noteDivision, setNoteDivision
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};
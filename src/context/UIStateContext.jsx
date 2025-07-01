import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext(null);
export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
  const [selectedBar, setSelectedBar] = useState(1);
  const [selectedBeat, setSelectedBeat] = useState(null); // This is the selected pad index (0-15)
  const [selectedJoint, setSelectedJoint] = useState(null);
  const [isLiveFeed, setIsLiveFeed] = useState(true);
  
  // NEW: State for the Note Division. Values are the number of steps per bar (16, 8, 4).
  const [noteDivision, setNoteDivision] = useState(16); 
  
  const [isPoseEditorOpen, setIsPoseEditorOpen] = useState(false);
  const [beatToEdit, setBeatToEdit] = useState(null);

  const value = {
    selectedBar, setSelectedBar,
    selectedBeat, setSelectedBeat,
    selectedJoint, setSelectedJoint,
    isLiveFeed, setIsLiveFeed,
    noteDivision, setNoteDivision, // Expose the new state and setter
    isPoseEditorOpen, setIsPoseEditorOpen,
    beatToEdit, setBeatToEdit,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};
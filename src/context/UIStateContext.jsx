import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext();

export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
  const [selectedBar, setSelectedBar] = useState(1);
  const [totalBars, setTotalBars] = useState(4); // NEW: Moved here
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [selectedJoint, setSelectedJoint] = useState(null);
  const [appMode, setAppMode] = useState('SEQ');

  const value = {
    selectedBar,
    setSelectedBar,
    totalBars,      // NEW
    setTotalBars,   // NEW
    selectedBeat,
    setSelectedBeat,
    selectedJoint,
    setSelectedJoint,
    appMode,
    setAppMode,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};
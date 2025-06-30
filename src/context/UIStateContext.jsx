import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext();

export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
  const [selectedBar, setSelectedBar] = useState(1);
  const [selectedBeat, setSelectedBeat] = useState(null); // The index 0-15
  const [selectedJoint, setSelectedJoint] = useState(null);
  const [appMode, setAppMode] = useState('SEQ'); // 'SEQ' or 'POS'

  const value = {
    selectedBar,
    setSelectedBar,
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
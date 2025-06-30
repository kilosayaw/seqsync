import React, { createContext, useContext, useState, useCallback } from 'react';

const SequenceContext = createContext();

export const useSequence = () => useContext(SequenceContext);

const initializeSequenceData = () => {
  return Array.from({ length: 16 }, (_, i) => ({
    bar: 1, 
    beat: i,
    poseData: {}, 
    // This is the old grounding structure, we will replace it
    // with a more comprehensive one inside the rotary object.
    
    // NEW: A dedicated object for rotary controller states
    rotary: {
      left: { angle: 0, grounding: null },
      right: { angle: 0, grounding: null },
    },

    sounds: [],     
    transitions: {
      type: 'cut',
      duration: 0,
    },
    waveform: null,
  }));
};

export const SequenceProvider = ({ children }) => {
  const [songData, setSongData] = useState(initializeSequenceData());

  const updateBeatData = useCallback((beatIndex, newBeatData) => {
    setSongData(prevData => {
      const newData = [...prevData];
      newData[beatIndex] = { ...newData[beatIndex], ...newBeatData };
      return newData;
    });
  }, []);

  const updateJointPose = useCallback((beatIndex, jointId, jointPoseData) => {
    setSongData(prevData => {
        const newData = [...prevData];
        const newPoseData = {...newData[beatIndex].poseData, [jointId]: jointPoseData };
        newData[beatIndex] = { ...newData[beatIndex], poseData: newPoseData };
        return newData;
    });
  }, []);
  
  // NEW: A specific function to update rotary state for a given beat and side
  const updateRotaryState = useCallback((beatIndex, side, newState) => {
    setSongData(prevData => {
      const newData = [...prevData];
      const newRotaryData = {
        ...newData[beatIndex].rotary,
        [side]: {
          ...newData[beatIndex].rotary[side],
          ...newState,
        }
      };
      newData[beatIndex] = { ...newData[beatIndex], rotary: newRotaryData };
      return newData;
    })
  }, []);

  const clearSequence = () => {
      setSongData(initializeSequenceData());
  }

  const value = {
    songData,
    updateBeatData,
    updateJointPose,
    updateRotaryState, // Expose the new function
    clearSequence
  };

  return (
    <SequenceContext.Provider value={value}>
      {children}
    </SequenceContext.Provider>
  );
};
import React, { createContext, useContext, useState, useCallback } from 'react';

const SequenceContext = createContext();

export const useSequence = () => useContext(SequenceContext);

const initializeSequenceData = () => {
  return Array.from({ length: 16 }, (_, i) => ({
    bar: 1, 
    beat: i,
    poseData: {}, 
    rotary: {
      left: { angle: 0, grounding: null },
      right: { angle: 0, grounding: null },
    },
    waveform: null, // This will hold the waveform slice
  }));
};

export const SequenceProvider = ({ children }) => {
  const [songData, setSongData] = useState(initializeSequenceData());

  // ... (keep existing update functions)
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


  // NEW: Function to slice the full waveform and distribute it to beats
  const mapWaveformToBeats = useCallback((fullPeaks, trackDuration, bpm) => {
    const beatsPerBar = 16;
    const barDuration = (60 / bpm) * 4; // Assuming 4/4 time signature
    const totalSamples = fullPeaks.length;

    const newSongData = songData.map((beat, index) => {
      const beatStartTime = (index / beatsPerBar) * barDuration;
      const beatEndTime = ((index + 1) / beatsPerBar) * barDuration;

      // Make sure we don't try to read past the end of the track
      if (beatStartTime > trackDuration) {
        return { ...beat, waveform: null };
      }

      const startSample = Math.floor((beatStartTime / trackDuration) * totalSamples);
      const endSample = Math.floor((beatEndTime / trackDuration) * totalSamples);

      const waveformSlice = fullPeaks.slice(startSample, endSample);
      
      return { ...beat, waveform: waveformSlice };
    });
    
    setSongData(newSongData);
  }, [songData]);


  const clearSequence = () => {
      setSongData(initializeSequenceData());
  }

  const value = {
    songData,
    updateBeatData,
    updateJointPose,
    updateRotaryState,
    clearSequence,
    mapWaveformToBeats, // Expose the new function
  };

  return (
    <SequenceContext.Provider value={value}>
      {children}
    </SequenceContext.Provider>
  );
};
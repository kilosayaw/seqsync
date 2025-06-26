// src/contexts/SequencerSettingsContext.jsx
import React, { createContext, useState, useMemo, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_TIME_SIGNATURE, DEFAULT_BPM, BPM_MIN, BPM_MAX } from '../utils/constants';

export const SequencerSettingsContext = createContext(null);

export const SequencerSettingsProvider = ({ children }) => {
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignatureState] = useState(DEFAULT_TIME_SIGNATURE);
  // Add other global sequencer settings here: e.g., default kit, quantization, etc.
  const [globalVolume, setGlobalVolumeState] = useState(0.8); // Example: 0.0 to 1.0

  const setBpm = useCallback((newBpm) => {
    const val = parseInt(newBpm, 10);
    if (!isNaN(val)) {
      setBpmState(Math.max(BPM_MIN, Math.min(BPM_MAX, val)));
    }
  }, []);

  const setTimeSignature = useCallback((newTimeSig) => { // Expects { beatsPerBar: number, beatUnit: number }
    if (newTimeSig && typeof newTimeSig.beatsPerBar === 'number' && typeof newTimeSig.beatUnit === 'number') {
      setTimeSignatureState(newTimeSig);
    }
  }, []);

  const setGlobalVolume = useCallback((newVolume) => {
    const val = parseFloat(newVolume);
    if (!isNaN(val)) {
      setGlobalVolumeState(Math.max(0, Math.min(1, val)));
    }
  }, []);

  const contextValue = useMemo(() => ({
    bpm,
    setBpm,
    timeSignature,
    setTimeSignature,
    globalVolume,
    setGlobalVolume,
  }), [bpm, setBpm, timeSignature, setTimeSignature, globalVolume, setGlobalVolume]);

  return (
    <SequencerSettingsContext.Provider value={contextValue}>
      {children}
    </SequencerSettingsContext.Provider>
  );
};

SequencerSettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSequencerSettings = () => {
  const context = useContext(SequencerSettingsContext);
  if (context === undefined || context === null) {
    throw new Error('useSequencerSettings must be used within a SequencerSettingsProvider');
  }
  return context;
};
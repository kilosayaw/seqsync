import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PlaybackContext = createContext();

export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0); // 0-15 for the 16 steps
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const stepInterval = (60 / bpm) * 1000 / 4; // 16th note interval
      intervalRef.current = setInterval(() => {
        setCurrentBeat(prev => (prev + 1) % 16);
      }, stepInterval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, bpm]);

  const togglePlay = () => setIsPlaying(prev => !prev);
  
  const value = {
    isPlaying,
    bpm,
    currentBeat,
    setBpm,
    togglePlay,
    setIsPlaying,
    setCurrentBeat,
  };

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
};
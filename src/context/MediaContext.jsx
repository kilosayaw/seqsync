import React, { createContext, useContext, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

const MediaContext = createContext();

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
  const [mediaFile, setMediaFile] = useState(null);
  const [wavesurfer, setWavesurfer] = useState(null);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState([]); // NEW: To store the raw waveform data

  const loadMedia = useCallback(async (file) => {
    if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
      setMediaFile(file);
      setIsMediaReady(false);
      setPeaks([]);

      if (wavesurfer) {
        wavesurfer.destroy();
      }
      
      const newWavesurfer = WaveSurfer.create({
        container: document.createElement('div'), 
        url: URL.createObjectURL(file),
        splitChannels: false, // Process a single channel for waveform
      });

      newWavesurfer.on('ready', (newDuration) => {
        setDuration(newDuration);
        // NEW: Get all the peak data for the entire track
        const rawPeaks = newWavesurfer.getDecodedData();
        if (rawPeaks) {
          // We only need one channel of data
          setPeaks(rawPeaks.getChannelData(0));
        }
        setIsMediaReady(true);
      });
      
      setWavesurfer(newWavesurfer);
    } else {
        console.error("Unsupported file type. Please upload an audio or video file.");
    }
  }, [wavesurfer]);

  const value = {
    mediaFile,
    loadMedia,
    isMediaReady,
    wavesurfer,
    duration,
    peaks, // Expose the peak data
  };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
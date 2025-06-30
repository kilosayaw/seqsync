import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

const MediaContext = createContext();

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
  const [mediaFile, setMediaFile] = useState(null);
  const [wavesurfer, setWavesurfer] = useState(null);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [beatMarkers, setBeatMarkers] = useState([]);
  const [duration, setDuration] = useState(0);

  const loadMedia = useCallback(async (file) => {
    // For now, we only handle audio files for beat detection
    if (file && file.type.startsWith('audio/')) {
      setMediaFile(file);
      setIsMediaReady(false);

      if (wavesurfer) {
        wavesurfer.destroy();
      }
      
      const newWavesurfer = WaveSurfer.create({
        container: document.createElement('div'), // We don't need to see the default waveform
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        url: URL.createObjectURL(file),
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
      });

      newWavesurfer.on('ready', (newDuration) => {
        setDuration(newDuration);
        setIsMediaReady(true);
        // !! Placeholder for real beat detection logic !!
        // In a future step, we will replace this with a proper
        // beat detection algorithm. For now, we simulate finding beats.
        console.log("Media ready. Duration:", newDuration);
        const bpm = 120; // Assume a BPM for now
        const beatInterval = 60 / bpm;
        const markers = [];
        for (let i = 0; i < newDuration; i += beatInterval) {
          markers.push(i);
        }
        setBeatMarkers(markers);
        console.log(`Simulated ${markers.length} beats.`);
      });
      
      setWavesurfer(newWavesurfer);
    } else {
        console.error("Unsupported file type. Please upload an audio file.");
    }
  }, [wavesurfer]);

  const value = {
    mediaFile,
    loadMedia,
    isMediaReady,
    wavesurfer,
    beatMarkers,
    duration,
  };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
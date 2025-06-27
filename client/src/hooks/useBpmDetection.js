// src/hooks/useBpmDetection.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useBpmDetection = ({ onBpmDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker('/workers/BPMDetectorWorker.js');
    
    workerRef.current.onmessage = (e) => {
      setIsDetecting(false);
      if (e.data.type === 'success' && onBpmDetected) {
        const bpm = Math.round(e.data.bpm);
        toast.success(`Detected BPM: ~${bpm}`);
        onBpmDetected(bpm); // Use callback to send result to parent
      } else if (e.data.type === 'error') {
        toast.error(e.data.message || 'BPM detection failed.');
      }
    };
    
    // ... (error handling and cleanup)

  }, [onBpmDetected]);

  const detectBpm = useCallback(async (file) => {
    if (!file) return;
    setIsDetecting(true);
    toast.info("Analyzing audio for BPM...");

    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // Get mono channel data
    
    // Send the Float32Array to the worker. It can be transferred for performance.
    workerRef.current.postMessage({ audioData: channelData.buffer }, [channelData.buffer]);
  }, []);

  return { isDetecting, detectBpm };
};
// src/hooks/useBpmDetection.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useBpmDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedBpm, setDetectedBpm] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker('/workers/BPMDetectorWorker.js');
    
    workerRef.current.onmessage = (e) => {
      setIsDetecting(false);
      if (e.data.type === 'success') {
        setDetectedBpm(e.data.bpm);
        toast.success(`Detected BPM: ~${e.data.bpm}`);
      } else {
        toast.error(e.data.message || 'BPM detection failed.');
      }
    };
    
    workerRef.current.onerror = (e) => {
        setIsDetecting(false);
        toast.error('An error occurred in the BPM detection worker.');
        console.error("BPM Worker Error:", e);
    };

    // Cleanup worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const detectBpm = useCallback(async (file) => {
    if (!file) return;
    setIsDetecting(true);
    setDetectedBpm(null);
    toast.info("Analyzing audio for BPM...");

    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    
    // Send the raw ArrayBuffer to the worker for processing
    // We send a copy to make it transferable
    workerRef.current.postMessage({ audioData: arrayBuffer.slice(0) });
  }, []);

  return { isDetecting, detectedBpm, detectBpm };
};
import React, { createContext, useState, useCallback, useMemo, useContext, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSequence } from './SequenceContext';
import { DEFAULT_TIME_SIGNATURE, UI_PADS_PER_BAR } from '../utils/constants';

// Create the context
const MediaContext = createContext(null);

// Create the provider component
export const MediaProvider = ({ children }) => {
    // 1. STATE MANAGEMENT
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [mediaSrcUrl, setMediaSrcUrl] = useState(null);
    const [mediaDuration, setMediaDuration] = useState(0);
    const [isAnalyzingBpm, setIsAnalyzingBpm] = useState(false);
    
    const videoPlayerRef = useRef(null);
    const bpmWorkerRef = useRef(null);
    
    // Consume other contexts to interact with them
    const { setBpm, setBarCount } = useSequence();

    // 2. WORKER INITIALIZATION & MESSAGE HANDLING
    useEffect(() => {
        // CORRECTED PATH: Vite serves the public directory at the root.
        // The path should be absolute from the server root.
        bpmWorkerRef.current = new Worker(new URL('/workers/BPMDetectorWorker.js', import.meta.url), { type: 'module' });
        
        bpmWorkerRef.current.onmessage = (event) => {
            const { type, payload } = event.data;

            if (type === 'BPM_ANALYSIS_COMPLETE') {
                const detectedBpm = Math.round(payload.bpm);
                if (detectedBpm > 0) {
                    setBpm(detectedBpm);
                    toast.success(`Media BPM detected: ${detectedBpm}`);

                    if (mediaDuration > 0) {
                        const beatsPerMinute = detectedBpm;
                        const beatsPerBar = DEFAULT_TIME_SIGNATURE.beatsPerBar;
                        const stepsPerBar = UI_PADS_PER_BAR;
                        const stepsPerBeat = stepsPerBar / beatsPerBar;
                        
                        const secondsPerStep = 60 / (beatsPerMinute * stepsPerBeat);
                        const totalStepsInMedia = mediaDuration / secondsPerStep;
                        const numBars = Math.ceil(totalStepsInMedia / stepsPerBar);

                        setBarCount(numBars);
                    }
                } else {
                    toast.warn("BPM could not be determined from the media.");
                }
            } else if (type === 'BPM_ANALYSIS_ERROR') {
                toast.error(`BPM Analysis failed: ${payload.message}`);
            }
            setIsAnalyzingBpm(false);
        };

        return () => {
            if (bpmWorkerRef.current) {
                bpmWorkerRef.current.terminate();
            }
        };
    }, [setBpm, setBarCount, mediaDuration]);

    // 3. HANDLER FUNCTIONS (These remain unchanged)
    const cleanupResources = useCallback(() => {
        if (mediaSrcUrl) { URL.revokeObjectURL(mediaSrcUrl); }
        if (mediaStream) { mediaStream.getTracks().forEach(track => track.stop()); }
        setMediaSrcUrl(null);
        setMediaStream(null);
        setMediaDuration(0);
    }, [mediaSrcUrl, mediaStream]);

    const handleSetMediaFile = useCallback((file) => {
        if (!file || !file.type.startsWith('video/')) {
            toast.error("Please select a valid video file.");
            return;
        }
        cleanupResources();
        setMediaFile(file);
        const url = URL.createObjectURL(file);
        setMediaSrcUrl(url);
        const videoEl = document.createElement('video');
        videoEl.src = url;
        videoEl.onloadedmetadata = () => {
            setMediaDuration(videoEl.duration);
            toast.success(`Media loaded: ${file.name} (${Math.round(videoEl.duration)}s)`);
            setIsAnalyzingBpm(true);
            toast.info("Analyzing media for BPM...");
            bpmWorkerRef.current.postMessage({ type: 'ANALYZE_BPM', payload: { file } });
        };
        videoEl.onerror = () => {
            toast.error("Could not read media file metadata.");
            setIsAnalyzingBpm(false);
        };
    }, [cleanupResources]);

    const handleSetMediaStream = useCallback((stream) => {
        cleanupResources();
        setMediaFile(null);
        setMediaStream(stream);
        if (videoPlayerRef.current) {
            videoPlayerRef.current.srcObject = stream;
        }
    }, [cleanupResources]);
    
    useEffect(() => {
        if (mediaStream && videoPlayerRef.current) {
            videoPlayerRef.current.srcObject = mediaStream;
        }
    }, [mediaStream, videoPlayerRef]);

    // 4. CONTEXT VALUE
     const value = useMemo(() => ({
        mediaFile, mediaStream, mediaSrcUrl, mediaDuration, isAnalyzingBpm,
        videoPlayerRef, setMediaFile: handleSetMediaFile, setMediaStream: handleSetMediaStream,
    }), [mediaFile, mediaStream, mediaSrcUrl, mediaDuration, isAnalyzingBpm, handleSetMediaFile, handleSetMediaStream]);

    // 5. RENDER PROVIDER
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
};
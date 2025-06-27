import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { UI_PADS_PER_BAR } from '../utils/constants';

const MediaContext = createContext(null);

export const MediaProvider = ({ children }) => {
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [mediaUrl, setMediaUrl] = useState(null);
    const [mediaDuration, setMediaDuration] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const videoPlayerRef = useRef(null);
    const bpmWorkerRef = useRef(null);
    const onsetWorkerRef = useRef(null);
    const frameWorkerRef = useRef(null);
    const analysisControllerRef = useRef(new AbortController());

    const handleSetMediaFile = useCallback(async (file, onBpm, onOnsets, onThumbnailsComplete) => {
        if (!file) return;

        setIsAnalyzing(true);
        setProgress(0);
        analysisControllerRef.current = new AbortController();

        if (mediaUrl) URL.revokeObjectURL(mediaUrl);
        const newUrl = URL.createObjectURL(file);
        setMediaFile(file);
        setMediaUrl(newUrl);
        setMediaStream(null);
        toast.info(`Loaded: ${file.name}`);

        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
            try {
                // STAGE 1: Decode Audio Buffer Once
                setProgress(10);
                const buffer = await file.arrayBuffer();
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
                setMediaDuration(audioBuffer.duration);

                // STAGE 2: Get BPM & Onsets Concurrently
                toast.info("Analyzing audio for rhythm...");
                setProgress(25);

                const bpmPromise = new Promise((resolve, reject) => {
                    bpmWorkerRef.current.onmessage = e => e.data.type === 'success' ? resolve(e.data.bpm) : reject(new Error(e.data.message));
                    bpmWorkerRef.current.onerror = e => reject(e);
                    // Pass a transferable buffer
                    const channelData = audioBuffer.getChannelData(0);
                    bpmWorkerRef.current.postMessage({ audioData: channelData.buffer }, [channelData.buffer]);
                });

                const onsetPromise = new Promise((resolve, reject) => {
                    onsetWorkerRef.current.onmessage = e => e.data.type === 'ONSET_RESULTS' ? resolve(e.data.payload.onsets) : reject(new Error(e.data.payload.message));
                    onsetWorkerRef.current.onerror = e => reject(e);
                    // Pass a separate transferable buffer
                    const onsetChannelData = audioBuffer.getChannelData(0); 
                    onsetWorkerRef.current.postMessage({ audioData: onsetChannelData.buffer, sampleRate: audioContext.sampleRate }, [onsetChannelData.buffer]);
                });

                const [detectedBpm, onsets] = await Promise.all([bpmPromise, onsetPromise]);
                
                setProgress(60);
                onBpm(Math.round(detectedBpm));
                onOnsets(onsets);
                
                // STAGE 3: Video Thumbnail Generation (if applicable)
                if (file.type.startsWith('video/') && onsets.length > 0) {
                    toast.info(`Extracting ${onsets.length} video frames...`);
                    const video = document.createElement('video');
                    video.crossOrigin = "anonymous";
                    video.muted = true;
                    video.src = newUrl;
                    await new Promise(resolve => video.onloadedmetadata = resolve);

                    const thumbnailResults = [];
                    frameWorkerRef.current.onmessage = (e) => {
                        if (e.data.type === 'THUMBNAIL_RESULT') {
                            thumbnailResults.push(e.data.payload);
                            setProgress(60 + (thumbnailResults.length / onsets.length) * 40);
                            if (thumbnailResults.length === onsets.length) {
                                onThumbnailsComplete(thumbnailResults);
                            }
                        }
                    };

                    for (const onset of onsets) {
                        if (analysisControllerRef.current.signal.aborted) throw new Error("Aborted");
                        if (onset.time > video.duration) continue;
                        video.currentTime = onset.time;
                        await new Promise(resolve => video.onseeked = resolve);
                        const bitmap = await createImageBitmap(video);
                        const timePerStep = (60 / detectedBpm) / (UI_PADS_PER_BAR / 4);
                        const stepIndex = Math.floor(onset.time / timePerStep);
                        const bar = Math.floor(stepIndex / UI_PADS_PER_BAR);
                        const beat = stepIndex % UI_PADS_PER_BAR;
                        frameWorkerRef.current.postMessage({ type: 'PROCESS_FRAME', payload: { imageBitmap: bitmap, bar, beat } }, [bitmap]);
                    }
                } else {
                     setProgress(100);
                }
                toast.success("Analysis complete!");

            } catch (error) {
                if (error.message !== "Aborted") toast.error(`Analysis failed: ${error.message}`);
            } finally {
                setTimeout(() => {
                    setIsAnalyzing(false);
                    setProgress(0);
                }, 1500);
            }
        } else {
            setIsAnalyzing(false);
        }
    }, [mediaUrl]);
    
    const handleSetMediaStream = useCallback((stream) => {
        if (mediaUrl) URL.revokeObjectURL(mediaUrl);
        setMediaFile(null);
        setMediaUrl(null);
        setMediaDuration(0);
        setMediaStream(stream);
    }, [mediaUrl]);

    useEffect(() => {
        try {
            bpmWorkerRef.current = new Worker('/workers/BPMDetectorWorker.js', { type: 'module' });
            onsetWorkerRef.current = new Worker('/workers/OnsetDetectorWorker.js', { type: 'module' });
            frameWorkerRef.current = new Worker('/workers/MediaFrameWorker.js', { type: 'module' });
        } catch (err) {
            console.error("FATAL: Could not initialize Web Workers.", err);
            toast.error("Failed to initialize analysis engine. Please refresh.");
        }
        return () => {
            bpmWorkerRef.current?.terminate();
            onsetWorkerRef.current?.terminate();
            frameWorkerRef.current?.terminate();
        };
    }, []);

    const cancelFullAnalysis = () => {
        analysisControllerRef.current.abort();
        setIsAnalyzing(false);
        setProgress(0);
        toast.warn("Analysis cancelled.");
    }

    const value = useMemo(() => ({
        mediaFile, mediaStream, mediaUrl, videoPlayerRef, mediaDuration,
        setMediaFile: handleSetMediaFile, setMediaStream: handleSetMediaStream,
        isAnalyzing, progress, cancelFullAnalysis
    }), [
        mediaFile, mediaStream, mediaUrl, mediaDuration, handleSetMediaFile, handleSetMediaStream, 
        isAnalyzing, progress, cancelFullAnalysis
    ]);

    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (!context) throw new Error('useMedia must be used within a MediaProvider');
    return context;
};
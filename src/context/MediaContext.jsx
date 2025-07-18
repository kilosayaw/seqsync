import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Aubio from 'aubiojs';
import WaveSurfer from 'wavesurfer.js';

const MediaContext = createContext(null);
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [detectedBpm, setDetectedBpm] = useState(120);
    const [mediaFile, setMediaFile] = useState(null);
    const [pendingFile, setPendingFile] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [mediaType, setMediaType] = useState('none');
    const [mediaSource, setMediaSource] = useState(null);

    // --- TIMELINE VISUALIZER: New state to hold the extracted video frame thumbnails ---
    const [videoThumbnails, setVideoThumbnails] = useState([]);
    // --- END ---

    const waveformContainerRef = useRef(null);
    const wavesurferInstanceRef = useRef(null);
    const audioAnalyserRef = useRef(null);
    const videoRef = useRef(null);

    // This useEffect for Wavesurfer setup is unchanged.
    useEffect(() => {
        if (waveformContainerRef.current && !wavesurferInstanceRef.current) {
            const ws = WaveSurfer.create({
                container: waveformContainerRef.current,
                waveColor: '#637381', progressColor: '#00ab55', cursorColor: '#ffffff',
                barWidth: 3, barRadius: 3, responsive: true, height: 40, normalize: true, interact: true,
            });
            wavesurferInstanceRef.current = ws;
            ws.on('ready', () => {
                if (ws.backend) {
                    const analyser = ws.backend.ac.createAnalyser();
                    analyser.fftSize = 256;
                    ws.backend.setFilter(analyser);
                    audioAnalyserRef.current = analyser;
                }
            });
        }
        return () => {
            if (wavesurferInstanceRef.current) {
                wavesurferInstanceRef.current.destroy();
                wavesurferInstanceRef.current = null;
            }
        };
    }, []);

    // This useEffect for audio level metering is unchanged.
    useEffect(() => { /* ... */ }, []);

    // The analyzeAudio function is unchanged.
    const analyzeAudio = useCallback(async (audioBuffer) => { /* ... */ }, []);

    // --- TIMELINE VISUALIZER: New function to extract frames from a video ---
    const extractVideoThumbnails = useCallback(async (videoFile) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const thumbnails = [];
            
            video.preload = 'metadata';
            video.src = URL.createObjectURL(videoFile);

            video.onloadedmetadata = () => {
                const videoDuration = video.duration;
                canvas.width = 160; // A reasonable thumbnail width
                canvas.height = 90;
                
                // Define how many thumbnails to capture (e.g., one per second)
                const interval = 1; // seconds
                let currentTime = 0;

                video.onseeked = async () => {
                    if (currentTime < videoDuration) {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        thumbnails.push(canvas.toDataURL('image/jpeg', 0.7)); // Store as base64 jpeg
                        currentTime += interval;
                        video.currentTime = currentTime;
                    } else {
                        URL.revokeObjectURL(video.src); // Clean up the object URL
                        resolve(thumbnails);
                    }
                };

                // Start the seeking process
                video.currentTime = 0;
            };
        });
    }, []);
    // --- END ---

    const loadMedia = useCallback((file) => {
        if (!file) return;
        if (file.type.startsWith('video/')) setMediaType('video');
        else if (file.type.startsWith('audio/')) setMediaType('audio');
        else { console.error("Unsupported file type:", file.type); return; }
        setPendingFile(file);
    }, []);
    
    const confirmLoad = useCallback(async () => {
        const fileToLoad = pendingFile;
        if (!fileToLoad) return;
        
        setPendingFile(null);
        setIsLoading(true);
        setIsMediaReady(false);
        setVideoThumbnails([]); // Clear old thumbnails
        setMediaFile(fileToLoad);
        
        const url = URL.createObjectURL(fileToLoad);
        setMediaSource(url);

        try {
            if (mediaType === 'audio') {
                const ws = wavesurferInstanceRef.current;
                if (!ws) throw new Error("WaveSurfer not initialized");
                await new Promise((res, rej) => { ws.once('ready', res); ws.once('error', rej); ws.load(url); });
                const audioBuffer = ws.getDecodedData();
                if (audioBuffer) {
                    const analysis = await analyzeAudio(audioBuffer);
                    if (analysis) {
                        setDuration(analysis.duration);
                        setDetectedBpm(analysis.detectedBpm);
                        setIsMediaReady(true);
                    }
                }
            } else if (mediaType === 'video') {
                // --- TIMELINE VISUALIZER: Process the video for thumbnails ---
                const thumbs = await extractVideoThumbnails(fileToLoad);
                setVideoThumbnails(thumbs);
                // We'll get the real duration from the video element itself later.
                // For now, mark as ready so the UI can update.
                setIsMediaReady(true);
                // --- END ---
            }
        } catch (error) {
            console.error("Error processing media file:", error);
            setIsMediaReady(false);
        } finally {
            setIsLoading(false);
        }
    }, [pendingFile, mediaType, analyzeAudio, extractVideoThumbnails]);

    const cancelLoad = () => { setPendingFile(null); };
    
    const value = { 
        isLoading, isMediaReady, setIsMediaReady,
        duration, setDuration,
        detectedBpm, mediaFile,
        wavesurferInstance: wavesurferInstanceRef.current,
        waveformContainerRef, loadMedia, pendingFile, confirmLoad, cancelLoad,
        audioLevel,
        mediaType,
        mediaSource,
        videoRef,
        // --- TIMELINE VISUALIZER: Export the thumbnails ---
        videoThumbnails,
        // --- END ---
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
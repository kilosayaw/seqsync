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
    const [videoThumbnails, setVideoThumbnails] = useState([]);

    const waveformContainerRef = useRef(null);
    const wavesurferInstanceRef = useRef(null);
    const audioAnalyserRef = useRef(null);
    const videoRef = useRef(null); // This ref will be for the MAIN video player in MediaDisplay

    useEffect(() => {
        if (waveformContainerRef.current && !wavesurferInstanceRef.current) {
            const ws = WaveSurfer.create({
                container: waveformContainerRef.current, waveColor: '#637381',
                progressColor: '#00ab55', cursorColor: '#ffffff', barWidth: 3,
                barRadius: 3, responsive: true, height: 40, normalize: true, interact: true,
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

    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            if (audioAnalyserRef.current && wavesurferInstanceRef.current?.isPlaying()) {
                const bufferLength = audioAnalyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                audioAnalyserRef.current.getByteTimeDomainData(dataArray);
                let sumSquares = 0.0;
                for (const amplitude of dataArray) {
                    const val = (amplitude / 128.0) - 1.0;
                    sumSquares += val * val;
                }
                const rms = Math.sqrt(sumSquares / dataArray.length);
                setAudioLevel(rms * 100);
            } else {
                setAudioLevel(level => Math.max(0, level - 2));
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const analyzeAudio = useCallback(async (audioBuffer) => {
        try {
            const aubio = await Aubio();
            const sampleRate = audioBuffer.sampleRate;
            const tempo = new aubio.Tempo(4096, 512, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            const bpms = [];
            for (let i = 0; i < Math.floor(channelData.length / 512); i++) {
                if (tempo.do(channelData.subarray(i * 512, (i + 1) * 512))) {
                    bpms.push(tempo.getBpm());
                }
            }
            let finalBpm = 120;
            if (bpms.length > 0) {
                bpms.sort((a, b) => a - b);
                finalBpm = bpms[Math.floor(bpms.length / 2)];
                while (finalBpm < 60) finalBpm *= 2;
                while (finalBpm > 180) finalBpm /= 2;
            }
            return { duration: audioBuffer.duration, detectedBpm: Math.round(finalBpm) };
        } catch (error) {
            console.error("Error during audio analysis:", error);
            return { duration: audioBuffer.duration, detectedBpm: 120 };
        }
    }, []);

    const extractVideoThumbnails = useCallback(async (videoElement) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const thumbnails = [];
            const videoDuration = videoElement.duration;
            canvas.width = 160;
            canvas.height = 90;
            const interval = 1;
            let currentTime = 0;

            const captureFrame = () => {
                if (currentTime >= videoDuration) {
                    resolve(thumbnails);
                    return;
                }
                videoElement.currentTime = currentTime;
            };
            
            videoElement.onseeked = () => {
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                thumbnails.push(canvas.toDataURL('image/jpeg', 0.7));
                currentTime += interval;
                captureFrame();
            };
            
            videoElement.onerror = (e) => reject(new Error("Error seeking video for thumbnail extraction."));

            captureFrame();
        });
    }, []);
    
    const loadAndProcessVideo = useCallback(async (file) => {
        setIsLoading(true);
        setIsMediaReady(false);
        setVideoThumbnails([]);
        setMediaType('video');
        setMediaFile(file);

        const url = URL.createObjectURL(file);
        setMediaSource(url);

        // The video element in MediaViewer will now trigger the rest of the process
        // via its `onloadedmetadata` event handler. This prevents race conditions.

    }, []);

    const loadMedia = useCallback((file) => {
        if (!file) return;
        if (file.type.startsWith('video/')) {
            loadAndProcessVideo(file);
        } else if (file.type.startsWith('audio/')) {
            // Handle audio loading as before
            setIsLoading(true);
            setMediaType('audio');
            setMediaFile(file);
            const url = URL.createObjectURL(file);
            setMediaSource(url);
            wavesurferInstanceRef.current.load(url);
        } else {
            console.error("Unsupported file type:", file.type);
        }
    }, [loadAndProcessVideo]);

    const value = { 
        isLoading, setIsLoading,
        isMediaReady, setIsMediaReady,
        duration, setDuration,
        detectedBpm, setDetectedBpm,
        mediaFile,
        wavesurferInstance: wavesurferInstanceRef.current,
        waveformContainerRef, loadMedia, // Simplified loadMedia
        audioLevel,
        mediaType,
        mediaSource,
        videoRef,
        videoThumbnails, setVideoThumbnails, // Expose setter
        extractVideoThumbnails, // Expose helper
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
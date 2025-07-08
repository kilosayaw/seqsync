import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Aubio from 'aubiojs';
import WaveSurfer from 'wavesurfer.js';
import * as Tone from 'tone';
import { useSequence } from './SequenceContext';

const MediaContext = createContext(null);
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const { handleMediaReady, songData } = useSequence();

    // --- PLAYBACK STATE MERGED ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [preRollCount, setPreRollCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [bpm, setBpm] = useState(120);
    const [currentBar, setCurrentBar] = useState(1);
    const [currentBeat, setCurrentBeat] = useState(1);
    const metronome = useRef(new Tone.MembraneSynth().toDestination());
    
    // --- MEDIA & UI STATE ---
    const [isLoading, setIsLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [pendingFile, setPendingFile] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isMotionTrackingEnabled, setIsMotionTrackingEnabled] = useState(false);
    
    // --- REFS ---
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const waveformContainerRef = useRef(null);
    const wavesurferInstanceRef = useRef(null);

    // --- PLAYBACK CONTROL ---
    const togglePlay = useCallback(() => {
        setIsPlaying(p => {
            const newIsPlaying = !p;
            if (!newIsPlaying && isRecording) {
                setIsRecording(false);
            }
            return newIsPlaying;
        });
    }, [isRecording]);

    useEffect(() => {
        const ws = wavesurferInstanceRef.current;
        if (!ws) return;
        if (isPlaying && !ws.isPlaying()) ws.play();
        else if (!isPlaying && ws.isPlaying()) ws.pause();
    }, [isPlaying]);
    
    const updateBpm = useCallback((newBpm) => { setBpm(newBpm); }, []);

    // --- AUDIO ANALYSIS ---
    const analyzeAudio = useCallback(async (audioBuffer) => {
        console.log("ANALYZING AUDIO...");
        setIsLoading(true);
        try {
            const aubio = await Aubio();
            const sampleRate = audioBuffer.sampleRate;
            const tempo = new aubio.Tempo(4096, 512, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            const bpms = [];
            for (let i = 0; i < Math.floor(channelData.length / 512); i++) {
                if (tempo.do(channelData.subarray(i * 512, (i + 1) * 512))) bpms.push(tempo.getBpm());
            }
            let finalBpm = 120;
            if (bpms.length > 0) {
                const bpmCounts = bpms.reduce((acc, bpm) => { const r = Math.round(bpm); acc[r] = (acc[r] || 0) + 1; return acc; }, {});
                const sortedBpm = Object.keys(bpmCounts).sort((a,b) => bpmCounts[b] - bpmCounts[a]);
                finalBpm = parseFloat(sortedBpm[0]);
                while (finalBpm < 70) finalBpm *= 2; while (finalBpm > 180) finalBpm /= 2;
            }
            const detectedBpm = Math.round(finalBpm);
            updateBpm(detectedBpm);
            handleMediaReady({ duration: audioBuffer.duration, detectedBpm });
        } catch (error) {
            console.error("Error during audio analysis:", error);
        } finally {
            setIsLoading(false);
        }
    }, [handleMediaReady, updateBpm]);

    // --- CAMERA CONTROL ---
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraActive(false); setIsMotionTrackingEnabled(false);
        if (videoRef.current) videoRef.current.srcObject = null;
        streamRef.current = null;
    }, []);

    const startCamera = useCallback(async () => {
        if (isCameraActive) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsCameraActive(false);
        }
    }, [isCameraActive]);

    const toggleCamera = useCallback(() => { isCameraActive ? stopCamera() : startCamera(); }, [isCameraActive, startCamera, stopCamera]);
    const toggleMotionTracking = useCallback(async () => {
        if (isMotionTrackingEnabled) setIsMotionTrackingEnabled(false);
        else {
            if (!isCameraActive) await startCamera();
            setIsMotionTrackingEnabled(true);
        }
    }, [isMotionTrackingEnabled, isCameraActive, startCamera]);

    // --- MEDIA LOADING ---
    const confirmLoad = useCallback(async (mode) => {
        if (!pendingFile) return;
        if (isCameraActive) stopCamera();
        const fileToLoad = pendingFile;
        setPendingFile(null); setIsLoading(true); setMediaFile(fileToLoad);
        
        if (waveformContainerRef.current) {
            if (wavesurferInstanceRef.current) wavesurferInstanceRef.current.destroy();
            const ws = WaveSurfer.create({
                container: waveformContainerRef.current, waveColor: '#4A4A4A', progressColor: '#00ab55', cursorColor: '#FFFFFF',
                barWidth: 3, barRadius: 3, responsive: true, height: 60, normalize: true, backend: 'MediaElement'
            });
            wavesurferInstanceRef.current = ws;

            ws.on('ready', () => { analyzeAudio(ws.getDecodedData()); setIsLoading(false); });
            ws.on('audioprocess', (time) => {
                const totalBeats = Math.floor(time * (bpm / 60));
                setCurrentTime(time);
                setCurrentBar(Math.floor(totalBeats / 16) + 1);
                setCurrentBeat((totalBeats % 16) + 1);
                if (!isPlaying) setIsPlaying(true);
            });
            ws.on('seek', (progress) => {
                const time = progress * ws.getDuration();
                const totalBeats = Math.floor(time * (bpm / 60));
                setCurrentTime(time);
                setCurrentBar(Math.floor(totalBeats / 16) + 1);
                setCurrentBeat((totalBeats % 16) + 1);
            });
            ws.on('finish', () => { setIsPlaying(false); ws.seekTo(0); });
            ws.on('error', (err) => { console.error("WaveSurfer error:", err); setIsLoading(false); });
            ws.load(URL.createObjectURL(fileToLoad));
        }
    }, [pendingFile, isCameraActive, stopCamera, analyzeAudio, bpm]);
    
    const cancelLoad = () => { setPendingFile(null); };
    const loadMedia = (file) => { setPendingFile(file); };

    // --- RECORDING ---
    const handleRecord = useCallback(() => {
        if (isRecording || isPlaying) {
            setIsRecording(false);
            setIsPlaying(false);
            return;
        }
        if (preRollCount > 0) return;
        let count = 4;
        metronome.current.triggerAttackRelease("C2", "8n", Tone.now());
        setPreRollCount(count);

        const intervalId = setInterval(() => {
            count--;
            if (count > 0) {
                metronome.current.triggerAttackRelease("C2", "8n", Tone.now());
                setPreRollCount(count);
            } else {
                clearInterval(intervalId);
                metronome.current.triggerAttackRelease("C3", "8n", Tone.now());
                setPreRollCount(0);
                setIsRecording(true);
                setIsPlaying(true);
                console.log("RECORDING STARTED");
            }
        }, (60 / bpm) * 1000);
    }, [isRecording, isPlaying, preRollCount, bpm]);

    // --- EXPORTED VALUE ---
    const value = {
        isPlaying, isRecording, preRollCount, currentTime, bpm, currentBar, currentBeat,
        togglePlay, handleRecord, updateBpm,
        isLoading, mediaFile, pendingFile, waveformContainerRef, loadMedia, confirmLoad, cancelLoad,
        isCameraActive, isMotionTrackingEnabled, toggleCamera, toggleMotionTracking, videoRef,
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Aubio from 'aubiojs';
import WaveSurfer from 'wavesurfer.js';

const MediaContext = createContext(null);
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [detectedBpm, setDetectedBpm] = useState(null);
    const [mediaFile, setMediaFile] = useState(null);
    
    // This ref will be passed to the WaveformNavigator component to mount the player.
    const waveformContainerRef = useRef(null);
    // This ref holds the actual WaveSurfer instance.
    const wavesurferInstanceRef = useRef(null);

    // This effect creates the WaveSurfer instance ONCE, when the context first mounts.
    useEffect(() => {
        if (waveformContainerRef.current && !wavesurferInstanceRef.current) {
            console.log("Creating WaveSurfer instance...");
            wavesurferInstanceRef.current = WaveSurfer.create({
                container: waveformContainerRef.current,
                waveColor: '#637381',
                progressColor: '#00ab55',
                cursorColor: '#ffffff',
                barWidth: 3,
                barRadius: 3,
                responsive: true,
                height: 60,
                normalize: true,
                interact: true,
            });
        }
        // Cleanup on unmount
        return () => {
            if (wavesurferInstanceRef.current) {
                wavesurferInstanceRef.current.destroy();
                wavesurferInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once.

    const analyzeAudio = useCallback(async (audioBuffer) => {
        // ... (analysis logic is correct and remains the same)
        console.log("ANALYZING AUDIO...");
        const aubio = await Aubio();
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);
        const tempo = new aubio.Tempo(4096, 512, sampleRate);
        const bpms = [];
        for (let i = 0; i < Math.floor(channelData.length / 512); i++) {
            if (tempo.do(channelData.subarray(i * 512, (i + 1) * 512))) bpms.push(tempo.getBpm());
        }
        let finalBpm = 120;
        if (bpms.length > 0) {
            bpms.sort((a, b) => a - b);
            finalBpm = bpms[Math.floor(bpms.length / 2)];
            while (finalBpm < 60) finalBpm *= 2;
        }
        setDetectedBpm(Math.round(finalBpm));
        setDuration(audioBuffer.duration);
        setIsMediaReady(true);
        setIsLoading(false);
        console.log("ANALYSIS COMPLETE.");
    }, []);

    const loadMedia = useCallback(async (file) => {
        const ws = wavesurferInstanceRef.current;
        if (!ws || !file) return;

        console.log("LOADING MEDIA:", file.name);
        setIsLoading(true); // <<<<< THIS WILL NOW CORRECTLY TRIGGER THE OVERLAY
        setIsMediaReady(false);
        setMediaFile(file);
        
        try {
            await ws.load(URL.createObjectURL(file));
            const audioBuffer = ws.getDecodedData();
            if (audioBuffer) await analyzeAudio(audioBuffer);
            else throw new Error("Could not decode audio data.");
        } catch (error) {
            console.error("Error processing media file:", error);
            setIsLoading(false);
        }
    }, [analyzeAudio]);
    
    const value = { 
        isLoading, loadMedia, isMediaReady, duration, 
        detectedBpm, mediaFile,
        wavesurferInstance: wavesurferInstanceRef.current,
        waveformContainerRef // Pass the ref down to the navigator
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
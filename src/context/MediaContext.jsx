// src/context/MediaContext.jsx

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
    const [firstBeatOffset, setFirstBeatOffset] = useState(0);
    const waveformContainerRef = useRef(null);
    const wavesurferInstanceRef = useRef(null);

    // This effect creates the WaveSurfer instance ONCE, when the context first mounts.
    useEffect(() => {
        if (waveformContainerRef.current && !wavesurferInstanceRef.current) {
            wavesurferInstanceRef.current = WaveSurfer.create({
                container: waveformContainerRef.current,
                waveColor: '#637381',
                progressColor: '#00ab55',
                cursorColor: '#ffffff',
                barWidth: 3,
                barRadius: 3,
                responsive: true,
                height: 40,
                normalize: true,
                interact: true,
            });
        }
        return () => {
            if (wavesurferInstanceRef.current) {
                wavesurferInstanceRef.current.destroy();
                wavesurferInstanceRef.current = null;
            }
        };
    }, []);

    const analyzeAudio = useCallback(async (audioBuffer) => {
        // ... (analysis logic is correct and remains the same)
        console.log("ANALYZING AUDIO...");
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
                bpms.sort((a, b) => a - b);
                finalBpm = bpms[Math.floor(bpms.length / 2)];
                while (finalBpm < 60) finalBpm *= 2;
                while (finalBpm > 180) finalBpm /=2;
            }
            setDetectedBpm(Math.round(finalBpm));
            setDuration(audioBuffer.duration);
            console.log(`ANALYSIS COMPLETE. BPM: ${Math.round(finalBpm)}`);
        } catch (error) {
            console.error("Error during audio analysis:", error);
        } finally {
            setIsMediaReady(true);
            setIsLoading(false); // Ensure loading is turned off even if analysis fails
        }
    }, []);

    const loadMedia = useCallback(async (file) => {
        const ws = wavesurferInstanceRef.current;
        if (!ws || !file) return;
        
        console.log(`[Media] Loading media: ${file.name}`);
        setIsLoading(true);
        setIsMediaReady(false);
        setMediaFile(file);
        
        try {
            const url = URL.createObjectURL(file);
            // We use a promise to handle both ready and error events
            await new Promise((resolve, reject) => {
                ws.once('ready', resolve);
                ws.once('error', reject);
                ws.load(url);
            });
            const audioBuffer = ws.getDecodedData();
            if (audioBuffer) await analyzeAudio(audioBuffer);
            else throw new Error("Could not decode audio data.");

        } catch (error) {
            console.error("Error processing media file:", error);
            setIsLoading(false); // DEFINITIVE FIX: Always turn off loading on error
        }
    }, [analyzeAudio]);
    
    const value = { 
        isLoading, loadMedia, isMediaReady, duration, 
        detectedBpm, firstBeatOffset, mediaFile,
        wavesurferInstance: wavesurferInstanceRef.current,
        waveformContainerRef
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
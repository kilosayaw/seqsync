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

    // NEW STATE for confirmation dialog
    const [pendingFile, setPendingFile] = useState(null);

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
            setIsLoading(false);
        }
    }, []);

    // This function now just sets the pending file to trigger the dialog
    const loadMedia = useCallback((file) => {
        console.log(`[Media] Upload initiated for: ${file.name}. Awaiting confirmation.`);
        setPendingFile(file);
    }, []);

    // This new function contains the original loading logic
    const confirmLoad = useCallback(async () => {
        const ws = wavesurferInstanceRef.current;
        if (!pendingFile || !ws) return;

        const fileToLoad = pendingFile;
        setPendingFile(null); // Hide the dialog
        
        console.log(`[Media] User confirmed. Loading: ${fileToLoad.name}`);
        setIsLoading(true);
        setIsMediaReady(false);
        setMediaFile(fileToLoad);
        
        try {
            const url = URL.createObjectURL(fileToLoad);
            await new Promise((resolve, reject) => {
                ws.once('ready', resolve);
                ws.once('error', reject);
                ws.load(url);
            });
            const audioBuffer = ws.getDecodedData();
            if (audioBuffer) {
                await analyzeAudio(audioBuffer);
            } else {
                throw new Error("Could not decode audio data.");
            }
        } catch (error) {
            console.error("Error processing media file:", error);
            setIsLoading(false);
        }
    }, [pendingFile, analyzeAudio]);

    const cancelLoad = () => {
        console.log('[Media] User cancelled media load.');
        setPendingFile(null);
    };
    
    const value = { 
        isLoading,
        isMediaReady,
        duration,
        detectedBpm,
        mediaFile,
        firstBeatOffset,
        wavesurferInstance: wavesurferInstanceRef.current,
        waveformContainerRef,
        loadMedia,
        pendingFile,
        confirmLoad,
        cancelLoad
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
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
    const [detectedBpm, setDetectedBpm] = useState(120); // Default to 120
    const [mediaFile, setMediaFile] = useState(null);
    const [firstBeatOffset, setFirstBeatOffset] = useState(0);
    
    // This ref will be passed to the WaveformNavigator component to mount the player.
    const waveformContainerRef = useRef(null);
    // This ref holds the SINGLE, definitive WaveSurfer instance.
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
                height: 40, // Match the container's inner height
                normalize: true,
                interact: true, // Allow clicking to seek
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
        console.log("ANALYZING AUDIO...");
        const aubio = await Aubio();
        const sampleRate = audioBuffer.sampleRate;
        const bufferSize = 4096; // Standard buffer size for analysis
        const hopSize = 512;     // Standard hop size
        
        const tempo = new aubio.Tempo(bufferSize, hopSize, sampleRate);
        const beats = new aubio.Beat(bufferSize, hopSize, sampleRate);
        const onsets = new aubio.Onset(bufferSize, hopSize, sampleRate);
        
        const channelData = audioBuffer.getChannelData(0);
        const bpms = [];
        const beatTimes = [];

        let currentPosition = 0;
        while(currentPosition + hopSize < channelData.length) {
            const segment = channelData.subarray(currentPosition, currentPosition + hopSize);
            
            if (tempo.do(segment)) { bpms.push(tempo.getBpm()); }
            if (beats.do(segment)) { beatTimes.push(beats.getLast()); }
            
            currentPosition += hopSize;
        }

        let finalBpm = 120;
        if (bpms.length > 0) {
            bpms.sort((a, b) => a - b);
            finalBpm = bpms[Math.floor(bpms.length / 2)];
            while (finalBpm < 60) finalBpm *= 2;
            while (finalBpm > 180) finalBpm /=2;
        }

        // Determine the first beat offset
        const firstBeat = beatTimes.length > 0 ? beatTimes[0] / sampleRate : 0;
        setFirstBeatOffset(firstBeat);

        setDetectedBpm(Math.round(finalBpm));
        setDuration(audioBuffer.duration);
        setIsMediaReady(true);
        setIsLoading(false);
        console.log(`ANALYSIS COMPLETE. BPM: ${Math.round(finalBpm)}, Offset: ${firstBeat.toFixed(3)}s`);
    }, []);

    const loadMedia = useCallback(async (file) => {
        const ws = wavesurferInstanceRef.current;
        if (!ws || !file) return;

        console.log("LOADING MEDIA:", file.name);
        setIsLoading(true);
        setIsMediaReady(false);
        setMediaFile(file);
        
        try {
            const url = URL.createObjectURL(file);
            await ws.load(url);
            // The 'ready' event is more reliable than waiting for load() to resolve
            ws.on('ready', async () => {
                const audioBuffer = ws.getDecodedData();
                if (audioBuffer) {
                    await analyzeAudio(audioBuffer);
                } else {
                    throw new Error("Could not decode audio data.");
                }
                ws.un('ready'); // Clean up listener
            });
        } catch (error) {
            console.error("Error processing media file:", error);
            setIsLoading(false);
        }
    }, [analyzeAudio]);
    
    const value = { 
        isLoading, loadMedia, isMediaReady, duration, 
        detectedBpm, firstBeatOffset, mediaFile,
        wavesurferInstance: wavesurferInstanceRef.current,
        waveformContainerRef // Pass the ref down to the navigator
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
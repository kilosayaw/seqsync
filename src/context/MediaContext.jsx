import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Aubio from 'aubiojs';

const MediaContext = createContext(null);

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [detectedBpm, setDetectedBpm] = useState(120);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaUrl, setMediaUrl] = useState(null);

    const wavesurferRef = useRef(null);

    const runBeatDetection = async (audioBuffer) => {
        console.log("Starting beat detection...");
        const aubio = await Aubio();
        
        const sampleRate = audioBuffer.sampleRate;
        const tempo = new aubio.Tempo(4096, 512, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        const frameCount = Math.floor(channelData.length / 512);
        let allBpms = [];

        for (let i = 0; i < frameCount; i++) {
            const frame = channelData.subarray(i * 512, (i * 512) + 512);
            if (tempo.do(frame)) {
                allBpms.push(tempo.getBpm());
            }
        }
        
        if (allBpms.length > 0) {
            allBpms.sort((a, b) => a - b);
            let medianBpm = allBpms[Math.floor(allBpms.length / 2)];
            console.log(`Beat detection raw median BPM: ${medianBpm.toFixed(2)}`);

            // --- PROACTIVE BPM SANITY CHECK ---
            while (medianBpm < 60) {
                medianBpm *= 2;
                console.log(`BPM too low. Doubling to: ${medianBpm.toFixed(2)}`);
            }
            
            console.log(`Beat detection complete. Final BPM: ${Math.round(medianBpm)}`);
            setDetectedBpm(Math.round(medianBpm));
        } else {
            console.log("No beats detected. Defaulting to 120 BPM.");
            setDetectedBpm(120);
        }
    };

    const loadMedia = useCallback(async (file) => {
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
            console.error("Unsupported file type. Please upload an audio or video file.");
            return;
        }

        setIsLoading(true);
        setIsMediaReady(false);
        setMediaFile(file);

        const blobUrl = URL.createObjectURL(file);
        setMediaUrl(blobUrl);

        if (!wavesurferRef.current) {
            console.error("WaveSurfer instance is not available. Cannot load media.");
            setIsLoading(false);
            return;
        }
        
        // Wrap WaveSurfer loading in a promise to handle ready/error states gracefully
        return new Promise((resolve, reject) => {
            const subscriptions = [
                wavesurferRef.current.on('ready', async (durationValue) => {
                    try {
                        const audioBuffer = wavesurferRef.current.getDecodedData();
                        setDuration(durationValue);
                        await runBeatDetection(audioBuffer);
                        setIsMediaReady(true);
                        setIsLoading(false);
                        subscriptions.forEach(unsub => unsub());
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }),
                wavesurferRef.current.on('error', (e) => {
                    console.error("Error loading media into WaveSurfer:", e);
                    setIsLoading(false);
                    subscriptions.forEach(unsub => unsub());
                    reject(e);
                })
            ];
            wavesurferRef.current.load(blobUrl);
        });

    }, []);

    const value = { 
        isLoading, 
        loadMedia, 
        isMediaReady, 
        duration, 
        detectedBpm,
        setDetectedBpm,
        mediaFile,
        mediaUrl,
        wavesurferRef
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};
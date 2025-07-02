import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
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
    const [decodedBuffer, setDecodedBuffer] = useState(null); // NEW: State for the raw audio buffer
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
            if (tempo.do(frame)) { allBpms.push(tempo.getBpm()); }
        }
        if (allBpms.length > 0) {
            allBpms.sort((a, b) => a - b);
            let medianBpm = allBpms[Math.floor(allBpms.length / 2)];
            console.log(`Beat detection raw median BPM: ${medianBpm.toFixed(2)}`);
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
            console.error("Unsupported file type.");
            return;
        }
        setIsLoading(true);
        setIsMediaReady(false);
        setMediaFile(file);

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            console.log('[MediaContext] Audio decoded. Providing buffer.');
            setDecodedBuffer(audioBuffer); // Set the buffer in our state
            setDuration(audioBuffer.duration);

            await runBeatDetection(audioBuffer);

            const blobUrl = URL.createObjectURL(file);
            setMediaUrl(blobUrl);
            if (wavesurferRef.current) {
                await wavesurferRef.current.load(blobUrl);
            }
            
            setIsMediaReady(true);
        } catch (error) {
            console.error("Error processing media file:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const value = { isLoading, loadMedia, isMediaReady, duration, detectedBpm, setDetectedBpm, mediaFile, mediaUrl, wavesurferRef, decodedBuffer };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};
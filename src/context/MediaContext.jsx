import React, { createContext, useContext, useState, useCallback } from 'react';
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
    const [firstBeatOffset, setFirstBeatOffset] = useState(0);
    const [wavesurferInstance, setWavesurferInstance] = useState(null);
    const analyzeAudio = useCallback(async (audioBuffer) => {
        const aubio = await Aubio();
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);
        const frameCount = Math.floor(channelData.length / 512);
        const tempo = new aubio.Tempo(4096, 512, sampleRate);
        const bpms = [];
        for (let i = 0; i < frameCount; i++) {
            const frame = channelData.subarray(i * 512, (i + 1) * 512);
            if (tempo.do(frame)) { bpms.push(tempo.getBpm()); }
        }
        if (bpms.length > 0) {
            bpms.sort((a, b) => a - b);
            let finalBpm = bpms[Math.floor(bpms.length / 2)];
            while (finalBpm < 60) { finalBpm *= 2; }
            setDetectedBpm(Math.round(finalBpm));
        } else { setDetectedBpm(120); }
        const onset = new aubio.Onset('default', 4096, 512, sampleRate);
        const onsets = [];
        for (let i = 0; i < frameCount; i++) {
            const frame = channelData.subarray(i * 512, (i + 1) * 512);
            if (onset.do(frame)) { onsets.push(onset.getLast()); }
        }
        setFirstBeatOffset(onsets.length > 0 ? onsets[0] / sampleRate : 0);
        setIsMediaReady(true);
        setIsLoading(false);
    }, []);
    const loadMedia = useCallback(async (file) => {
        if (!wavesurferInstance || !file.type.startsWith('audio/')) return;
        setIsLoading(true);
        setIsMediaReady(false);
        setMediaFile(file);
        const blobUrl = URL.createObjectURL(file);
        try {
            await wavesurferInstance.load(blobUrl);
            const audioBuffer = wavesurferInstance.getDecodedData();
            if (audioBuffer) {
                setDuration(audioBuffer.duration);
                analyzeAudio(audioBuffer);
            } else { throw new Error("WaveSurfer could not decode audio data."); }
        } catch (error) { console.error("Error processing media file:", error); setIsLoading(false); }
    }, [wavesurferInstance, analyzeAudio]);
    const value = { 
        isLoading, loadMedia, isMediaReady, duration, 
        detectedBpm, mediaFile, firstBeatOffset, 
        wavesurferInstance, setWavesurferInstance
    };
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
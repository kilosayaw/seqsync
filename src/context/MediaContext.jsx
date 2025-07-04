import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSequence } from './SequenceContext.jsx';
import { usePlayback } from './PlaybackContext.jsx';
import Aubio from 'aubiojs'; // Assuming aubiojs is correctly set up

const MediaContext = createContext(null);
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { updateMetadata, resizeSequence } = useSequence();
    const { loadAudio } = usePlayback(); // Get the load function from PlaybackContext

    const runBeatDetection = async (audioBuffer) => {
        console.log("[MediaContext] Starting beat detection...");
        // This excellent beat detection logic is preserved entirely.
        const aubio = await Aubio();
        const sampleRate = audioBuffer.sampleRate;
        const tempo = new aubio.Tempo(4096, 512, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        const frameCount = Math.floor(channelData.length / 512);
        let allBpms = [];
        for (let i = 0; i < frameCount; i++) {
            const frame = channelData.subarray(i * 512, (i + 1) * 512);
            if (tempo.do(frame)) { allBpms.push(tempo.getBpm()); }
        }
        if (allBpms.length > 0) {
            allBpms.sort((a, b) => a - b);
            let medianBpm = allBpms[Math.floor(allBpms.length / 2)];
            while (medianBpm < 60) { medianBpm *= 2; }
            const finalBpm = Math.round(medianBpm);
            console.log(`[MediaContext] Beat detection complete. Final BPM: ${finalBpm}`);
            return finalBpm;
        }
        console.warn("[MediaContext] No beats detected. Defaulting to 120 BPM.");
        return 120;
    };

    const loadMedia = useCallback(async (file) => {
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
            console.error("Unsupported file type.");
            return;
        }
        setIsLoading(true);
        console.log(`[MediaContext] Loading file: ${file.name}`);

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const detectedBpm = await runBeatDetection(audioBuffer);
            const trackDuration = audioBuffer.duration;
            const blobUrl = URL.createObjectURL(file);

            // 1. Update the sequence data
            updateMetadata({ bpm: detectedBpm, url: blobUrl, title: file.name });
            const totalBars = Math.ceil(((trackDuration / 60) * detectedBpm) / 4);
            resizeSequence(totalBars);
            
            // 2. Load the audio into the playback engine
            loadAudio(blobUrl);

        } catch (error) {
            console.error("[MediaContext] Error processing media file:", error);
        } finally {
            setIsLoading(false);
        }
    }, [updateMetadata, resizeSequence, loadAudio]);
    
    // We only need to expose the isLoading state and the loadMedia function.
    const value = { isLoading, loadMedia };

    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
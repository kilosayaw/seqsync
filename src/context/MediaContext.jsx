import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Aubio from 'aubiojs';

const MediaContext = createContext(null);

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [detectedBpm, setDetectedBpm] = useState(null);
    const [audioPeaks, setAudioPeaks] = useState([]);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaUrl, setMediaUrl] = useState(null);
    const [firstBeatOffset, setFirstBeatOffset] = useState(0); // To store the first beat's timestamp in seconds
    const wavesurferRef = useRef(null); // To hold the WaveSurfer instance

    const analyzeAudio = async (audioBuffer) => {
        console.log("[MediaContext] Analyzing audio for BPM and Downbeat...");
        const aubio = await Aubio();
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);
        const frameCount = Math.floor(channelData.length / 512);

        // --- BPM Detection ---
        const tempo = new aubio.Tempo(4096, 512, sampleRate);
        const bpms = [];
        for (let i = 0; i < frameCount; i++) {
            const frame = channelData.subarray(i * 512, (i + 1) * 512);
            if (tempo.do(frame)) {
                bpms.push(tempo.getBpm());
            }
        }
        if (bpms.length > 0) {
            bpms.sort((a, b) => a - b);
            const medianBpm = bpms[Math.floor(bpms.length / 2)];
            const roundedBpm = Math.round(medianBpm);
            setDetectedBpm(roundedBpm);
            console.log(`[MediaContext] BPM detected: ${roundedBpm}`);
        } else {
            setDetectedBpm(120); // Fallback
            console.log("[MediaContext] No BPM detected, defaulting to 120.");
        }

        // --- Onset (Downbeat) Detection ---
        const onset = new aubio.Onset('default', 4096, 512, sampleRate);
        const onsets = [];
        for (let i = 0; i < frameCount; i++) {
            const frame = channelData.subarray(i * 512, (i + 1) * 512);
            if (onset.do(frame)) {
                onsets.push(onset.getLast());
            }
        }
        
        // Use the first detected onset as our "beat 1" reference point
        const firstOnsetSample = onsets.length > 0 ? onsets[0] : 0;
        const newFirstBeatOffset = firstOnsetSample / sampleRate;
        setFirstBeatOffset(newFirstBeatOffset);
        console.log(`[MediaContext] First beat offset detected at: ${newFirstBeatOffset.toFixed(3)}s`);
    };

    const loadMedia = useCallback(async (file) => {
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
            console.error("Unsupported file type.");
            return;
        }

        setIsLoading(true);
        setIsMediaReady(false);
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
        }

        // Reset all media-related state
        setDetectedBpm(null);
        setAudioPeaks([]);
        setFirstBeatOffset(0);
        setDuration(0);
        
        const blobUrl = URL.createObjectURL(file);
        setMediaUrl(blobUrl);
        setMediaFile(file);

        try {
            const audioContext = new AudioContext();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            setDuration(audioBuffer.duration);

            // Create a new wavesurfer instance for peak generation
            const ws = WaveSurfer.create({ 
                container: document.createElement('div'), 
                url: blobUrl 
            });
            wavesurferRef.current = ws; // Store instance

            ws.on('ready', () => {
                const peaks = ws.getDecodedData()?.getChannelData(0) || [];
                setAudioPeaks(Array.from(peaks)); // Store a copy of the peak data
                
                // Now that we have the waveform, run the intensive analysis
                analyzeAudio(audioBuffer).finally(() => {
                    setIsMediaReady(true);
                    setIsLoading(false); // All processing is done
                });
            });

            ws.on('error', (e) => {
                console.error("Wavesurfer error:", e);
                setIsLoading(false);
            });

        } catch (error) {
            console.error("Error processing media file:", error);
            setIsLoading(false);
        }
    }, []);

    const value = { 
        isLoading, 
        loadMedia, 
        isMediaReady, 
        duration, 
        detectedBpm, 
        audioPeaks,
        mediaFile,
        mediaUrl,
        firstBeatOffset, // Expose the new offset
        wavesurferRef   // Expose the wavesurfer instance for playback control
    };
    
    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};
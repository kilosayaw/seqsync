import React, { createContext, useContext, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Aubio } from 'aubiojs'; // Import the beat detection library

const MediaContext = createContext();
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [mediaFile, setMediaFile] = useState(null);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [detectedBpm, setDetectedBpm] = useState(null); // To store the result

    // The core beat detection function
    const runBeatDetection = async (audioBuffer) => {
        console.log("Starting beat detection...");
        const aubio = await Aubio(); // Initialize the WASM module
        
        // Aubiojs setup (standard parameters)
        const sampleRate = audioBuffer.sampleRate;
        const bufferSize = 4096;
        const hopSize = 512;

        const tempo = new aubio.Tempo(bufferSize, hopSize, sampleRate);
        const channelData = audioBuffer.getChannelData(0); // Use the left channel
        
        // Process the audio in chunks (frames)
        const frameCount = Math.floor(channelData.length / hopSize);
        let allBpms = [];

        for (let i = 0; i < frameCount; i++) {
            const frame = channelData.subarray(i * hopSize, (i * hopSize) + hopSize);
            const isBeat = tempo.do(frame);
            if (isBeat) {
                // Get the BPM for the detected beat and add it to our list
                allBpms.push(tempo.getBpm());
            }
        }
        
        if (allBpms.length > 0) {
            // A simple way to get a stable BPM is to take the median of all detected values.
            allBpms.sort((a, b) => a - b);
            const medianBpm = allBpms[Math.floor(allBpms.length / 2)];
            console.log(`Beat detection complete. Median BPM: ${medianBpm.toFixed(2)}`);
            setDetectedBpm(Math.round(medianBpm));
        } else {
            console.log("No beats detected. Defaulting to 120 BPM.");
            setDetectedBpm(120); // Fallback if no beats found
        }
    };

    const loadMedia = useCallback(async (file) => {
        if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
            setMediaFile(file);
            setIsMediaReady(false);
            setDetectedBpm(null); // Reset on new file load

            // Use the Web Audio API to decode the file for analysis
            const audioContext = new AudioContext();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            setDuration(audioBuffer.duration);
            
            // Once the audio is decoded, run our analysis function
            await runBeatDetection(audioBuffer);

            setIsMediaReady(true);
        } else {
            console.error("Unsupported file type.");
        }
    }, []);

    const value = {
        mediaFile,
        loadMedia,
        isMediaReady,
        duration,
        detectedBpm, // Expose the detected BPM
    };

    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
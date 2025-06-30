import React, { createContext, useContext, useState, useCallback } from 'react';
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
    const [mediaUrl, setMediaUrl] = useState(null); // This will hold the blob URL for the video player

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
            const medianBpm = allBpms[Math.floor(allBpms.length / 2)];
            console.log(`Beat detection complete. Median BPM: ${medianBpm.toFixed(2)}`);
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
        setDetectedBpm(null);
        setAudioPeaks([]);
        setMediaFile(file);

        // Create a URL for the media file to be used by players
        const blobUrl = URL.createObjectURL(file);
        setMediaUrl(blobUrl);

        try {
            // The Web Audio API can decode the audio track from both audio and video files
            const audioContext = new AudioContext();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            setDuration(audioBuffer.duration);

            // Use WaveSurfer to get peak data for the waveform visuals
            const wavesurfer = WaveSurfer.create({ 
                container: document.createElement('div'), // We don't need the visual element
                url: blobUrl,
                progressColor: '#555',
                waveColor: '#ccc'
            });
            
            wavesurfer.on('ready', () => {
                const peaks = wavesurfer.getDecodedData()?.getChannelData(0) || [];
                setAudioPeaks(Array.from(peaks));
                wavesurfer.destroy();
                
                // Now that we have the waveform, run the beat detection
                runBeatDetection(audioBuffer).finally(() => {
                    setIsMediaReady(true);
                    setIsLoading(false); // All processing is done
                });
            });

            wavesurfer.on('error', (e) => {
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
        mediaFile, // Expose the file itself
        mediaUrl   // Expose the playable URL
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};
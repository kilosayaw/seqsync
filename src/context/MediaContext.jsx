import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Aubio from 'aubiojs';

const MediaContext = createContext(null);
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [detectedBpm, setDetectedBpm] = useState(0); // Default to 0 until detected
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaType, setMediaType] = useState('none');
    const [mediaSource, setMediaSource] = useState(null);
    const [videoThumbnails, setVideoThumbnails] = useState([]);

    const videoRef = useRef(null);

    // This function now ONLY analyzes BPM and returns a number.
    const analyzeBPM = useCallback(async (audioBuffer) => {
        try {
            const aubio = await Aubio();
            const tempo = new aubio.Tempo(4096, 512, audioBuffer.sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            const bpms = [];
            for (let i = 0; i < Math.floor(channelData.length / 512); i++) {
                if (tempo.do(channelData.subarray(i * 512, (i + 1) * 512))) {
                    bpms.push(tempo.getBpm());
                }
            }
            if (bpms.length > 0) {
                bpms.sort((a, b) => a - b);
                let finalBpm = bpms[Math.floor(bpms.length / 2)];
                while (finalBpm < 70) finalBpm *= 2;
                while (finalBpm > 180) finalBpm /= 2;
                return Math.round(finalBpm);
            }
            return 0; // Return 0 if no BPMs were found
        } catch (error) {
            console.error("Error during audio analysis:", error);
            return 0;
        }
    }, []);

    // This function now ONLY generates a static set of thumbnails for the timeline preview.
    const extractVideoThumbnails = useCallback(async (videoElement) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const thumbnails = [];
            const videoDuration = videoElement.duration;
            canvas.width = 160;
            canvas.height = 90;
            const numThumbs = 60; // Generate a fixed number of thumbnails for a smooth preview
            const interval = videoDuration / numThumbs;
            let currentTime = 0;
            let capturedCount = 0;

            videoElement.onseeked = () => {
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                thumbnails.push(canvas.toDataURL('image/jpeg', 0.7));
                capturedCount++;
                currentTime += interval;

                if (capturedCount >= numThumbs || currentTime >= videoDuration) {
                    videoElement.onseeked = null; // Clean up listener
                    resolve(thumbnails);
                    return;
                }
                videoElement.currentTime = currentTime;
            };
            
            videoElement.onerror = (e) => reject(new Error("Error seeking video for thumbnail extraction."));
            videoElement.currentTime = 0; // Start the seeking process
        });
    }, []);

    const loadMedia = useCallback((file) => {
        if (!file) return;
        setIsLoading(true);
        setIsMediaReady(false);
        setVideoThumbnails([]);
        setDetectedBpm(0);
        setDuration(0);

        const url = URL.createObjectURL(file);
        setMediaFile(file);
        setMediaSource(url);

        if (file.type.startsWith('video/')) {
            setMediaType('video');
        } else if (file.type.startsWith('audio/')) {
            setMediaType('audio'); // Audio workflow would be handled separately
        }
    }, []);

    const value = { 
        isLoading, setIsLoading,
        isMediaReady, setIsMediaReady,
        duration, setDuration,
        detectedBpm, setDetectedBpm,
        mediaFile,
        loadMedia,
        mediaType,
        mediaSource,
        videoRef,
        videoThumbnails, setVideoThumbnails,
        extractVideoThumbnails,
        analyzeBPM,
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
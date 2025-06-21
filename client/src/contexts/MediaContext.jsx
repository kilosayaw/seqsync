import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import MusicTempo from 'music-tempo';
import { usePlayback } from './PlaybackContext';
import { useUIState } from './UIStateContext';
import { useSequence } from './SequenceContext';

const MediaContext = createContext(null);

export const MediaProvider = ({ children }) => {
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const videoRef = useRef(null);

    const { setBpm } = usePlayback();
    const { setTotalBars } = useUIState();
    const { setThumbnails } = useSequence();

    const generateThumbnails = useCallback(async (videoUrl, duration, bpm) => {
        console.log('[Slicer] Starting thumbnail generation...');
        return new Promise((resolve) => { // <<< We don't need to reject anymore
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.src = videoUrl;

            let beatIndex = 0;
            const thumbnails = {};
            const timePerBeat = 60 / bpm;
            const totalBeats = Math.floor(duration / timePerBeat);

            video.onloadedmetadata = () => {
                const calculatedBars = Math.ceil(totalBeats / 16);
                setTotalBars(calculatedBars > 0 ? calculatedBars : 1);
                console.log(`[Slicer] Video loaded. Total beats to slice: ${totalBeats}, Calculated Bars: ${calculatedBars}`);
                seekNextBeat();
            };

            const seekNextBeat = () => {
                if (beatIndex >= totalBeats) {
                    console.log('[Slicer] Finished generating all thumbnails.');
                    setThumbnails(thumbnails);
                    resolve(); // Successfully finish
                    return;
                }
                const timeTarget = beatIndex * timePerBeat;
                video.currentTime = timeTarget;
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                const bar = Math.floor(beatIndex / 16);
                const beatInBar = beatIndex % 16;
                
                if (!thumbnails[bar]) thumbnails[bar] = {};
                thumbnails[bar][beatInBar] = dataUrl;

                setLoadingMessage(`Slicing Beat ${beatIndex + 1} / ${totalBeats}`);
                
                beatIndex++;
                seekNextBeat();
            };

            // <<< FIX: Gracefully handle the error instead of crashing >>>
            video.onerror = (e) => {
                console.warn(
                    "[Slicer] Could not decode video for thumbnail generation. " +
                    "This is a browser/codec issue. BPM and bar count are still set. " +
                    "Try a standard MP4 (H.264) file for thumbnail support.", e
                );
                // We resolve the promise here to allow the app to continue,
                // just without thumbnails.
                resolve(); 
            };
        });
    }, [setThumbnails, setTotalBars]);


    const processMediaFile = useCallback(async (file) => {
        if (!file) return;

        setIsLoading(true);
        setMediaUrl(URL.createObjectURL(file));
        setMediaType(file.type.startsWith('video') ? 'video' : 'audio');
        
        try {
            setLoadingMessage('Analyzing BPM...');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const musicTempo = new MusicTempo(audioBuffer.getChannelData(0));
            const detectedBpm = Math.round(musicTempo.tempo);
            
            setBpm(detectedBpm); 
            console.log(`[BPM] Detected BPM: ${detectedBpm}`);

            if (file.type.startsWith('video')) {
                // Now this function will not throw an unhandled rejection
                await generateThumbnails(URL.createObjectURL(file), audioBuffer.duration, detectedBpm);
            }

        } catch (error) {
            console.error("Error processing media file:", error);
            // This alert will now only show for non-video-decoding errors (e.g., corrupt audio)
            alert("Could not process the media file. The audio data may be corrupt.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [setBpm, generateThumbnails]);

    const handleFileChange = (file) => {
        if (file) {
            processMediaFile(file);
        }
    };

    const value = {
        mediaUrl,
        isLoading,
        loadingMessage,
        handleFileChange,
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (!context) throw new Error('useMedia must be used within a MediaProvider');
    return context;
};
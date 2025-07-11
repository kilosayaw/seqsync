import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Aubio from 'aubiojs';
import WaveSurfer from 'wavesurfer.js';

const MediaContext = createContext(null);
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [detectedBpm, setDetectedBpm] = useState(120);
    const [mediaFile, setMediaFile] = useState(null);
    const [firstBeatOffset, setFirstBeatOffset] = useState(0);
    const [pendingFile, setPendingFile] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);

    const waveformContainerRef = useRef(null);
    const wavesurferInstanceRef = useRef(null);
    const audioAnalyserRef = useRef(null);

    useEffect(() => {
        if (waveformContainerRef.current && !wavesurferInstanceRef.current) {
            const ws = WaveSurfer.create({
                container: waveformContainerRef.current,
                waveColor: '#637381',
                progressColor: '#00ab55',
                cursorColor: '#ffffff',
                barWidth: 3, barRadius: 3, responsive: true,
                height: 40, normalize: true, interact: true,
            });
            wavesurferInstanceRef.current = ws;

            // DEFINITIVE FIX: The audio backend is only guaranteed to exist after a file is loaded.
            // We set up the analyser inside the 'ready' event listener, which fires after a successful load.
            ws.on('ready', () => {
                if (ws.backend) {
                    const analyser = ws.backend.ac.createAnalyser();
                    analyser.fftSize = 256;
                    ws.backend.setFilter(analyser); // Use the library's built-in method
                    audioAnalyserRef.current = analyser;
                    console.log("[MediaContext] AnalyserNode connected for volume metering.");
                }
            });
        }
        return () => {
            if (wavesurferInstanceRef.current) {
                wavesurferInstanceRef.current.destroy();
                wavesurferInstanceRef.current = null;
            }
        };
    }, []);

    // This animation loop for the level meter is now safe, as it will only get data
    // when the analyserRef is correctly set after a song loads.
    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            if (audioAnalyserRef.current && wavesurferInstanceRef.current?.isPlaying()) {
                const bufferLength = audioAnalyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                audioAnalyserRef.current.getByteTimeDomainData(dataArray);

                let sumSquares = 0.0;
                for (const amplitude of dataArray) {
                    const val = (amplitude / 128.0) - 1.0;
                    sumSquares += val * val;
                }
                const rms = Math.sqrt(sumSquares / dataArray.length);
                setAudioLevel(rms * 100);
            } else {
                // Apply a decay effect when not playing
                setAudioLevel(level => Math.max(0, level - 2));
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const analyzeAudio = useCallback(async (audioBuffer) => {
        console.log("ANALYZING AUDIO...");
        try {
            const aubio = await Aubio();
            const sampleRate = audioBuffer.sampleRate;
            const tempo = new aubio.Tempo(4096, 512, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            const bpms = [];
            for (let i = 0; i < Math.floor(channelData.length / 512); i++) {
                if (tempo.do(channelData.subarray(i * 512, (i + 1) * 512))) bpms.push(tempo.getBpm());
            }
            let finalBpm = 120;
            if (bpms.length > 0) {
                bpms.sort((a, b) => a - b);
                finalBpm = bpms[Math.floor(bpms.length / 2)];
                while (finalBpm < 60) finalBpm *= 2;
                while (finalBpm > 180) finalBpm /= 2;
            }
            console.log(`ANALYSIS COMPLETE. BPM: ${Math.round(finalBpm)}`);
            return {
                duration: audioBuffer.duration,
                detectedBpm: Math.round(finalBpm),
                firstBeatOffset: 0
            };
        } catch (error) {
            console.error("Error during audio analysis:", error);
            return null;
        }
    }, []);

    const loadMedia = useCallback((file) => {
        setPendingFile(file);
    }, []);
    
    const confirmLoad = useCallback(async () => {
        const ws = wavesurferInstanceRef.current;
        if (!pendingFile || !ws) return null;
        
        const fileToLoad = pendingFile;
        setPendingFile(null);
        setIsLoading(true);
        setIsMediaReady(false);
        setMediaFile(fileToLoad);
        
        try {
            const url = URL.createObjectURL(fileToLoad);
            await new Promise((resolve, reject) => {
                ws.once('ready', resolve);
                ws.once('error', reject);
                ws.load(url);
            });
            const audioBuffer = ws.getDecodedData();
            if (audioBuffer) {
                const analysisResults = await analyzeAudio(audioBuffer);
                if (analysisResults) {
                    setDuration(analysisResults.duration);
                    setDetectedBpm(analysisResults.detectedBpm);
                    setFirstBeatOffset(analysisResults.firstBeatOffset);
                    setIsMediaReady(true);
                }
            } else {
                throw new Error("Could not decode audio data.");
            }
        } catch (error) {
            console.error("Error processing media file:", error);
        } finally {
            setIsLoading(false);
        }
    }, [pendingFile, analyzeAudio]);

    const cancelLoad = () => {
        setPendingFile(null);
    };
    
    const value = { 
        isLoading, isMediaReady, duration, detectedBpm, mediaFile,
        firstBeatOffset, wavesurferInstance: wavesurferInstanceRef.current,
        waveformContainerRef, loadMedia, pendingFile, confirmLoad, cancelLoad,
        audioLevel
    };
    
    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};
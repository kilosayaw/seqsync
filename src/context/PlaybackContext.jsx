import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { DEFAULT_BPM } from '../utils/constants';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [wavesurfer, setWavesurfer] = useState(null);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeBeat, setActiveBeat] = useState(-1);
    const waveformRef = useRef(null);
    const dummyPlaybackRef = useRef(null);

    const startDummyPlayback = useCallback(() => {
        if (dummyPlaybackRef.current) return;
        console.log(`[PlaybackContext] Starting DUMMY playback at ${bpm} BPM.`);
        let lastUpdateTime = performance.now();
        let internalTime = currentTime;
        const tick = (now) => {
            const delta = (now - lastUpdateTime) / 1000;
            internalTime += delta;
            lastUpdateTime = now;
            const sequenceDuration = (16 / ((bpm / 60) * 4));
            if (internalTime > sequenceDuration) internalTime = 0;
            setCurrentTime(internalTime);
            dummyPlaybackRef.current = requestAnimationFrame(tick);
        };
        dummyPlaybackRef.current = requestAnimationFrame(tick);
    }, [bpm, currentTime]);

    const stopDummyPlayback = useCallback(() => {
        if (dummyPlaybackRef.current) {
            console.log('[PlaybackContext] Stopping DUMMY playback.');
            cancelAnimationFrame(dummyPlaybackRef.current);
            dummyPlaybackRef.current = null;
        }
    }, []);

    const initializeEngine = useCallback((mediaUrl, initialBpm) => {
        console.log('[PlaybackContext] Initializing REAL Engine...');
        stopDummyPlayback();
        setIsEngineReady(false);
        if (waveformRef.current) {
            if (wavesurfer) wavesurfer.destroy();
            const ws = WaveSurfer.create({
                container: waveformRef.current, waveColor: 'rgba(200, 200, 200, 0.5)', progressColor: 'rgba(0, 255, 170, 1)',
                barWidth: 3, barGap: 2, barRadius: 2, height: 80, cursorWidth: 2, cursorColor: '#fff',
            });
            ws.on('ready', d => { setDuration(d); setIsEngineReady(true); });
            ws.on('play', () => { stopDummyPlayback(); setIsPlaying(true); });
            ws.on('pause', () => setIsPlaying(false));
            ws.on('finish', () => setIsPlaying(false));
            ws.on('audioprocess', time => setCurrentTime(time));
            ws.load(mediaUrl);
            setWavesurfer(ws);
        }
    }, [wavesurfer, stopDummyPlayback]);

    const togglePlay = useCallback(() => {
        if (wavesurfer && isEngineReady) {
            wavesurfer.playPause();
        } else {
            if (isPlaying) {
                stopDummyPlayback();
                setIsPlaying(false);
            } else {
                startDummyPlayback();
                setIsPlaying(true);
            }
        }
    }, [wavesurfer, isEngineReady, isPlaying, startDummyPlayback, stopDummyPlayback]);

    // RESTORED: These individual functions are needed by the pad mapping hook.
    const play = () => {
        if (wavesurfer && isEngineReady) {
            wavesurfer.play();
        } else if (!isPlaying) {
            startDummyPlayback();
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (wavesurfer && isEngineReady) {
            wavesurfer.pause();
        } else if (isPlaying) {
            stopDummyPlayback();
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            const currentSixteenth = Math.floor(currentTime * (bpm / 60) * 4);
            setActiveBeat(currentSixteenth);
        } else {
            setActiveBeat(-1);
        }
    }, [currentTime, isPlaying, bpm]);

    const value = {
        waveformRef,
        initializeEngine,
        isEngineReady,
        isPlaying,
        togglePlay, // For the main play button
        play,       // RESTORED: For pad trigger/gate
        pause,      // RESTORED: For pad gate
        bpm,
        setBpm,
        duration,
        currentTime,
        activeBeat,
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};
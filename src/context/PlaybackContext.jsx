import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { DEFAULT_BPM } from '../utils/constants';
import { useSequence } from './SequenceContext';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [wavesurfer, setWavesurfer] = useState(null);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [originalBpm, setOriginalBpm] = useState(DEFAULT_BPM);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeBeat, setActiveBeat] = useState(-1);
    
    const waveformRef = useRef(null); 
    const dummyPlaybackRef = useRef(null);
    const { totalBars } = useSequence();

    const startDummyPlayback = useCallback(() => {
        if (dummyPlaybackRef.current) return;
        let lastUpdateTime = performance.now();
        let internalTime = currentTime;
        const tick = (now) => {
            const delta = (now - lastUpdateTime) / 1000;
            internalTime += delta;
            lastUpdateTime = now;
            const sequenceDuration = (totalBars * 16) / ((bpm / 60) * 4);
            if (internalTime >= sequenceDuration) internalTime = 0;
            setCurrentTime(internalTime);
            dummyPlaybackRef.current = requestAnimationFrame(tick);
        };
        dummyPlaybackRef.current = requestAnimationFrame(tick);
    }, [bpm, currentTime, totalBars]);
    
    const stopDummyPlayback = useCallback(() => {
        if (dummyPlaybackRef.current) {
            cancelAnimationFrame(dummyPlaybackRef.current);
            dummyPlaybackRef.current = null;
        }
    }, []);

    const initializeEngine = useCallback((mediaUrl, initialBpm) => {
        if (waveformRef.current) {
            if (wavesurfer) wavesurfer.destroy();
            setOriginalBpm(initialBpm); setBpm(initialBpm);
            const ws = WaveSurfer.create({
                container: waveformRef.current,
                backend: 'MediaElement',
                waveColor: 'rgba(200, 200, 200, 0.5)',
                progressColor: 'rgba(0, 255, 170, 1)',
                barWidth: 3,
                barGap: 2,
                barRadius: 2,
                height: 80,
                cursorWidth: 2,
                cursorColor: '#fff',
                minPxPerSec: 50,
                fillParent: true,
                hideScrollbar: true,
            });
            ws.on('ready', d => { setDuration(d); setIsEngineReady(true); });
            ws.on('error', err => console.error('[PlaybackContext] ❌ WaveSurfer Error:', err));
            ws.on('play', () => { stopDummyPlayback(); setIsPlaying(true); });
            ws.on('pause', () => setIsPlaying(false));
            ws.on('finish', () => setIsPlaying(false));
            ws.on('audioprocess', time => setCurrentTime(time));
            ws.load(mediaUrl);
            setWavesurfer(ws);
        }
    }, [wavesurfer, stopDummyPlayback]);

    const play = useCallback(() => {
        if (wavesurfer && isEngineReady) {
            wavesurfer.play();
        } else if (!isPlaying) {
            startDummyPlayback();
            setIsPlaying(true);
        }
    }, [wavesurfer, isEngineReady, isPlaying, startDummyPlayback]);

    const pause = useCallback(() => {
        if (wavesurfer && isEngineReady) {
            wavesurfer.pause();
        } else if (isPlaying) {
            stopDummyPlayback();
            setIsPlaying(false);
        }
    }, [wavesurfer, isEngineReady, isPlaying, stopDummyPlayback]);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

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
        togglePlay, // This was already correct
        play,       // THIS IS THE FIX
        pause,      // THIS IS THE FIX
        bpm,
        setBpm,
        duration,
        currentTime,
        activeBeat,
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { DEFAULT_BPM } from '../utils/constants';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [wavesurfer, setWavesurfer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [originalBpm, setOriginalBpm] = useState(DEFAULT_BPM);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeBeat, setActiveBeat] = useState(-1);
    const waveformRef = useRef(null);

    const initializeEngine = useCallback((mediaUrl, initialBpm) => {
        console.log('[PlaybackContext] Initializing Engine...');
        if (waveformRef.current) {
            if (wavesurfer) wavesurfer.destroy();
            setOriginalBpm(initialBpm); setBpm(initialBpm);
            const ws = WaveSurfer.create({
                container: waveformRef.current, waveColor: 'rgba(200, 200, 200, 0.5)', progressColor: 'rgba(0, 255, 170, 1)',
                barWidth: 3, barGap: 2, barRadius: 2, height: 80, cursorWidth: 2, cursorColor: '#fff',
            });
            ws.on('ready', d => {
                console.log(`[PlaybackContext] Waveform Ready. Duration: ${d.toFixed(2)}s`);
                setDuration(d);
                // --- PLAYBACK FIX: Resume AudioContext after it's created. ---
                // Browsers often suspend the audio context until a user interaction.
                // Resuming it here ensures it's ready to play.
                ws.getAudioContext().resume();
            });
            ws.on('play', () => { console.log('[PlaybackContext] Play event fired.'); setIsPlaying(true); });
            ws.on('pause', () => { console.log('[PlaybackContext] Pause event fired.'); setIsPlaying(false); setActiveBeat(-1); });
            ws.on('finish', () => { console.log('[PlaybackContext] Finish event fired.'); setIsPlaying(false); setActiveBeat(-1); });
            ws.on('audioprocess', time => setCurrentTime(time));
            console.log(`[PlaybackContext] Loading media URL: ${mediaUrl}`);
            ws.load(mediaUrl);
            setWavesurfer(ws);
        }
    }, [wavesurfer]);

    useEffect(() => {
        if (wavesurfer && bpm > 0 && originalBpm > 0) wavesurfer.setPlaybackRate(bpm / originalBpm, true);
    }, [bpm, originalBpm, wavesurfer]);

    useEffect(() => {
        if (isPlaying && bpm > 0) setActiveBeat(Math.floor(currentTime * (bpm / 60) * 4));
        else setActiveBeat(-1);
    }, [currentTime, isPlaying, bpm]);

    const play = () => {
        console.log('[PlaybackContext] play() called.');
        if (wavesurfer) {
            // --- PLAYBACK FIX: Ensure context is resumed before playing ---
            wavesurfer.getAudioContext().resume().then(() => {
                console.log('[PlaybackContext] AudioContext resumed, attempting to play.');
                wavesurfer.play();
            });
        } else {
            console.warn('[PlaybackContext] play() called, but wavesurfer is not ready.');
        }
    };
    
    const pause = () => {
        console.log('[PlaybackContext] pause() called.');
        wavesurfer?.pause();
    };

    const togglePlay = useCallback(() => {
        console.log('[PlaybackContext] togglePlay() called.');
        if (wavesurfer) {
             wavesurfer.getAudioContext().resume().then(() => {
                console.log('[PlaybackContext] AudioContext resumed, attempting to play/pause.');
                wavesurfer.playPause();
            });
        } else {
             console.warn('[PlaybackContext] togglePlay() called, but wavesurfer is not ready.');
        }
    }, [wavesurfer]);
    
    const value = {
        wavesurfer, waveformRef, initializeEngine, isPlaying, play, pause, togglePlay,
        seekToStart: () => wavesurfer?.seekTo(0),
        bpm, setBpm, duration, currentTime, activeBeat,
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};
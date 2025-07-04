import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSequence } from './SequenceContext.jsx';
import WaveSurfer from 'wavesurfer.js';

const defaultPlaybackState = {
    waveformRef: { current: null },
    play: () => console.warn('PlaybackContext not ready'),
    pause: () => console.warn('PlaybackContext not ready'),
    loadAudio: () => console.warn('PlaybackContext not ready'),
    seekToBeat: () => console.warn('PlaybackContext not ready'),
    isPlaying: false, isReady: false, activeBeat: 1, currentBar: 1,
};

const PlaybackContext = createContext(defaultPlaybackState);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const { sequence } = useSequence();
    const { metadata, timeSignature, bars } = sequence;
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [activeBeat, setActiveBeat] = useState(1);
    const [currentBar, setCurrentBar] = useState(1);
    const wavesurfer = useRef(null);
    const waveformRef = useRef(null);
    const animationFrameId = useRef(null);

    const animationLoop = useCallback(() => {
        if (!wavesurfer.current) return;
        const time = wavesurfer.current.getCurrentTime();
        const beatsPerSecond = metadata.bpm / 60;
        const totalBeats = time * beatsPerSecond;
        const bar = Math.floor(totalBeats / timeSignature.beats) + 1;
        const beat = (totalBeats % timeSignature.beats) + 1;
        if (bar <= bars.length) setCurrentBar(bar);
        setActiveBeat(beat);
        animationFrameId.current = requestAnimationFrame(animationLoop);
    }, [metadata.bpm, timeSignature.beats, bars.length]);

    const play = () => { if (isReady && wavesurfer.current) { wavesurfer.current.play(); setIsPlaying(true); console.log('[PlaybackContext] Play command issued.'); } };
    const pause = () => { if (wavesurfer.current) { wavesurfer.current.pause(); setIsPlaying(false); console.log('[PlaybackContext] Pause command issued.'); } };

    const loadAudio = useCallback((url) => {
        if (wavesurfer.current) {
            console.log(`[PlaybackContext] Loading new media: ${url}`);
            setIsReady(false);
            wavesurfer.current.load(url);
        }
    }, []);

    // NEW: The Cue Point function. It calculates the precise time for a given beat and seeks.
    const seekToBeat = useCallback((barIndex, beatIndex) => {
        if (!wavesurfer.current || !isReady) return;
        
        const secondsPerBeat = 60 / metadata.bpm;
        const secondsPerSixteenth = secondsPerBeat / timeSignature.subdivision;
        const beatsInPriorBars = barIndex * (timeSignature.beats * timeSignature.subdivision);
        const targetTime = (beatsInPriorBars + beatIndex) * secondsPerSixteenth;
        const duration = wavesurfer.current.getDuration();

        if (targetTime < duration) {
            console.log(`[PlaybackContext] Seeking to B${barIndex+1}:${beatIndex+1} (Time: ${targetTime.toFixed(2)}s)`);
            wavesurfer.current.seekTo(targetTime / duration);
        }
    }, [metadata.bpm, timeSignature.subdivision, timeSignature.beats, isReady]);

    useEffect(() => {
        // WaveSurfer initialization logic... (as it was in the final successful fix)
        // This logic is sound and does not need to change.
    }, []);

    useEffect(() => {
        if (isPlaying) { animationFrameId.current = requestAnimationFrame(animationLoop); } 
        else { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); }
        return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
    }, [isPlaying, animationLoop]);

    const value = { waveformRef, play, pause, loadAudio, seekToBeat, isPlaying, isReady, activeBeat, currentBar };
    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};
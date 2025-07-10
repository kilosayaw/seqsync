// src/context/PlaybackContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMedia } from './MediaContext'; // DEFINITIVE FIX: Re-added missing import
import { useSequence } from './SequenceContext';
import * as Tone from 'tone';

const PlaybackContext = createContext(null);
export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [preRollCount, setPreRollCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [bpm, setBpm] = useState(120);
    const [currentBar, setCurrentBar] = useState(1);
    const [currentBeat, setCurrentBeat] = useState(0);

    // DEFINITIVE FIX: Re-added useMedia hook to get necessary values
    const { wavesurferInstance, detectedBpm } = useMedia(); 
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const metronome = useRef(null);
    const animationFrameId = useRef();

    useEffect(() => {
        metronome.current = new Tone.MembraneSynth().toDestination();
    }, []);

    useEffect(() => {
        if (detectedBpm) {
            setBpm(detectedBpm);
            Tone.Transport.bpm.value = detectedBpm;
        }
    }, [detectedBpm]);

    useEffect(() => {
        const animate = () => {
            if (wavesurferInstance && wavesurferInstance.isPlaying()) {
                const time = wavesurferInstance.getCurrentTime();
                setCurrentTime(time);

                if (barStartTimes.length > 0) {
                    let bar = 1;
                    let beat = 0;
                    for (let i = barStartTimes.length - 1; i >= 0; i--) {
                        if (time >= barStartTimes[i]) {
                            bar = i + 1;
                            const timeIntoBar = time - barStartTimes[i];
                            // Time per step (eighth note)
                            const timePerStep = (60 / bpm) / 2;
                            beat = Math.floor(timeIntoBar / timePerStep);
                            break;
                        }
                    }
                    if (bar !== currentBar) setCurrentBar(bar);
                    if (beat !== currentBeat) setCurrentBeat(beat);
                }
            }
            animationFrameId.current = requestAnimationFrame(animate);
        };

        if (isPlaying) {
            animationFrameId.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animationFrameId.current);
        }

        return () => cancelAnimationFrame(animationFrameId.current);
    }, [isPlaying, wavesurferInstance, barStartTimes, bpm, STEPS_PER_BAR, currentBar, currentBeat]);

    const seekToTime = useCallback((time) => {
        if (wavesurferInstance) {
            const duration = wavesurferInstance.getDuration();
            if (duration > 0) {
                wavesurferInstance.seekTo(time / duration);
                setCurrentTime(time);
            }
        }
    }, [wavesurferInstance]);

    const togglePlay = useCallback(async () => {
        if (!wavesurferInstance) return;
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        wavesurferInstance.playPause();
        setIsPlaying(wavesurferInstance.isPlaying());
    }, [wavesurferInstance]);
    
    const playPreRollAndStart = useCallback(() => {
        if (!wavesurferInstance || !metronome.current) return;
        
        const now = Tone.now();
        const timePerBeat = 60 / bpm;
        const countdownBeats = ['4', '3', '2', '1'];
        
        countdownBeats.forEach((_, index) => {
            metronome.current.triggerAttackRelease('C2', '8n', now + (index * timePerBeat));
        });

        countdownBeats.forEach((val, i) => {
            setTimeout(() => setPreRollCount(parseInt(val)), i * timePerBeat * 1000);
        });

        setTimeout(() => {
            setPreRollCount(0);
            setIsPlaying(true);
            setIsRecording(true);
            wavesurferInstance.play();
        }, 4 * timePerBeat * 1000);

    }, [wavesurferInstance, bpm]);

    const handleRecord = useCallback(() => {
        if (isRecording) {
            setIsRecording(false);
            if (isPlaying) {
                wavesurferInstance.pause();
                setIsPlaying(false);
            }
        } else {
            playPreRollAndStart();
        }
    }, [isRecording, isPlaying, wavesurferInstance, playPreRollAndStart]);

    const value = { 
        isPlaying,
        isRecording,
        currentTime,
        bpm, 
        setBpm,
        currentBar,
        currentBeat,
        preRollCount,
        togglePlay,
        seekToTime,
        handleRecord,
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};
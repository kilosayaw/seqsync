// src/context/PlaybackContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMedia } from './MediaContext';
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
    // DEFINITIVE: New state for the audio level.
    const [audioLevel, setAudioLevel] = useState(-Infinity);

    const { wavesurferInstance, duration, detectedBpm } = useMedia();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const metronome = useRef(null);
    const animationFrameId = useRef();
    // DEFINITIVE: Ref to hold the Tone.Meter instance.
    const meter = useRef(null);

    useEffect(() => {
        metronome.current = new Tone.MembraneSynth().toDestination();
        // DEFINITIVE: Initialize the meter and connect it to the master output.
        meter.current = new Tone.Meter();
        Tone.getDestination().connect(meter.current);

        const updateLoop = () => {
            setAudioLevel(meter.current.getValue());
            animationFrameId.current = requestAnimationFrame(updateLoop);
        };
        updateLoop();

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    useEffect(() => {
        metronome.current = new Tone.MembraneSynth().toDestination();
    }, []);

    useEffect(() => {
        if (detectedBpm) {
            setBpm(detectedBpm);
            Tone.Transport.bpm.value = detectedBpm;
        }
    }, [detectedBpm]);

    const handleAudioProcess = useCallback((time) => {
        setCurrentTime(time);
        if (!barStartTimes.length) return;

        let bar = 1;
        let beat = 0;

        for (let i = barStartTimes.length - 1; i >= 0; i--) {
            if (time >= barStartTimes[i]) {
                bar = i + 1;
                const timeIntoBar = time - barStartTimes[i];
                const timePerBeat = (60 / bpm) / (STEPS_PER_BAR / 4);
                beat = Math.floor(timeIntoBar / timePerBeat);
                break;
            }
        }
        
        if (bar !== currentBar) setCurrentBar(bar);
        if (beat !== currentBeat) setCurrentBeat(beat);

    }, [barStartTimes, bpm, STEPS_PER_BAR, currentBar, currentBeat]);

    useEffect(() => {
        if (wavesurferInstance) {
            const onProcess = (time) => handleAudioProcess(time);
            const onFinish = () => {
                setIsPlaying(false);
                setIsRecording(false);
            };

            wavesurferInstance.on('audioprocess', onProcess);
            wavesurferInstance.on('finish', onFinish);

            return () => {
                wavesurferInstance.un('audioprocess', onProcess);
                wavesurferInstance.un('finish', onFinish);
            };
        }
    }, [wavesurferInstance, handleAudioProcess]);

    const seekToTime = useCallback((time) => {
        if (wavesurferInstance && duration > 0) {
            wavesurferInstance.seekTo(time / duration);
            handleAudioProcess(time);
        }
    }, [wavesurferInstance, duration, handleAudioProcess]);

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
        
        // Schedule metronome clicks
        countdownBeats.forEach((_, index) => {
            metronome.current.triggerAttackRelease('C2', '8n', now + (index * timePerBeat));
        });

        // Schedule visual countdown
        countdownBeats.forEach((val, i) => {
            setTimeout(() => setPreRollCount(parseInt(val)), i * timePerBeat * 1000);
        });

        // Schedule the actual start of playback
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
        audioLevel,
    };

    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};
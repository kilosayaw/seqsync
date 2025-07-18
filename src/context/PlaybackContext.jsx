import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMedia } from './MediaContext.jsx';
import { useSequence } from './SequenceContext.jsx';
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

    const { wavesurferInstance, detectedBpm, mediaType, videoRef, isMediaReady } = useMedia(); 
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    
    const metronome = useRef(null);
    const preRollSequence = useRef(null);
    const animationFrameId = useRef();

    useEffect(() => {
        metronome.current = new Tone.MembraneSynth().toDestination();
        return () => { metronome.current?.dispose(); };
    }, []);

    useEffect(() => { if (detectedBpm) { setBpm(detectedBpm); Tone.Transport.bpm.value = detectedBpm; } }, [detectedBpm]);

    // Animation loop for playhead/time display remains the same. It's efficient.
    useEffect(() => {
        const animate = () => {
            if (!isPlaying) { cancelAnimationFrame(animationFrameId.current); return; }
            let time = 0;
            if (mediaType === 'audio' && wavesurferInstance?.isPlaying()) { time = wavesurferInstance.getCurrentTime(); }
            else if (mediaType === 'video' && videoRef.current && !videoRef.current.paused) { time = videoRef.current.currentTime; }
            setCurrentTime(time);
            if (barStartTimes.length > 0) {
                let bar = 1, beat = 0;
                for (let i = barStartTimes.length - 1; i >= 0; i--) {
                    if (time >= barStartTimes[i]) {
                        bar = i + 1;
                        const timeIntoBar = time - barStartTimes[i];
                        const timePerStep = (60 / bpm) / 2;
                        beat = Math.floor(timeIntoBar / timePerStep);
                        break;
                    }
                }
                if (bar !== currentBar) setCurrentBar(bar);
                if (beat !== currentBeat) setCurrentBeat(beat);
            }
            animationFrameId.current = requestAnimationFrame(animate);
        };
        if (isPlaying) { animationFrameId.current = requestAnimationFrame(animate); }
        else { cancelAnimationFrame(animationFrameId.current); }
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [isPlaying, mediaType, wavesurferInstance, videoRef, barStartTimes, bpm, STEPS_PER_BAR, currentBar, currentBeat]);

    // DEFINITIVE SYNC FIX: This effect makes React's state follow the media's true state.
    useEffect(() => {
        const video = videoRef.current;
        const wavesurfer = wavesurferInstance;
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleFinish = () => { setIsPlaying(false); setCurrentTime(0); }; // Reset on end
        if (mediaType === 'video' && video) { video.addEventListener('play', handlePlay); video.addEventListener('pause', handlePause); video.addEventListener('ended', handleFinish); }
        else if (mediaType === 'audio' && wavesurfer) { wavesurfer.on('play', handlePlay); wavesurfer.on('pause', handlePause); wavesurfer.on('finish', handleFinish); }
        return () => {
            if (mediaType === 'video' && video) { video.removeEventListener('play', handlePlay); video.removeEventListener('pause', handlePause); video.removeEventListener('ended', handleFinish); }
            else if (mediaType === 'audio' && wavesurfer) { wavesurfer.un('play', handlePlay); wavesurfer.un('pause', handlePause); wavesurfer.un('finish', handleFinish); }
        };
    }, [mediaType, videoRef, wavesurferInstance]);

    const seekToTime = useCallback((time) => {
        if (mediaType === 'audio' && wavesurferInstance) {
            const duration = wavesurferInstance.getDuration();
            if (duration > 0) wavesurferInstance.seekTo(time / duration);
        } else if (mediaType === 'video' && videoRef.current) {
            videoRef.current.currentTime = time;
        }
        setCurrentTime(time);
    }, [mediaType, wavesurferInstance, videoRef]);

    const togglePlay = useCallback(async () => {
        if (!isMediaReady || isRecording) return;
        if (Tone.context.state !== 'running') { await Tone.start(); }
        if (mediaType === 'audio' && wavesurferInstance) { wavesurferInstance.playPause(); }
        else if (mediaType === 'video' && videoRef.current) {
            if (videoRef.current.paused) { await videoRef.current.play(); }
            else { videoRef.current.pause(); }
        }
    }, [isMediaReady, isRecording, mediaType, wavesurferInstance, videoRef]);

    const stopAllPlayback = useCallback(() => {
        Tone.Transport.stop(); Tone.Transport.cancel();
        if (preRollSequence.current) { preRollSequence.current.stop(0); preRollSequence.current.dispose(); preRollSequence.current = null; }
        if (mediaType === 'video' && videoRef.current && !videoRef.current.paused) { videoRef.current.pause(); }
        else if (mediaType === 'audio' && wavesurferInstance?.isPlaying()) { wavesurferInstance.stop(); }
        setIsRecording(false); setPreRollCount(0);
    }, [mediaType, videoRef, wavesurferInstance]);

    // FULLY IMPLEMENTED RECORDING LOGIC
    const playPreRollAndStart = useCallback(async () => {
        if (!isMediaReady) return;
        seekToTime(0);
        const preRollBeats = [0, 1, 2, 3];
        preRollSequence.current = new Tone.Sequence((time, beat) => {
            metronome.current.triggerAttack("C2", time);
            Tone.Draw.schedule(() => setPreRollCount(4 - beat), time);
        }, preRollBeats, "4n").start(0);
        Tone.Transport.scheduleOnce((time) => {
            if (mediaType === 'video' && videoRef.current) { videoRef.current.play(); }
            else if (mediaType === 'audio' && wavesurferInstance) { wavesurferInstance.play(); }
            Tone.Draw.schedule(() => { setIsRecording(true); setPreRollCount(0); }, time);
        }, "1m");
        Tone.Transport.start();
    }, [isMediaReady, mediaType, videoRef, wavesurferInstance, seekToTime]);
    
    const handleRecord = useCallback(async () => {
        if (Tone.context.state !== 'running') { await Tone.start(); }
        if (isRecording) { stopAllPlayback(); }
        else if (!isPlaying) { playPreRollAndStart(); }
    }, [isRecording, isPlaying, stopAllPlayback, playPreRollAndStart]);

    const value = { 
        isPlaying, isRecording, currentTime, bpm, setBpm, currentBar, currentBeat,
        preRollCount, togglePlay, seekToTime, handleRecord,
    };
    
    return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};
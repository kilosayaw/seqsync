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

    const { wavesurferInstance, detectedBpm, mediaType, videoRef } = useMedia(); 
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const metronome = useRef(null);
    const animationFrameId = useRef();

    useEffect(() => {
        metronome.current = new Tone.MembraneSynth().toDestination();
        return () => {
            metronome.current?.dispose();
        };
    }, []);

    useEffect(() => {
        if (detectedBpm) {
            setBpm(detectedBpm);
            Tone.Transport.bpm.value = detectedBpm;
        }
    }, [detectedBpm]);

    useEffect(() => {
        const animate = () => {
            let time = 0;
            let isPlayingFlag = false;

            if (mediaType === 'audio' && wavesurferInstance?.isPlaying()) {
                time = wavesurferInstance.getCurrentTime();
                isPlayingFlag = true;
            } else if (mediaType === 'video' && videoRef.current && !videoRef.current.paused) {
                time = videoRef.current.currentTime;
                isPlayingFlag = true;
            }
            
            if (isPlayingFlag) {
                setCurrentTime(time);

                if (barStartTimes.length > 0) {
                    let bar = 1;
                    let beat = 0;
                    for (let i = barStartTimes.length - 1; i >= 0; i--) {
                        if (time >= barStartTimes[i]) {
                            bar = i + 1;
                            const timeIntoBar = time - barStartTimes[i];
                            const timePerStep = (60 / bpm) / 2; // Time per eighth note
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
    }, [isPlaying, mediaType, wavesurferInstance, videoRef, barStartTimes, bpm, STEPS_PER_BAR, currentBar, currentBeat]);

    const seekToTime = useCallback((time) => {
        if (mediaType === 'audio' && wavesurferInstance) {
            const duration = wavesurferInstance.getDuration();
            if (duration > 0) {
                wavesurferInstance.seekTo(time / duration);
            }
        } else if (mediaType === 'video' && videoRef.current) {
            videoRef.current.currentTime = time;
        }
        setCurrentTime(time);
    }, [mediaType, wavesurferInstance, videoRef]);

    const togglePlay = useCallback(async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }

        if (mediaType === 'audio' && wavesurferInstance) {
            wavesurferInstance.playPause();
            setIsPlaying(wavesurferInstance.isPlaying());
        } else if (mediaType === 'video' && videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, [mediaType, wavesurferInstance, videoRef]);
    
    const playPreRollAndStart = useCallback(() => {
        const player = mediaType === 'audio' ? wavesurferInstance : videoRef.current;
        if (!player || !metronome.current) return;
        
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
            if (mediaType === 'audio') {
                player.play();
            } else {
                player.play();
            }
        }, 4 * timePerBeat * 1000);

    }, [mediaType, wavesurferInstance, videoRef, bpm]);

    const handleRecord = useCallback(() => {
        const player = mediaType === 'audio' ? wavesurferInstance : videoRef.current;
        if (isRecording) {
            setIsRecording(false);
            if (isPlaying) {
                if (player) {
                    mediaType === 'audio' ? player.pause() : player.pause();
                }
                setIsPlaying(false);
            }
        } else {
            playPreRollAndStart();
        }
    }, [isRecording, isPlaying, mediaType, wavesurferInstance, videoRef, playPreRollAndStart]);

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
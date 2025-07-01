import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useMedia } from '../context/MediaContext';
import { usePlayback } from '../context/PlaybackContext';
import { useUIState } from '../context/UIStateContext';
import './WaveformNavigator.css';

const WaveformNavigator = () => {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const { mediaUrl, duration, firstBeatOffset } = useMedia();
    const { isPlaying, bpm, currentBeat, setCurrentBeat } = usePlayback();
    const { selectedBar, setSelectedBar } = useUIState();

    // Memoize the WaveSurfer options to prevent re-creation
    const wavesurferOptions = useMemo(() => ({
        waveColor: 'rgba(128, 128, 128, 0.5)',
        progressColor: 'rgba(0, 255, 170, 0.9)',
        barWidth: 3,
        barGap: 2,
        barRadius: 2,
        height: 80,
        cursorWidth: 2,
        cursorColor: '#fff',
    }), []);

    // Encapsulate the seeking logic in a useCallback hook for optimization
    const seekToTime = useCallback((time) => {
        const stepDuration = (60 / bpm) / 4;
        if (stepDuration <= 0) return;

        // Adjust the seeked time by the first beat offset to align with the musical grid
        const relativeTime = Math.max(0, time - firstBeatOffset);
        const totalStep = Math.floor(relativeTime / stepDuration);
        
        const bar = Math.floor(totalStep / 16) + 1;
        const beatInBar = totalStep % 16;
        
        console.log(`[WaveformNav] Seeking to time ${time.toFixed(2)}s -> Bar ${bar}, Beat ${beatInBar}`);
        setSelectedBar(bar);
        setCurrentBeat(beatInBar);
    }, [bpm, firstBeatOffset, setSelectedBar, setCurrentBeat]);


    // Effect for initializing and destroying the WaveSurfer instance
    useEffect(() => {
        if (!waveformRef.current || !mediaUrl) return;

        const wavesurfer = WaveSurfer.create({
            ...wavesurferOptions,
            container: waveformRef.current,
            url: mediaUrl,
        });
        wavesurferRef.current = wavesurfer;

        // Attach event listeners for user interaction
        wavesurfer.on('interaction', seekToTime);
        wavesurfer.on('drag', seekToTime); // Add 'drag' handler for scrubbing

        // Cleanup function to destroy the instance
        return () => {
            wavesurfer.un('interaction', seekToTime);
            wavesurfer.un('drag', seekToTime);
            wavesurfer.destroy();
        };
    }, [mediaUrl, wavesurferOptions, seekToTime]);


    // Effect for syncing the WaveSurfer playhead with the application's master clock
    useEffect(() => {
        const wavesurfer = wavesurferRef.current;
        if (!wavesurfer || !duration) return;

        if (isPlaying && !wavesurfer.isPlaying()) {
            wavesurfer.play();
        } else if (!isPlaying && wavesurfer.isPlaying()) {
            wavesurfer.pause();
        }

        const stepDuration = (60 / bpm) / 4;
        // Calculate the target time based on the grid, including the offset
        const targetTime = firstBeatOffset + (((selectedBar - 1) * 16 + currentBeat) * stepDuration);
        
        // Only seek the waveform if the difference is significant, to prevent visual stuttering
        if (Math.abs(wavesurfer.getCurrentTime() - targetTime) > stepDuration) {
             wavesurfer.seekTo(targetTime / duration);
        }
    }, [isPlaying, currentBeat, selectedBar, bpm, duration, firstBeatOffset]);

    return (
        <div className="waveform-navigator-container">
            {mediaUrl ? (
                <div ref={waveformRef} className="waveform-element"></div>
            ) : (
                <div className="waveform-placeholder">
                    <span>LOAD MEDIA TO BEGIN</span>
                </div>
            )}
        </div>
    );
};

export default WaveformNavigator;
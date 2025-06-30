import { useState, useRef, useCallback } from 'react';

const MAX_TAP_INTERVAL_MS = 3000; // Ignore taps that are too far apart

export const useTapTempo = (onTempoChange) => {
    const taps = useRef([]);

    const tap = useCallback(() => {
        const now = Date.now();

        // If last tap was too long ago, reset
        if (taps.current.length > 0 && now - taps.current[taps.current.length - 1] > MAX_TAP_INTERVAL_MS) {
            taps.current = [];
        }

        taps.current.push(now);

        // Keep only the last 4 taps for a rolling average
        if (taps.current.length > 4) {
            taps.current.shift();
        }

        if (taps.current.length > 1) {
            const intervals = [];
            for (let i = 1; i < taps.current.length; i++) {
                intervals.push(taps.current[i] - taps.current[i - 1]);
            }
            
            const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const bpm = Math.round(60000 / averageInterval);

            if (bpm > 40 && bpm < 300) { // Only update with reasonable values
                onTempoChange(bpm);
            }
        }
    }, [onTempoChange]);

    return { tap };
};
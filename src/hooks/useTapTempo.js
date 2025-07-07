// src/hooks/useTapTempo.js

import { useRef, useCallback } from 'react';

const MAX_TAP_INTERVAL_MS = 2000; // Taps more than 2 seconds apart reset the calculation.

export const useTapTempo = (onBpmChange) => {
    const lastTapTimeRef = useRef(null);
    const intervalsRef = useRef([]);

    const tap = useCallback(() => {
        const now = Date.now();
        const lastTap = lastTapTimeRef.current;

        if (lastTap && (now - lastTap) < MAX_TAP_INTERVAL_MS) {
            const interval = now - lastTap;
            intervalsRef.current.push(interval);
            // Keep a rolling average of the last 4 taps for accuracy
            if (intervalsRef.current.length > 4) {
                intervalsRef.current.shift();
            }
        } else {
            // If the tap is the first one or too old, reset the history.
            intervalsRef.current = [];
        }

        if (intervalsRef.current.length > 1) {
            const avgInterval = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length;
            if (avgInterval > 0) {
                const newBpm = Math.round(60000 / avgInterval);
                onBpmChange(newBpm);
            }
        }
        
        lastTapTimeRef.current = now;
    }, [onBpmChange]);

    return { tap };
};
// src/hooks/useTapTempo.js
import { useRef, useCallback } from 'react';

const MAX_TAP_INTERVAL = 2000; // 2 seconds

export const useTapTempo = (onBpmChange) => {
    const lastTapTimeRef = useRef(null);
    const intervalsRef = useRef([]);

    const tap = useCallback(() => {
        const now = Date.now();

        if (lastTapTimeRef.current && (now - lastTapTimeRef.current) < MAX_TAP_INTERVAL) {
            const interval = now - lastTapTimeRef.current;
            intervalsRef.current.push(interval);
            
            // Keep only the last 4 intervals for a rolling average
            if (intervalsRef.current.length > 4) {
                intervalsRef.current.shift();
            }

            const avgInterval = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length;
            const newBpm = 60000 / avgInterval;
            
            if (onBpmChange && !isNaN(newBpm)) {
                onBpmChange(Math.round(newBpm));
            }
        } else {
            // If it's the first tap or the last tap was too long ago, reset.
            intervalsRef.current = [];
        }

        lastTapTimeRef.current = now;
    }, [onBpmChange]);

    return { tap };
};
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
            
            if (intervalsRef.current.length > 4) {
                intervalsRef.current.shift();
            }

            const avgInterval = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length;
            const newBpm = 60000 / avgInterval;
            
            if (onBpmChange && !isNaN(newBpm)) {
                onBpmChange(Math.round(newBpm));
            }
        } else {
            intervalsRef.current = [];
        }

        lastTapTimeRef.current = now;
    }, [onBpmChange]);

    return { tap };
};
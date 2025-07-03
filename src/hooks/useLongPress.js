import { useCallback, useRef } from 'react';

export const useLongPress = (
    onClick,
    onLongPress,
    { ms = 300 } = {}
) => {
    const timerRef = useRef();
    const isLongPressSent = useRef(false);

    const start = useCallback((event) => {
        isLongPressSent.current = false;
        timerRef.current = setTimeout(() => {
            onLongPress(event);
            isLongPressSent.current = true;
        }, ms);
    }, [onLongPress, ms]);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);
    
    const handleMouseUp = useCallback(() => {
        if (!isLongPressSent.current) {
            onClick();
        }
        clear();
    }, [onClick, clear]);

    const handleMouseDown = useCallback((event) => {
        console.log('[useLongPress] Mouse Down, starting timer...');
        start(event);
    }, [start]);
    
    const handleMouseLeave = useCallback(() => {
        console.log('[useLongPress] Mouse Leave, clearing timer.');
        clear();
    }, [clear]);

    return {
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseLeave,
    };
};
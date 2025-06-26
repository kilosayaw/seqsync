import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useUIState } from './UIStateContext'; // This context depends on UIState

const MediaContext = createContext(null);

export const MediaProvider = ({ children }) => {
    const [mediaStream, setMediaStream] = useState(null);
    const videoRef = useRef(null);

    // This is why this context needs UIStateProvider: to know when the camera should be active.
    const { isLiveCamActive } = useUIState();

    // This effect handles the camera activation and deactivation.
    useEffect(() => {
        const activateCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
                setMediaStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(e => console.error("Video play failed:", e));
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        const stopCamera = () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setMediaStream(null);
        };

        if (isLiveCamActive) {
            activateCamera();
        } else {
            stopCamera();
        }

        // Cleanup function to ensure the camera is turned off when the component unmounts
        return () => {
            stopCamera();
        };
    }, [isLiveCamActive]);

    const value = {
        videoRef,
        mediaStream,
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (!context) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
};
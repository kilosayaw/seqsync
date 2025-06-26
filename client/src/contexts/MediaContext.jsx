// /client/src/contexts/MediaContext.jsx
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useUIState } from './UIStateContext.jsx';

const MediaContext = createContext(null);

export const MediaProvider = ({ children }) => {
    const [mediaStream, setMediaStream] = useState(null);
    const videoRef = useRef(null);
    const { isLiveCamActive } = useUIState();

    useEffect(() => {
        let stream;
        const activateCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
                setMediaStream(stream);
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        if (isLiveCamActive) {
            activateCamera();
        }

        // Cleanup function: this runs when the component unmounts OR when isLiveCamActive changes from true to false.
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setMediaStream(null);
            }
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
    if (!context) throw new Error('useMedia must be used within a MediaProvider');
    return context;
};
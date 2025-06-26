import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const MediaContext = createContext();

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [mediaStream, setMediaStream] = useState(null);
    const videoRef = useRef(null);

    const startCamera = useCallback(async () => {
        if (mediaStream) return; // Already running
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 360 } },
                audio: false
            });
            setMediaStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            toast.info('Live camera activated.');
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error('Could not access camera. Please check permissions.');
            // IMPORTANT: If we fail, we should ensure the calling component knows to reset the toggle state.
            // This will be handled in the Sequencer's useEffect.
            throw err; 
        }
    }, [mediaStream]);

    const stopCamera = useCallback(() => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            toast.info('Live camera deactivated.');
        }
    }, [mediaStream]);

    const value = {
        videoRef,
        mediaStream,
        startCamera,
        stopCamera,
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};
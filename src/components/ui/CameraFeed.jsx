import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useMotion } from '../../context/MotionContext';
import './CameraFeed.css';

// DEFINITIVE FIX: Use forwardRef to pass the ref from MediaDisplay to the <video> element
const CameraFeed = forwardRef((props, ref) => {
    const internalVideoRef = useRef(null);
    // This hook allows the parent's ref to point to our internal video element
    useImperativeHandle(ref, () => internalVideoRef.current);

    const { videoStream, startCamera, stopCamera } = useMotion(); // Assuming MotionContext provides these

    useEffect(() => {
        startCamera(); // Tell the context to start the camera stream
        return () => {
            stopCamera(); // Tell the context to stop the camera on unmount
        };
    }, [startCamera, stopCamera]);

    useEffect(() => {
        if (videoStream && internalVideoRef.current) {
            internalVideoRef.current.srcObject = videoStream;
        }
    }, [videoStream]);

    return (
        <video 
            ref={internalVideoRef} 
            className="camera-feed-video" 
            autoPlay 
            playsInline 
            muted
        />
    );
});

export default CameraFeed;
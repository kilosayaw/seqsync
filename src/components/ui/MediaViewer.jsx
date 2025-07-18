import React, { useRef, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext.jsx';
import { FaArrowAltCircleUp } from 'react-icons/fa';
import classNames from 'classnames';
import VideoTimeline from './VideoTimeline.jsx'; // Import our new component
import './MediaViewer.css';

const MediaViewer = () => {
    const { 
        waveformContainerRef, loadMedia, isMediaReady, setIsMediaReady,
        mediaType, mediaSource, videoRef, setDuration
    } = useMedia();
    const fileInputRef = useRef(null);

    const handleContainerClick = () => {
        if (isMediaReady) return;
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) loadMedia(file);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (mediaType === 'video' && video) {
            const handleLoadedData = () => {
                setDuration(video.duration);
                setIsMediaReady(true);
            };
            video.addEventListener('loadeddata', handleLoadedData);
            return () => video.removeEventListener('loadeddata', handleLoadedData);
        }
    }, [mediaType, videoRef, setDuration, setIsMediaReady]);

    const promptClasses = classNames('upload-prompt', { 'hidden': isMediaReady });

    return (
        <div className="media-viewer-container" onClick={handleContainerClick}>
            
            {/* --- DEFINITIVE FIX: Conditional Rendering --- */}
            {/* It now decides which visualizer to show based on mediaType */}
            
            {mediaType === 'audio' && <div ref={waveformContainerRef} className="waveform" />}
            
            {mediaType === 'video' && <VideoTimeline />}

            {/* The video element is now only for playback, it's not visible in the timeline area */}
            {mediaSource && mediaType === 'video' && (
                <video 
                    ref={videoRef} 
                    src={mediaSource} 
                    style={{ display: 'none' }} // The video player itself is hidden
                />
            )}
            {/* --- END OF FIX --- */}
            
            <div className={promptClasses}>
                <FaArrowAltCircleUp />
                <span>Upload Media</span>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="audio/*,video/*"
            />
        </div>
    );
};
export default MediaViewer;
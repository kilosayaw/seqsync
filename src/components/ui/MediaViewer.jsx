import React, { useRef, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext.jsx';
import { FaArrowAltCircleUp } from 'react-icons/fa';
import classNames from 'classnames';
import VideoTimeline from './VideoTimeline.jsx';
import './MediaViewer.css';

const MediaViewer = () => {
    const { 
        waveformContainerRef, loadMedia, isMediaReady, setIsMediaReady,
        mediaType, mediaSource, videoRef, setDuration, setIsLoading,
        extractVideoThumbnails, setVideoThumbnails
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
            const handleLoadedData = async () => {
                console.log("[MediaViewer] Video metadata loaded. Updating state.");
                setDuration(video.duration);
                setIsMediaReady(true);
                
                // Now that the video is ready, extract thumbnails
                try {
                    const thumbs = await extractVideoThumbnails(video);
                    setVideoThumbnails(thumbs);
                    console.log("[MediaViewer] ✅ Thumbnail extraction complete.");
                } catch(err) {
                    console.error("[MediaViewer] ❌ Thumbnail extraction failed:", err);
                } finally {
                    setIsLoading(false); // Turn off the "Processing..." overlay
                }
            };

            video.addEventListener('loadedmetadata', handleLoadedData);
            return () => video.removeEventListener('loadedmetadata', handleLoadedData);
        }
    }, [mediaType, videoRef, setDuration, setIsMediaReady, setIsLoading, extractVideoThumbnails, setVideoThumbnails]);

    const promptClasses = classNames('upload-prompt', { 'hidden': isMediaReady });

    return (
        <div className="media-viewer-container" onClick={handleContainerClick}>
            
            {mediaType === 'audio' && <div ref={waveformContainerRef} className="waveform" />}
            {mediaType === 'video' && <VideoTimeline />}
            
            {mediaSource && mediaType === 'video' && (
                <video 
                    ref={videoRef} 
                    src={mediaSource} 
                    style={{ display: 'none' }}
                />
            )}
            
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
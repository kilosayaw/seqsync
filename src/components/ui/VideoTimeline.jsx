import React from 'react';
import { useMedia } from '../../context/MediaContext.jsx';
import { usePlayback } from '../../context/PlaybackContext.jsx';
import './VideoTimeline.css';

const VideoTimeline = () => {
    const { videoThumbnails, duration } = useMedia();
    const { currentTime, seekToTime } = usePlayback();

    if (!videoThumbnails || videoThumbnails.length === 0) {
        return <div className="video-timeline-container empty">Processing Video...</div>;
    }

    const handleTimelineClick = (e) => {
        const timeline = e.currentTarget;
        const rect = timeline.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickRatio = clickX / rect.width;
        const seekTime = duration * clickRatio;
        seekToTime(seekTime);
    };

    const playheadPosition = duration > 0 ? `${(currentTime / duration) * 100}%` : '0%';

    return (
        <div className="video-timeline-container" onClick={handleTimelineClick}>
            <div className="thumbnails-track">
                {videoThumbnails.map((thumbDataUrl, index) => (
                    <img 
                        key={index}
                        src={thumbDataUrl}
                        alt={`frame ${index + 1}`}
                        className="timeline-thumbnail"
                    />
                ))}
            </div>
            <div className="playhead" style={{ left: playheadPosition }} />
        </div>
    );
};

export default VideoTimeline;
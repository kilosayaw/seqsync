// src/components/core/media/MotionTrackingOverlay.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faTimes } from '@fortawesome/free-solid-svg-icons'; // Changed faTrashAlt to faTimes for consistency
import Tooltip from '../../common/Tooltip';

const MotionTrackingOverlay = ({
  mediaInteractionRef,
  isPlaying,
  currentTime,
  duration,
  onMarkKeyframe, 
  currentKeyframes = [], 
  onDeleteKeyframe, 
  logToConsole,
}) => {
  const overlayRef = useRef(null);
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });
  const [hoveredKeyframeTime, setHoveredKeyframeTime] = useState(null);

  useEffect(() => {
    const mediaEl = mediaInteractionRef.current;
    if (!mediaEl || !overlayRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setOverlayDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    resizeObserver.observe(mediaEl);
    setOverlayDimensions({ width: mediaEl.offsetWidth, height: mediaEl.offsetHeight });
    return () => resizeObserver.unobserve(mediaEl);
  }, [mediaInteractionRef]);

  const handleOverlayClick = useCallback((event) => {
    if (!mediaInteractionRef.current || !onMarkKeyframe || duration <= 0) return;
    if (event.target.closest('.keyframe-marker-button')) return; // Prevent if clicking on marker UI
    
    const rect = overlayRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / overlayDimensions.width)); // Clamp ratio
    const clickedTime = clickRatio * duration;

    logToConsole?.(`[MotionOverlay] Overlay clicked. Time: ${clickedTime.toFixed(3)}s`);
    onMarkKeyframe(clickedTime, {});
  }, [mediaInteractionRef, onMarkKeyframe, duration, overlayDimensions.width, logToConsole]);

  const handleKeyframeDeleteClick = useCallback((e, kfTime) => {
    e.stopPropagation();
    if (onDeleteKeyframe) {
      logToConsole?.(`[MotionOverlay] Delete keyframe initiated for time: ${kfTime.toFixed(3)}s`);
      onDeleteKeyframe(kfTime);
    }
  }, [onDeleteKeyframe, logToConsole]);

  if (!overlayDimensions.width || !overlayDimensions.height || duration <= 0) {
    return <div className="absolute inset-0 pointer-events-none" />;
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 cursor-crosshair"
      style={{ width: overlayDimensions.width, height: overlayDimensions.height }}
      onClick={handleOverlayClick}
    >
      {/* Current Time Playhead in SYNC mode */}
      {(isPlaying || currentTime > 0) && ( // Show if playing or if paused but not at 0
        <div
          className="absolute top-0 h-full w-0.5 bg-red-500/80 pointer-events-none z-20 shadow-lg"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          title={`Current Time: ${currentTime.toFixed(2)}s`}
        />
      )}

      {currentKeyframes.map((kfTime) => {
        const percentLeft = (kfTime / duration) * 100;
        const isHovered = hoveredKeyframeTime === kfTime;
        return (
          <div
            key={`kf-${kfTime.toFixed(3)}`} // More unique key
            className={`absolute top-0 h-full flex flex-col items-center pointer-events-none z-10
                        transition-transform duration-100`}
            style={{ left: `${percentLeft}%`, transform: `translateX(-50%) ${isHovered ? 'scale(1.2)' : 'scale(1)'}` }}
            onMouseEnter={() => setHoveredKeyframeTime(kfTime)}
            onMouseLeave={() => setHoveredKeyframeTime(null)}
          >
            <Tooltip content={`Keyframe @ ${kfTime.toFixed(2)}s ${onDeleteKeyframe ? '(Click X to delete)' : ''}`} placement="top">
                <FontAwesomeIcon 
                    icon={faMapMarkerAlt} 
                    className={`text-base sm:text-lg pointer-events-auto cursor-pointer ${isHovered ? 'text-yellow-400' : 'text-green-400/80'}`} 
                    onClick={(e) => e.stopPropagation()} // Allow clicking the marker itself without triggering overlay click
                />
            </Tooltip>
            {isHovered && onDeleteKeyframe && (
              <button
                type="button"
                onClick={(e) => handleKeyframeDeleteClick(e, kfTime)}
                className="keyframe-marker-button absolute -bottom-3 w-4 h-4 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xxs shadow-md pointer-events-auto cursor-pointer"
                aria-label={`Delete keyframe at ${kfTime.toFixed(2)}s`}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

MotionTrackingOverlay.propTypes = {
  mediaInteractionRef: PropTypes.shape({ current: PropTypes.instanceOf(HTMLMediaElement) }),
  isPlaying: PropTypes.bool,
  currentTime: PropTypes.number,
  duration: PropTypes.number,
  onMarkKeyframe: PropTypes.func.isRequired,
  currentKeyframes: PropTypes.arrayOf(PropTypes.number),
  onDeleteKeyframe: PropTypes.func,
  logToConsole: PropTypes.func,
};

export default MotionTrackingOverlay;
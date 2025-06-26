// src/components/core/pose_editor/FootJoystickOverlay.jsx
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'; // Added useEffect
import PropTypes from 'prop-types';
// Assuming getZoneFromCoordinates and joystick maps are now correctly in constants.js
import { 
    LEFT_FOOT_JOYSTICK_MAP, 
    RIGHT_FOOT_JOYSTICK_MAP, 
    JOYSTICK_ZONES_ANGLES, // Keep if getZoneFromCoordinates is also here
    getZoneFromCoordinates // Import this utility
} from '../../../utils/constants';

const FootJoystickOverlay = ({
  side,
  onGroundingChange,
  // size prop removed as it was unused
  isActive = true,
  logToConsoleFromParent // Added this prop based on previous batches
}) => {
  const overlayRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentActiveZoneForDebug, setCurrentActiveZoneForDebug] = useState(null);

  const joystickMap = useMemo(() =>
    side === 'L' ? LEFT_FOOT_JOYSTICK_MAP : RIGHT_FOOT_JOYSTICK_MAP,
  [side]);

  // Removed local getZoneFromCoordinates as it's imported

  const handleInteractionStart = useCallback((e) => {
    if (!isActive) return;
    if (e.type === 'touchstart' && overlayRef.current && overlayRef.current.contains(e.target)) {
      e.preventDefault();
    }
    setIsDragging(true);

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // Use imported getZoneFromCoordinates
    const zone = getZoneFromCoordinates(x, y, rect.width / 2, rect.height / 2, rect.width / 2);

    if (zone && joystickMap[zone]) {
      onGroundingChange(side, joystickMap[zone].points);
      setCurrentActiveZoneForDebug(zone);
      logToConsoleFromParent?.(`[Joystick-${side}] Start/Tap Zone: ${zone} -> Points: ${joystickMap[zone].points.join(',')}`);
    } else if (joystickMap.CENTER_TAP && (zone === 'CENTER_TAP' || !zone)) {
      onGroundingChange(side, joystickMap.CENTER_TAP.points);
      setCurrentActiveZoneForDebug('CENTER_TAP');
      logToConsoleFromParent?.(`[Joystick-${side}] Start/Tap Zone: CENTER_TAP -> Points: ${joystickMap.CENTER_TAP.points.join(',')}`);
    }
  }, [isActive, onGroundingChange, side, joystickMap, logToConsoleFromParent, getZoneFromCoordinates]); // Added getZoneFromCoordinates to deps

  const updateZoneOnMove = useCallback((e) => {
    if (!overlayRef.current || !isActive) return;
    const rect = overlayRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX; clientY = e.clientY;
    }
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // Use imported getZoneFromCoordinates
    const zone = getZoneFromCoordinates(x, y, rect.width / 2, rect.height / 2, rect.width / 2);

    setCurrentActiveZoneForDebug(prevDebugZone => {
      if (zone && zone !== prevDebugZone) {
        if (joystickMap[zone]) {
          onGroundingChange(side, joystickMap[zone].points);
          logToConsoleFromParent?.(`[Joystick-${side}] Move Zone: ${zone} -> Points: ${joystickMap[zone].points.join(',')}`);
        }
        return zone;
      } else if (!zone && prevDebugZone !== 'CENTER_TAP' && joystickMap.CENTER_TAP) {
          onGroundingChange(side, joystickMap.CENTER_TAP.points);
          logToConsoleFromParent?.(`[Joystick-${side}] Move Out -> Snapped to CENTER_TAP`);
          return 'CENTER_TAP';
      }
      return prevDebugZone;
    });
  }, [isActive, onGroundingChange, side, joystickMap, logToConsoleFromParent, getZoneFromCoordinates]); // Added getZoneFromCoordinates to deps

  const handleInteractionMove = useCallback((e) => {
    if (!isDragging || !isActive) return;
    if (e.type === 'touchmove' && e.cancelable) e.preventDefault();
    updateZoneOnMove(e);
  }, [isDragging, isActive, updateZoneOnMove]);

  const handleInteractionEnd = useCallback(() => {
    if (!isActive) return;
    setIsDragging(false);
    logToConsoleFromParent?.(`[Joystick-${side}] Interaction End. Last active zone: ${currentActiveZoneForDebug || 'None'}`);
  }, [isActive, currentActiveZoneForDebug, logToConsoleFromParent]);

  useEffect(() => {
    const currentOverlayRef = overlayRef.current;
    if (isDragging) {
      window.addEventListener('mousemove', handleInteractionMove);
      window.addEventListener('mouseup', handleInteractionEnd);
      currentOverlayRef?.addEventListener('touchmove', handleInteractionMove, { passive: false });
      window.addEventListener('touchend', handleInteractionEnd);
      window.addEventListener('touchcancel', handleInteractionEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleInteractionMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      currentOverlayRef?.removeEventListener('touchmove', handleInteractionMove);
      window.removeEventListener('touchend', handleInteractionEnd);
      window.removeEventListener('touchcancel', handleInteractionEnd);
    };
  }, [isDragging, handleInteractionMove, handleInteractionEnd]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-full bg-transparent hover:bg-gray-500/10 transition-colors touch-none"
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      role="slider"
      aria-label={`${side} foot grounding joystick`}
      aria-valuetext={currentActiveZoneForDebug && joystickMap[currentActiveZoneForDebug] ? joystickMap[currentActiveZoneForDebug].label : "Joystick neutral"}
    >
      {/* Visual feedback for active zone (optional for debugging) */}
      {/* {currentActiveZoneForDebug && joystickMap[currentActiveZoneForDebug] && (
        <div className="absolute top-0 left-0 bg-black/70 text-white text-xs p-1 rounded pointer-events-none">
          {side}: {joystickMap[currentActiveZoneForDebug].label}
        </div>
      )} */}
    </div>
  );
};

FootJoystickOverlay.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  onGroundingChange: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  logToConsoleFromParent: PropTypes.func,
  // size prop removed from propTypes as it's not used
};

FootJoystickOverlay.defaultProps = {
  isActive: true,
};

export default FootJoystickOverlay;
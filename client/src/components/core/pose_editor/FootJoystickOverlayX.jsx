// src/components/core/pose_editor/FootJoystickOverlay.jsx
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'; // Ensured useMemo is here
import PropTypes from 'prop-types';
import { 
    LEFT_FOOT_JOYSTICK_MAP, 
    RIGHT_FOOT_JOYSTICK_MAP,
    getZoneFromCoordinates,
    HARD_CLICK_RADIUS_PERCENT // For detecting hard click intent
} from '../../../utils/constants';

const JOYSTICK_DRAG_THRESHOLD_PX = 5; // Pixels of movement to be considered a drag vs a tap
const HARD_CLICK_TIME_THRESHOLD_MS = 200; // Max time for a mousedown/up to be a "hard click"

// This is around line 13-14
const FootJoystickOverlay = ({
  side,
  onGroundingChange,
  isActive = true,
  logToConsoleFromParent,
}) => {
  const overlayRef = useRef(null); // This could be line 14 or 15 depending on exact formatting
  const [isDragging, setIsDragging] = useState(false);
  const [interactionStart, setInteractionStart] = useState({ x: 0, y: 0, time: 0 });

  // This useMemo is critical and was likely the point of error if line 14 was near it
  const joystickMap = useMemo(() => 
    side === 'L' ? LEFT_FOOT_JOYSTICK_MAP : RIGHT_FOOT_JOYSTICK_MAP,
  [side]);

  const processNewZone = useCallback((zoneName, isHardClickIntent = false) => {
    let pointsToApply = null;
    // let labelForLog = "Unknown Zone"; // Not strictly needed if just logging points

    let effectiveZoneName = zoneName;
    if (isHardClickIntent && zoneName === 'CENTER_TAP') { 
        effectiveZoneName = 'CENTER_FULL_PLANT';
    }
    
    const zoneData = joystickMap[effectiveZoneName];

    if (zoneData) {
        pointsToApply = zoneData.points; 
        // labelForLog = zoneData.label;
    } else if (effectiveZoneName === null && joystickMap.CENTER_TAP) { 
        pointsToApply = joystickMap.CENTER_TAP.points; // Should be null for lift
        // labelForLog = joystickMap.CENTER_TAP.label + " (Drag Release)";
    }
    
    const pointsToLog = Array.isArray(pointsToApply) ? pointsToApply.join(',') : (pointsToApply === null ? 'LIFT' : 'NO_CHANGE');
    logToConsoleFromParent?.(`[Joystick-${side}] Zone: ${effectiveZoneName || 'OUTSIDE'} -> Points: ${pointsToLog}`);
    
    onGroundingChange(side, pointsToApply);

  }, [joystickMap, side, onGroundingChange, logToConsoleFromParent]);


  const handlePointerDown = useCallback((e) => {
    if (!isActive || !overlayRef.current) return;
    if (e.type === 'touchstart' && e.cancelable) e.preventDefault(); 
    
    const rect = overlayRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

    if (clientX === undefined || clientY === undefined) return; // Safety check

    logToConsoleFromParent?.(`[Joystick-${side}] PointerDown`, { clientX, clientY, type: e.type });

    setInteractionStart({ x: clientX, y: clientY, time: Date.now() });
    setIsDragging(true); // This will trigger the useEffect to add global listeners

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const zone = getZoneFromCoordinates(x, y, rect.width / 2, rect.height / 2, rect.width / 2, false);
    processNewZone(zone, false); // explicit false for isHardClickIntent

  }, [isActive, processNewZone, logToConsoleFromParent, side]); // Added side for logging consistency

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !isActive || !overlayRef.current) return;
    if (e.type === 'touchmove' && e.cancelable) e.preventDefault();

    const rect = overlayRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return;

    const dx = clientX - interactionStart.x;
    const dy = clientY - interactionStart.y;
    if (Math.sqrt(dx*dx + dy*dy) <= JOYSTICK_DRAG_THRESHOLD_PX && (Date.now() - interactionStart.time < HARD_CLICK_TIME_THRESHOLD_MS)) {
        return;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const zone = getZoneFromCoordinates(x, y, rect.width / 2, rect.height / 2, rect.width / 2, false);
    processNewZone(zone, false); // explicit false

  }, [isDragging, isActive, interactionStart, processNewZone]);

  const handlePointerUp = useCallback((e) => {
    if (!isActive) {
      // If not active, but dragging was true, ensure we reset isDragging
      if (isDragging) setIsDragging(false);
      return;
    }
    
    const upTime = Date.now();
    // Pointerup/touchend might not have clientX/Y on the event 'e' itself for all scenarios,
    // use changedTouches for touch, or rely on interactionStart if clientX/Y are undefined.
    // However, for calculating distMoved, we need the final position.
    let finalClientX, finalClientY;
    if (e.type === 'touchend' || e.type === 'touchcancel') {
        finalClientX = e.changedTouches && e.changedTouches[0]?.clientX;
        finalClientY = e.changedTouches && e.changedTouches[0]?.clientY;
    } else { // mouseup, pointerup
        finalClientX = e.clientX;
        finalClientY = e.clientY;
    }

    // Fallback if final positions are not available (should be rare)
    if (finalClientX === undefined || finalClientY === undefined) {
        finalClientX = interactionStart.x; // Less accurate, but prevents crash
        finalClientY = interactionStart.y;
    }
    
    const duration = upTime - interactionStart.time;
    const dx = finalClientX - interactionStart.x;
    const dy = finalClientY - interactionStart.y;
    const distMoved = Math.sqrt(dx*dx + dy*dy);

    logToConsoleFromParent?.(`[Joystick-${side}] PointerUp`, { duration, distMoved, finalClientX, finalClientY });

    if (overlayRef.current && distMoved < JOYSTICK_DRAG_THRESHOLD_PX && duration < HARD_CLICK_TIME_THRESHOLD_MS) {
      const rect = overlayRef.current.getBoundingClientRect();
      const x = finalClientX - rect.left;
      const y = finalClientY - rect.top;
      const distFromCenter = Math.sqrt(Math.pow(x - rect.width/2, 2) + Math.pow(y - rect.height/2, 2));
      
      if (distFromCenter < (rect.width/2) * HARD_CLICK_RADIUS_PERCENT) {
        logToConsoleFromParent?.(`[Joystick-${side}] PointerUp - Hard Click Detected`);
        processNewZone('CENTER_TAP', true); // Pass original CENTER_TAP, processNewZone handles promoting to FULL_PLANT
      } else {
        logToConsoleFromParent?.(`[Joystick-${side}] PointerUp - Regular Tap Detected`);
        const zone = getZoneFromCoordinates(x, y, rect.width/2, rect.height/2, rect.width/2, false);
        processNewZone(zone, false);
      }
    } else {
        logToConsoleFromParent?.(`[Joystick-${side}] PointerUp - Drag Release`);
        // For drag release, if the final point is outside a zone, it should reset.
        // getZoneFromCoordinates will return null if outside.
        // processNewZone(null) will then correctly map to CENTER_TAP (lift).
        const rect = overlayRef.current.getBoundingClientRect();
        const x = finalClientX - rect.left;
        const y = finalClientY - rect.top;
        const zoneOnRelease = getZoneFromCoordinates(x, y, rect.width/2, rect.height/2, rect.width/2, false);
        processNewZone(zoneOnRelease, false);
    }

    setIsDragging(false); // This will trigger useEffect to remove global listeners
  }, [isActive, isDragging, interactionStart, processNewZone, logToConsoleFromParent, side]);

  useEffect(() => {
    // const currentOverlay = overlayRef.current; // Not needed since using window
    if (isDragging) {
      logToConsoleFromParent?.(`[Joystick-${side}] Effect: Adding global move/up listeners.`);
      window.addEventListener('pointermove', handlePointerMove, { passive: false }); // passive false for touchmove
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    } else {
      logToConsoleFromParent?.(`[Joystick-${side}] Effect: Removing global move/up listeners.`);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    }
    return () => { // Cleanup on unmount OR when isDragging changes BEFORE next effect run
      logToConsoleFromParent?.(`[Joystick-${side}] Effect Cleanup: Removing global move/up listeners.`);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp, logToConsoleFromParent, side]); // Added side for logging

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-full bg-transparent hover:bg-gray-500/10 transition-colors touch-none select-none"
      onPointerDown={handlePointerDown} // This handles both mouse and touch
      role="button"
      tabIndex={isActive ? 0 : -1} // Make it focusable if active
      aria-label={`${side} foot grounding joystick`}
    />
  );
};

FootJoystickOverlay.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  onGroundingChange: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  logToConsoleFromParent: PropTypes.func,
};

export default React.memo(FootJoystickOverlay);
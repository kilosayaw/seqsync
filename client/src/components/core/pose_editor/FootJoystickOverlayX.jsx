import React, { useRef, useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FOOT_CONTACT_ZONES } from '../../../utils/constants';

const logDebug = (level, ...args) => console[level] ? console[level](...args) : console.log(...args);

const FootJoystickOverlay = ({ side, onGroundingChange, isActive }) => {
  const overlayRef = useRef(null);
  const [activeZone, setActiveZone] = useState(null);

  const contactZones = useMemo(() => FOOT_CONTACT_ZONES[side], [side]);

  const getZoneFromPosition = useCallback((x, y) => {
    for (const zone of contactZones) {
      const dx = x - zone.cx;
      const dy = y - zone.cy;
      if (dx * dx + dy * dy < zone.radius * zone.radius) {
        return zone;
      }
    }
    return null;
  }, [contactZones]);

  const handlePointerMove = useCallback((e) => {
    if (!isActive || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const zone = getZoneFromPosition(x, y);
    if (zone) {
      if (!activeZone || activeZone.name !== zone.name) {
        setActiveZone(zone);
        onGroundingChange(side, zone.notation);
        logDebug('info', `[Joystick-${side}] Entered Zone: ${zone.name}, Notation:`, zone.notation);
      }
    } else if (activeZone) {
      setActiveZone(null);
      onGroundingChange(side, null);
      logDebug('info', `[Joystick-${side}] Exited all zones.`);
    }
  }, [isActive, onGroundingChange, side, getZoneFromPosition, activeZone]);

  const handlePointerLeave = useCallback(() => {
    if (activeZone) {
      setActiveZone(null);
      onGroundingChange(side, null);
      logDebug('info', `[Joystick-${side}] Pointer left, clearing active zone.`);
    }
  }, [isActive, onGroundingChange, side, activeZone]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 cursor-crosshair"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ touchAction: 'none' }}
    >
      {/* Optional: Render visual feedback for zones for debugging */}
      {/* 
      {contactZones.map(zone => (
        <div 
          key={zone.name}
          className={`absolute rounded-full border-2 transition-colors ${activeZone?.name === zone.name ? 'bg-pos-yellow/50 border-pos-yellow' : 'bg-transparent border-dashed border-gray-500/50'}`}
          style={{
            left: `${(zone.cx - zone.radius) * 100}%`,
            top: `${(zone.cy - zone.radius) * 100}%`,
            width: `${zone.radius * 2 * 100}%`,
            height: `${zone.radius * 2 * 100}%`,
          }}
        />
      ))}
      */}
    </div>
  );
};

FootJoystickOverlay.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  onGroundingChange: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
};

FootJoystickOverlay.defaultProps = {
  isActive: true,
};

export default FootJoystickOverlay;
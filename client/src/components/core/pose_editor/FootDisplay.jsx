import React, { useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { GROUNDING_POINT_COORDS, FOOT_JOYSTICK_ZONES } from '../../../utils/constants';

const FootDisplay = ({ side, groundPoints, rotation = 0, sizeClasses = "w-full", onRotate, onGroundingChange }) => {
  const isGrounded = useMemo(() => Array.isArray(groundPoints) && groundPoints.length > 0, [groundPoints]);
  const defaultImagePath = side === 'L' ? '/assets/ground/foot-left.png' : '/assets/ground/foot-right.png';
  const groundedImagePath = side === 'L' ? '/assets/ground/L123T12345.png' : '/assets/ground/R123T12345.png';
  const wheelImagePath = '/assets/ground/foot-wheel.png';
  const imageSrc = isGrounded ? groundedImagePath : defaultImagePath;

  const containerRef = useRef(null);
  const dragInfo = useRef({ mode: null, startAngle: 0, startRotation: 0 });

  const getZoneFromAngle = useCallback((angle) => {
    const zones = FOOT_JOYSTICK_ZONES[side];
    const firstZone = zones[0];
    if (angle >= firstZone.minAngle && angle <= 360) return firstZone;
    for (const zone of zones) {
      if (angle >= zone.minAngle && angle < zone.maxAngle) return zone;
    }
    return null;
  }, [side]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clickX = e.clientX - centerX;
    const clickY = e.clientY - centerY;
    const distance = Math.sqrt(clickX * clickX + clickY * clickY);
    const radius = rect.width / 2;
    
    const rotationZoneStartRadius = radius * 0.75;

    if (distance > rotationZoneStartRadius) {
      const angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
      dragInfo.current = { mode: 'rotate', startAngle: angle, startRotation: rotation };
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    } else {
      let angle = Math.atan2(-clickY, clickX) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      const zone = getZoneFromAngle(angle);
      onGroundingChange(side, zone ? zone.notation : null);
    }
  }, [rotation, onRotate, onGroundingChange, side, getZoneFromAngle]);

  const handlePointerMove = useCallback((e) => {
    if (dragInfo.current.mode !== 'rotate' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    const angleDelta = currentAngle - dragInfo.current.startAngle;
    let newRotation = dragInfo.current.startRotation + angleDelta;
    
    const BIOMECHANICAL_LIMIT = 45;
    newRotation = Math.max(-BIOMECHANICAL_LIMIT, Math.min(BIOMECHANICAL_LIMIT, newRotation));

    onRotate(side, newRotation);
  }, [onRotate, side]);

  const handlePointerUp = useCallback(() => {
    dragInfo.current.mode = null;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center bg-no-repeat bg-center bg-contain cursor-grab active:cursor-grabbing ${sizeClasses}`}
      style={{ backgroundImage: `url(${wheelImagePath})` }}
      onPointerDown={handlePointerDown}
    >
      <div className="absolute w-[60%] h-[60%]" style={{ transform: `rotate(${rotation}deg)` }}>
        <img src={imageSrc} alt={`${side} foot diagram`} className="w-full h-full object-contain pointer-events-none" />
        {Object.entries(GROUNDING_POINT_COORDS[side]).map(([pointKey, coords]) => (
          <div key={pointKey} className={`absolute w-3 h-3 rounded-full transition-all duration-200 border-2 ${isGrounded && groundPoints.includes(pointKey) ? 'bg-green-400 border-green-200' : 'bg-gray-600 border-gray-500 opacity-60'}`} style={{ left: `calc(${coords.x}% - 6px)`, top: `calc(${coords.y}% - 6px)`}} />
        ))}
      </div>
       <div className="absolute top-full mt-2 text-center pointer-events-none">
            <span className="text-lg font-bold text-white">{rotation.toFixed(0)}°</span>
            <span className="block text-xs text-gray-400">ROT</span>
        </div>
    </div>
  );
};

FootDisplay.propTypes = { side: PropTypes.oneOf(['L', 'R']).isRequired, groundPoints: PropTypes.arrayOf(PropTypes.string), rotation: PropTypes.number, sizeClasses: PropTypes.string, onRotate: PropTypes.func.isRequired, onGroundingChange: PropTypes.func.isRequired };
export default FootDisplay;
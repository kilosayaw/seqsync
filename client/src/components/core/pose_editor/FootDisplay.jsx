import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { WHEEL_IMAGE_PATH } from '../../../utils/constants';

const FootDisplay = ({ side, groundPoints, sizeClasses, rotation, onRotate }) => {
  const displayRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startAngleRef = useRef(0);
  const startRotationRef = useRef(0);

  const getAngle = useCallback((e) => {
    if (!displayRef.current) return 0;
    const rect = displayRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const currentAngle = getAngle(e);
    const angleDiff = currentAngle - startAngleRef.current;
    let newRotation = startRotationRef.current + angleDiff;
    onRotate(side, newRotation);
  }, [getAngle, onRotate, side]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = 'default';
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);
  
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startAngleRef.current = getAngle(e);
    startRotationRef.current = rotation;
    document.body.style.cursor = 'grabbing';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [getAngle, rotation, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={displayRef}
      className={`relative rounded-full cursor-grab select-none ${sizeClasses}`}
      onPointerDown={handlePointerDown}
      style={{
        backgroundImage: `url(${WHEEL_IMAGE_PATH})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        touchAction: 'none',
      }}
      data-testid={`foot-display-${side}`}
    >
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <img
          src={`/assets/ground/foot-${side === 'L' ? 'left' : 'right'}.png`}
          alt={`${side} foot`}
          className="w-1/2 h-1/2 pointer-events-none"
        />
      </div>
       {groundPoints && groundPoints.length > 0 && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"
            title={`Grounded: ${groundPoints.join(', ')}`}
          ></div>
        )}
    </div>
  );
};

FootDisplay.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  groundPoints: PropTypes.array,
  sizeClasses: PropTypes.string,
  rotation: PropTypes.number.isRequired,
  onRotate: PropTypes.func.isRequired,
};

export default FootDisplay;
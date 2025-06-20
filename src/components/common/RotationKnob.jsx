import React, { useRef, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const RotationKnob = ({
  size = 60,
  min = -45,
  max = 45,
  value = 0,
  onChange,
  label,
}) => {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleInteraction = useCallback((e) => {
    if (!knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    // We map a 270-degree arc (-135 to +135) to our min/max values
    const totalArc = 270;
    const startAngle = (360 - totalArc / 2) % 360; // e.g., 225
    const endAngle = totalArc / 2; // e.g., 135

    let constrainedAngle = angle;
    if (angle > endAngle && angle < startAngle) {
        // Snap to the nearest boundary if outside the arc
        constrainedAngle = Math.abs(angle - endAngle) < Math.abs(angle - startAngle) ? endAngle : startAngle;
    }

    let percent = 0;
    if (constrainedAngle >= startAngle) {
        percent = (constrainedAngle - startAngle) / totalArc;
    } else { // angle is between 0 and endAngle
        percent = (constrainedAngle + (360 - startAngle)) / totalArc;
    }
    
    const newValue = min + (max - min) * percent;
    onChange(Math.round(newValue));
    setDisplayValue(Math.round(newValue));

  }, [min, max, onChange]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleInteraction);
    document.addEventListener('touchend', handleMouseUp);
  }, [handleInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleInteraction);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleInteraction);
    document.removeEventListener('touchend', handleMouseUp);
  }, [handleInteraction]);
  
  const handleDoubleClick = useCallback(() => {
    onChange(0);
    setDisplayValue(0);
  }, [onChange]);

  const rotationDegrees = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-1" onDoubleClick={handleDoubleClick}>
      <div
        ref={knobRef}
        className="relative rounded-full bg-gray-700 shadow-inner cursor-pointer"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute inset-2 rounded-full bg-gray-800 flex items-center justify-center text-center">
            <span className="text-white text-xs font-semibold">{displayValue.toFixed(0)}°</span>
        </div>
        <div
          className="absolute top-1/2 left-1/2 w-1 h-1/2 -translate-x-1/2 -translate-y-full origin-bottom"
          style={{ transform: `translateX(-50%) translateY(-100%) rotate(${rotationDegrees}deg)` }}
        >
          <div className="w-full h-1/3 bg-pos-yellow rounded-full"></div>
        </div>
      </div>
      {label && <span className="text-xs text-gray-400 font-semibold uppercase">{label}</span>}
    </div>
  );
};

RotationKnob.propTypes = {
    size: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
};

export default RotationKnob;
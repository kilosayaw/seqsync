// src/components/common/RotationKnob.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from './Input'; // Correctly imported

const RotationKnob = ({
  value = 0, 
  onChange,
  onKnobChangeEnd,
  size = 100, 
  min = -180, max = 180, step = 1, sensitivity = 0.75,
  label,
  knobColor = 'bg-gray-700', trackColor = 'stroke-gray-600',
  indicatorColor = 'stroke-brand-accent', dotColor = 'fill-brand-accent',
}) => {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [displayAngle, setDisplayAngle] = useState(String(parseFloat(value).toFixed(1) || '0.0')); 
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartAngle, setDragStartAngle] = useState(0);

  useEffect(() => {
    const numericValue = parseFloat(value);
    const formattedValue = isNaN(numericValue) ? '0.0' : numericValue.toFixed(1);
    if (parseFloat(formattedValue) !== parseFloat(displayAngle)) { 
      setDisplayAngle(formattedValue);
    }
  }, [value, displayAngle]); // Added displayAngle to dep array as it's compared

  const processNewAngle = useCallback((newAngleRaw) => {
    let newAngle = parseFloat(newAngleRaw);
    if (isNaN(newAngle)) newAngle = 0;
    newAngle = Math.max(min, Math.min(max, newAngle));
    return newAngle;
  }, [min, max]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    document.body.style.cursor = 'ns-resize';
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartAngle(parseFloat(displayAngle) || 0);
  }, [displayAngle]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaY = dragStartY - e.clientY;
    let newAngle = dragStartAngle + (deltaY * sensitivity);
    newAngle = processNewAngle(newAngle);
    setDisplayAngle(newAngle.toFixed(1));
    if (onChange) onChange(newAngle);
  }, [isDragging, dragStartY, dragStartAngle, sensitivity, processNewAngle, onChange]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      document.body.style.cursor = 'default';
      setIsDragging(false);
      let finalAngle = parseFloat(displayAngle) || 0;
      finalAngle = Math.round(finalAngle / step) * step;
      finalAngle = Math.max(min, Math.min(max, finalAngle));

      setDisplayAngle(finalAngle.toFixed(1));
      if (onKnobChangeEnd) onKnobChangeEnd(finalAngle);
      else if (onChange) onChange(finalAngle);
    }
  }, [isDragging, displayAngle, step, min, max, onKnobChangeEnd, onChange]);

  useEffect(() => { 
    if (isDragging) { 
        window.addEventListener('mousemove', handleMouseMove); 
        window.addEventListener('mouseup', handleMouseUp); 
        document.body.style.userSelect = 'none'; 
    } else { 
        window.removeEventListener('mousemove', handleMouseMove); 
        window.removeEventListener('mouseup', handleMouseUp); 
        document.body.style.userSelect = ''; 
    } 
    return () => { 
        window.removeEventListener('mousemove', handleMouseMove); 
        window.removeEventListener('mouseup', handleMouseUp); 
        document.body.style.cursor = 'default'; 
        document.body.style.userSelect = ''; 
    }; 
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const center = size / 2;
  const trackRadiusOuter = size * 0.42;
  const trackRadiusInner = size * 0.30;
  const indicatorLineRadius = size * 0.36;
  const indicatorDotRadius = size * 0.06; 
  const currentNumericAngleForSVG = parseFloat(displayAngle) || 0;
  const angleInRadians = (currentNumericAngleForSVG - 90) * (Math.PI / 180); 
  const indicatorX = center + indicatorLineRadius * Math.cos(angleInRadians);
  const indicatorY = center + indicatorLineRadius * Math.sin(angleInRadians);

  const handleInputChange = (e) => {
    setDisplayAngle(e.target.value); 
    const numVal = parseFloat(e.target.value);
    if (!isNaN(numVal) && onChange) {
        onChange(Math.max(min, Math.min(max, numVal))); 
    }
  };

  const handleInputBlur = () => {
    let finalAngle = parseFloat(displayAngle) || 0;
    finalAngle = Math.max(min, Math.min(max, finalAngle));
    finalAngle = Math.round(finalAngle / step) * step; 
    setDisplayAngle(finalAngle.toFixed(1));
    if (onKnobChangeEnd) onKnobChangeEnd(finalAngle);
    else if (onChange) onChange(finalAngle);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {label && <label className="block text-xs font-medium text-gray-400 mb-1 select-none">{label}</label>}
      <svg
        ref={knobRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseDown={handleMouseDown}
        className={`rounded-full shadow-md active:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-1 focus:ring-offset-gray-800 cursor-ns-resize ${knobColor}`}
        tabIndex={0}
        onKeyDown={(e) => {
            let currentVal = parseFloat(displayAngle) || 0;
            let newAngle = currentVal;
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); newAngle = Math.min(max, Math.round((currentVal + step) / step) * step); } 
            else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); newAngle = Math.max(min, Math.round((currentVal - step) / step) * step); }
            if (newAngle !== currentVal) { 
                setDisplayAngle(newAngle.toFixed(1)); 
                if (onKnobChangeEnd) onKnobChangeEnd(newAngle); else if(onChange) onChange(newAngle);
            }
        }}
        role="slider" aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(currentNumericAngleForSVG)}
      >
        <circle cx={center} cy={center} r={trackRadiusOuter} fill="none" className={`${trackColor} opacity-50`} strokeWidth={size * 0.08} />
        <circle cx={center} cy={center} r={trackRadiusInner} className={`${knobColor} opacity-70`} stroke={trackColor} strokeWidth={size*0.02}/>
        {[0, 90, 180, 270].map(tickAngleDeg => { const tickAngleRad = (tickAngleDeg - 90) * (Math.PI / 180); return ( <line key={tickAngleDeg} x1={center + trackRadiusInner * 0.9 * Math.cos(tickAngleRad)} y1={center + trackRadiusInner * 0.9 * Math.sin(tickAngleRad)} x2={center + trackRadiusOuter * 0.95 * Math.cos(tickAngleRad)} y2={center + trackRadiusOuter * 0.95 * Math.sin(tickAngleRad)} className="stroke-gray-500" strokeWidth={size*0.025} /> ); })}
        <line x1={center} y1={center} x2={indicatorX} y2={indicatorY} className={indicatorColor} strokeWidth={size*0.045} strokeLinecap="round"/>
        <circle cx={indicatorX} cy={indicatorY} r={indicatorDotRadius} className={dotColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      </svg>
      <span className="font-digital text-base text-pos-yellow mt-1">{parseFloat(displayAngle).toFixed(1)}°</span>
      <Input
        type="number" 
        value={displayAngle}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min={min} 
        max={max} 
        step={step === 1 ? "0.1" : String(step)} // Ensure step is string for input
        inputClassName="w-20 text-center !py-1 !text-xs mt-1 bg-gray-700/80 border-gray-600/70" // Slightly different style for this specific input
        aria-label={label ? `${label} value input` : "Rotation value input"}
      />
    </div>
  );
};

RotationKnob.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onKnobChangeEnd: PropTypes.func,
  size: PropTypes.number, min: PropTypes.number, max: PropTypes.number, step: PropTypes.number, sensitivity: PropTypes.number,
  label: PropTypes.string, knobColor: PropTypes.string, trackColor: PropTypes.string, indicatorColor: PropTypes.string, dotColor: PropTypes.string,
};

export default RotationKnob;
// src/components/core/pose_editor/FootDisplay.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

// Corrected base paths assuming assets are served from /public/assets/
const GROUND_ASSETS_BASE_PATH = '/assets/ground/'; // For foot outlines and ground points
// const IMAGES_ASSETS_BASE_PATH = '/assets/images/'; // Original, if foot-wheel was in a separate images folder

// If foot-wheel.png is also in /assets/ground/ as per your path example:
const WHEEL_IMAGE_PATH = '/assets/ground/foot-wheel.png';


const FootDisplay = ({ 
  side, 
  groundPoints,
  type = 'image',
  sizeClasses, 
  rotation = 0,
  className = "",
}) => {
  const [baseImageError, setBaseImageError] = useState(false);
  const [groundPointImageErrors, setGroundPointImageErrors] = useState({});
  const [wheelImageError, setWheelImageError] = useState(false);

  const baseFootImageSrc = useMemo(() => side === 'L' 
    ? `${GROUND_ASSETS_BASE_PATH}foot-left.png` 
    : `${GROUND_ASSETS_BASE_PATH}foot-right.png`, [side]);
  
  const wheelImageSrc = WHEEL_IMAGE_PATH; // Use the corrected constant

  useEffect(() => {
    setBaseImageError(false);
    setWheelImageError(false);
    setGroundPointImageErrors({});
  }, [side, groundPoints]); // Reset errors when props change

  const handleImageError = (setter, path) => { 
    setter(true); 
    console.error(`[FootDisplay] Error loading image: ${path}`); 
  };
  const handleGroundPointError = (pointName) => { 
    setGroundPointImageErrors(prev => ({ ...prev, [pointName]: true })); 
    console.error(`[FootDisplay] Error loading ground point image: ${GROUND_ASSETS_BASE_PATH}${pointName}.png`);
  };

  const activeGroundPointsArray = useMemo(() => {
    if (!groundPoints) return [];
    return (Array.isArray(groundPoints) ? groundPoints : [groundPoints]).filter(Boolean);
  }, [groundPoints]);

  if (type === 'image') {
    return (
      <div className={`relative ${sizeClasses} flex items-center justify-center select-none ${className}`}>
        {!wheelImageError ? (
          <img
            src={wheelImageSrc}
            alt="Foot grounding wheel" // Added alt text
            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60 sm:opacity-75"
            onError={() => handleImageError(setWheelImageError, wheelImageSrc)}
            aria-hidden="true"
            draggable="false"
          />
        ) : ( <div className="absolute inset-0 flex items-center justify-center text-red-700/60 text-xs font-mono bg-black/30 rounded-full">WheelImg Err</div> )}

        <div
          className="absolute w-[65%] h-[65%] flex items-center justify-center" 
          style={{ transform: `rotate(${rotation}deg)` }} 
        >
          {!baseImageError ? (
            <img
              src={baseFootImageSrc}
              alt={`${side === 'L' ? 'Left' : 'Right'} Foot Outline`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              onError={() => handleImageError(setBaseImageError, baseFootImageSrc)}
              draggable="false"
            />
          ) : ( <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm font-semibold font-mono bg-black/30">BaseImg Err</div> )}

          {activeGroundPointsArray.map((pointName) => {
            if (groundPointImageErrors[pointName]) {
              return <div key={`${pointName}-err`} className="absolute inset-0 flex items-center justify-center text-red-600/80 text-[0.5rem] font-mono bg-black/20">{pointName} Err</div>;
            }
            const pointImageSrc = `${GROUND_ASSETS_BASE_PATH}${pointName}.png`;
            return (
              <img 
                key={pointName} 
                src={pointImageSrc} 
                alt={`Grounding point: ${pointName}`} 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-90" 
                onError={() => handleGroundPointError(pointName)} 
                draggable="false"
              />
            );
          })}
           {activeGroundPointsArray.length === 0 && !baseImageError && (
             <p className="text-xs text-gray-500/70 absolute bottom-1 opacity-80 pointer-events-none font-mono">No Ground</p>
           )}
        </div>
         {baseImageError && ( <p className="text-red-500 text-xs font-semibold absolute bottom-0 bg-black/60 px-1 rounded font-mono">Base Foot Img Err</p> )}
      </div>
    );
  }
  
  return ( 
    <div className={`${sizeClasses} bg-gray-700 flex flex-col items-center justify-center rounded-full p-1 text-xs ${className}`}> 
      <p>{side} Foot</p> 
      <p>Rot: {rotation}°</p> 
      <p className="truncate w-full text-center">Pts: {activeGroundPointsArray.join(',')||'N/A'}</p> 
    </div>
  );
};

FootDisplay.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  groundPoints: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  type: PropTypes.string,
  sizeClasses: PropTypes.string.isRequired,
  rotation: PropTypes.number,
  className: PropTypes.string,
};

export default FootDisplay;
// client/src/components/FootDisplay/FootDisplay.jsx
import React from 'react';
import footWheelBase from '../../assets/images/foot-wheel.png';

// Dynamically import all ground point images
const groundImageModules = import.meta.glob('../../assets/ground/*.png', { eager: true });

const overlayMap = Object.entries(groundImageModules).reduce((acc, [path, module]) => {
  const fileName = path.split('/').pop().replace(/\.(png|jpe?g|svg|gif)$/i, '');
  acc[fileName] = module.default;
  return acc;
}, {});

const FootDisplay = ({ groundPoint = '', side = 'L' }) => {
  const currentGroundPointForThisSide =
    (side === 'L' && groundPoint?.startsWith('L')) ? groundPoint :
    (side === 'R' && groundPoint?.startsWith('R')) ? groundPoint :
    '';

  const overlayImgSrc = currentGroundPointForThisSide ? overlayMap[currentGroundPointForThisSide] : null;

  return (
    <div className="flex flex-col items-center w-full max-w-[160px] sm:max-w-[180px] md:max-w-[200px]"> {/* Constrain width */}
      <div className="relative w-full aspect-square"> {/* Maintain aspect ratio */}
        <img 
          src={footWheelBase} 
          alt={`${side} Foot Wheel`} 
          className="absolute inset-0 w-full h-full object-contain" 
        />
        {overlayImgSrc ? (
          <img
            src={overlayImgSrc}
            alt={currentGroundPointForThisSide}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[75%] max-h-[75%] object-contain opacity-90 p-1" // Centering and padding
          />
        ) : (
          currentGroundPointForThisSide && (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-red-500 text-xs bg-black/50 p-1 rounded">Missing: {currentGroundPointForThisSide}</p>
            </div>
          )
        )}
      </div>
      <p className="mt-1 text-xs text-lime-400 font-mono">
        {side}: {currentGroundPointForThisSide || '--'}
      </p>
    </div>
  );
};

export default FootDisplay;
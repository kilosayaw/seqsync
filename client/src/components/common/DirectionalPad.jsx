import React from 'react';
import PropTypes from 'prop-types';

// This is a helper component to create the chevron shapes using borders
const Chevron = ({ rotation, className = '' }) => (
  <div
    className={`absolute w-3 h-3 border-white border-t-2 border-r-2 transform ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  />
);

// The map now uses <span> wrappers instead of <> fragments to ensure correct parsing.
const VectorToSymbolMap = {
  // Key format: "x,y,z"
  '0,0,-1': <Chevron rotation={-45} className="top-[35%]" />, // Backward
  '0,0,1': <Chevron rotation={135} className="bottom-[35%]" />, // Forward
  '0,-1,-1': <span><Chevron rotation={-45} className="top-[30%]" /><Chevron rotation={-45} className="top-[40%]" /></span>, // Downward Backward
  '0,-1,0': <span><Chevron rotation={-45} className="top-[35%]" /><Chevron rotation={45} className="top-[35%]" /></span>, // Downward
  '0,-1,1': <span><Chevron rotation={135} className="bottom-[30%]" /><Chevron rotation={135} className="bottom-[40%]" /></span>, // Downward Forward
  '0,1,-1': <span><Chevron rotation={-135} className="top-[30%]" /><Chevron rotation={-135} className="top-[40%]" /></span>, // Upward Backward
  '0,1,0': <span><Chevron rotation={-135} className="top-[35%]" /><Chevron rotation={-225} className="top-[35%]" /></span>, // Upward
  '0,1,1': <span><Chevron rotation={225} className="bottom-[30%]" /><Chevron rotation={225} className="bottom-[40%]" /></span>, // Upward Forward
  
  '-1,0,0': <Chevron rotation={-135} className="left-[35%]" />, // Right (as per coordinate system, -1X is Right)
  '-1,-1,-1': <div className="absolute top-1/4 right-1/4"><Chevron rotation={-45} /><Chevron rotation={-135} /></div>, // Downward Back Right
  '-1,-1,0': <div className="absolute top-1/4 right-1/4"><Chevron rotation={45} /><Chevron rotation={-45} /></div>, // Downward Right
  '-1,-1,1': <div className="absolute bottom-1/4 right-1/4"><Chevron rotation={135} /><Chevron rotation={45} /></div>, // Downward Fwd Right
  '-1,1,-1': <div className="absolute top-1/4 left-1/4 rotate-180"><Chevron rotation={45} /><Chevron rotation={135} /></div>, // Upward Back Right
  '-1,1,0': <div className="absolute top-1/4 left-1/4 -rotate-90"><Chevron rotation={-45} /><Chevron rotation={45} /></div>, // Upward Right
  '-1,1,1': <div className="absolute bottom-1/4 left-1/4 -rotate-90"><Chevron rotation={45} /><Chevron rotation={135} /></div>, // Upward Fwd Right
  
  '1,0,0': <Chevron rotation={45} className="right-[35%]" />, // Left (as per coordinate system, 1X is Left)
  '1,-1,-1': <div className="absolute top-1/4 left-1/4"><Chevron rotation={-45} /><Chevron rotation={45} /></div>, // Downward Back Left
  '1,-1,0': <div className="absolute top-1/4 left-1/4 rotate-90"><Chevron rotation={-45} /><Chevron rotation={45} /></div>, // Downward Left
  '1,-1,1': <div className="absolute bottom-1/4 left-1/4"><Chevron rotation={135} /><Chevron rotation={225} /></div>, // Downward Fwd Left
  '1,1,-1': <div className="absolute top-1/4 right-1/4 -rotate-90"><Chevron rotation={-45} /><Chevron rotation={135} /></div>, // Upward Back Left
  '1,1,0': <div className="absolute top-1/4 right-1/4 rotate-180"><Chevron rotation={-45} /><Chevron rotation={-135} /></div>, // Upward Left
  '1,1,1': <div className="absolute bottom-1/4 right-1/4"><Chevron rotation={-225} /><Chevron rotation={-135} /></div>, // Upward Fwd Left

  '1,0,1': <span><Chevron rotation={135} className="bottom-[40%] right-[30%]" /><Chevron rotation={45} className="right-[30%] bottom-[40%]" /></span>, // Forward Left
  '1,0,-1': <span><Chevron rotation={-45} className="top-[40%] right-[30%]" /><Chevron rotation={45} className="right-[30%] top-[40%]" /></span>, // Backward Left
  '-1,0,1': <span><Chevron rotation={135} className="bottom-[40%] left-[30%]" /><Chevron rotation={-225} className="left-[30%] bottom-[40%]" /></span>, // Forward Right
  '-1,0,-1': <span><Chevron rotation={-45} className="top-[40%] left-[30%]" /><Chevron rotation={-135} className="left-[30%] top-[40%]" /></span>, // Backward Right

  '0,0,0': null, // Default/No Movement
};


const DirectionalPad = ({ vector = {x:0, y:0, z:0}, jointAbbrev = "RW" }) => {
  const safeVector = {
    x: Math.round(vector.x || 0),
    y: Math.round(vector.y || 0),
    z: Math.round(vector.z || 0),
  };
  const key = `${safeVector.x},${safeVector.y},${safeVector.z}`;
  const symbol = VectorToSymbolMap[key];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
        <div className="relative w-24 h-24 bg-gray-800/50 border-2 border-gray-600 rounded-lg flex items-center justify-center">
            <span className="font-mono text-2xl font-bold text-white z-10">{jointAbbrev}</span>
            <div className="absolute inset-0 flex items-center justify-center">
                {symbol}
            </div>
            {key === '0,0,0' && (
                <span className="absolute text-xs text-gray-400 bottom-1">Default</span>
            )}
        </div>
        <div className="flex items-center justify-center gap-2 px-2 py-1 bg-gray-700 rounded-full">
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${safeVector.z === 1 ? 'bg-blue-400' : 'bg-gray-500'}`} title="Forward (Z: 1)"></span>
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${safeVector.z === 0 ? 'bg-yellow-400' : 'bg-gray-500'}`} title="Middle (Z: 0)"></span>
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${safeVector.z === -1 ? 'bg-red-400' : 'bg-gray-500'}`} title="Backward (Z: -1)"></span>
        </div>
    </div>
  );
};

DirectionalPad.propTypes = {
  vector: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),
  jointAbbrev: PropTypes.string,
};

export default DirectionalPad;
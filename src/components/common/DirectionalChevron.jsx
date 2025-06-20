import React from 'react';
import PropTypes from 'prop-types';

// --- Reusable SVG Path Building Blocks (Your original, excellent components) ---
// These are kept as they are the "atomic units" of your visual system.
const Top = () => <path d="M 20 25 L 50 10 L 80 25" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />;
const Bottom = () => <path d="M 20 75 L 50 90 L 80 75" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />;
const Left = () => <path d="M 25 20 L 10 50 L 25 80" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />;
const Right = () => <path d="M 75 20 L 90 50 L 75 80" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />;
const BracketFrame = () => (
    <>
        <path d="M 25 10 L 25 90" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 75 10 L 75 90" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
);
const DefaultCircle = () => <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="2" strokeDasharray="4 2" fill="none" />;

// --- Main Dynamic Component ---
const DirectionalChevron = ({ vector = {x:0, y:0, z:0}, jointAbbrev = "RW" }) => {
  
  // Sanitize the input vector to ensure it's always -1, 0, or 1.
  const x = Math.round(vector.x || 0);
  const y = Math.round(vector.y || 0);
  const z = Math.round(vector.z || 0);

  // Procedurally determine which components to render based on the vector.
  const getSymbol = () => {
    // --- Handle Special Cases First ---
    // 1. Default / No Movement (0,0,0)
    if (x === 0 && y === 0 && z === 0) {
      return <DefaultCircle />;
    }
    
    // 2. Pure Forward / Backward Movement (x=0, y=0)
    if (x === 0 && y === 0) {
      return (
        <>
          <BracketFrame />
          {z > 0 && <Bottom />} 
          {z < 0 && <Top />}
        </>
      );
    }
    
    // 3. Pure Left / Right Movement (y=0, z=0)
    if (y === 0 && z === 0) {
       return (
        <>
            {x > 0 && <Left />}
            {x < 0 && <Right />}
        </>
       )
    }

    // --- General Case: Build the symbol from parts ---
    const parts = [];
    
    // Add Y-axis chevrons (Primary Up/Down)
    if (y > 0) parts.push(<Top key="y" />);
    if (y < 0) parts.push(<Bottom key="y" />);

    // Add X-axis chevrons (Primary Left/Right)
    if (x > 0) parts.push(<Left key="x" />);
    if (x < 0) parts.push(<Right key="x" />);

    // Add Z-axis chevrons (Depth indicator)
    // Backward (z=-1) adds a top chevron. Forward (z=1) adds a bottom chevron.
    if (z < 0) parts.push(<Top key="z" />);
    if (z > 0) parts.push(<Bottom key="z" />);

    return <>{parts}</>;
  };

  return (
    <div className="relative w-16 h-16 bg-gray-900 rounded-md flex items-center justify-center">
        <span className="absolute font-mono text-xl font-bold text-white z-10 select-none">{jointAbbrev}</span>
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="absolute inset-0">
            {getSymbol()}
        </svg>
    </div>
  );
};

DirectionalChevron.propTypes = {
  vector: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),
  jointAbbrev: PropTypes.string,
};

export default React.memo(DirectionalChevron);
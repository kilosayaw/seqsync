import React, { useState, useEffect } from 'react';
import { useRotaryDrag } from '../hooks/useRotaryDrag';
import { useSequence } from '../context/SequenceContext';
import { useUIState } from '../context/UIStateContext';
import './RotaryController.css';

// Assume your SVG_PATHS constant is here as before...
const SVG_PATHS = { foot: "...", L1: "...", /* ... all your paths */ };

const RotaryController = ({ side }) => {
  const { songData, updateRotaryState } = useSequence();
  const { selectedBeat } = useUIState();

  const handleDragEnd = (finalAngle) => {
    if (selectedBeat !== null) {
      updateRotaryState(selectedBeat, side, { angle: finalAngle });
    }
  };

  const { angle, setAngle, nodeRef, handleMouseDown } = useRotaryDrag(handleDragEnd);
  const [activeZone, setActiveZone] = useState('None');
  
  // EFFECT 1: Update the component's internal state when the selected beat changes
  useEffect(() => {
    if (selectedBeat !== null && songData[selectedBeat]) {
      const beatState = songData[selectedBeat].rotary[side];
      setAngle(beatState.angle || 0);
      setActiveZone(beatState.grounding || 'None');
    }
  }, [selectedBeat, songData, side, setAngle]);

  // EFFECT 2: Update the global context when the user interacts with the zones
  useEffect(() => {
    // Only update if a beat is actually selected and the zone is not 'None'
    if (selectedBeat !== null && activeZone !== 'None') {
      // Avoids writing initial 'None' state back to context
      const currentGroundingInContext = songData[selectedBeat]?.rotary[side]?.grounding;
      if (activeZone !== currentGroundingInContext) {
         updateRotaryState(selectedBeat, side, { grounding: activeZone });
      }
    }
  }, [activeZone, selectedBeat, side, updateRotaryState, songData]);

  return (
    <div className="rotary-controller-container">
      <div 
        className="rotary-wheel" 
        ref={nodeRef} 
        onMouseDown={handleMouseDown} 
        style={{ transform: `rotate(${angle}deg)` }}
      >
         <img src="/assets/rotary_rim.png" alt="Rotary Rim" className="rotary-rim-img" />
      </div>

      <div className="rotary-center-content">
        <svg viewBox="0 0 200 200" className="foot-svg" onMouseLeave={() => setActiveZone('None')}>
          <g className="foot-zones">
            <path d={SVG_PATHS.L1}  onMouseEnter={() => setActiveZone('L1')} />
            {/* ... Your other path elements ... */}
          </g>
          <image href={`/assets/${side}_foot_base.png`} x="0" y="0" height="200" width="200" />
        </svg>
      </div>
      
       <div className="active-zone-display">{activeZone}</div>
    </div>
  );
};

export default RotaryController;
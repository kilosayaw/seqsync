import React, { useState, useEffect } from 'react';
import { useRotaryDrag } from '../hooks/useRotaryDrag';
import { useSequence } from '../context/SequenceContext';
import { useUIState } from '../context/UIStateContext';
import './RotaryController.css';

// This is the functional Rotary Controller with your assets.
const RotaryController = ({ side }) => {
  const { songData, updateRotaryState } = useSequence();
  const { selectedBeat } = useUIState();

  const handleDragEnd = (finalAngle) => {
    if (selectedBeat !== null) {
      updateRotaryState(selectedBeat, side, { angle: finalAngle });
    }
  };

  const { angle, setAngle, nodeRef, handleMouseDown } = useRotaryDrag(handleDragEnd);
  
  // A simple placeholder state for grounding, we can restore the full SVG logic next
  const [activeZone, setActiveZone] = useState('None');
  
  useEffect(() => {
    if (selectedBeat !== null && songData[selectedBeat]) {
      const beatState = songData[selectedBeat].rotary[side];
      setAngle(beatState.angle || 0);
      setActiveZone(beatState.grounding || 'None');
    } else {
      setAngle(0);
      setActiveZone('None');
    }
  }, [selectedBeat, songData, side, setAngle]);

  return (
    <div className="rotary-controller-container">
      {/* This is the draggable, rotating wheel rim */}
      <div 
        className="rotary-wheel" 
        ref={nodeRef} 
        onMouseDown={handleMouseDown} 
        style={{ transform: `rotate(${angle}deg)` }}
      >
         <img src="/assets/ground/foot-wheel.png" alt="Rotary Rim" className="rotary-rim-img" />
      </div>

      {/* This is the static foot image in the center */}
      <div className="rotary-center-content">
        <img src={`/assets/ground/foot-${side}.png`} alt={`${side} foot`} className="foot-img" />
      </div>
      
      {/* This will display the grounding point */}
       <div className="active-zone-display">{activeZone}</div>
    </div>
  );
};

export default RotaryController;
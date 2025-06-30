import React, { useState, useEffect } from 'react';
import { useRotaryDrag } from '../hooks/useRotaryDrag';
import { useSequence } from '../context/SequenceContext';
import { useUIState } from '../context/UIStateContext';
import { GROUNDING_STATES } from '../utils/constants';
import './RotaryController.css';

const RotaryController = ({ side }) => {
    const { songData, updateRotaryState } = useSequence();
    const { selectedBeat } = useUIState();

    const defaultGrounding = side === 'left' ? 'L_FULL' : 'R_FULL';

    // Local state for immediate visual feedback
    const [angle, setAngle] = useState(0);
    const [grounding, setGrounding] = useState(defaultGrounding);

    // --- DRAG LOGIC ---
    const handleDragEnd = (finalAngle) => {
        if (selectedBeat !== null) {
            updateRotaryState(selectedBeat, side, { angle: finalAngle });
        }
    };
    const { nodeRef, handleMouseDown } = useRotaryDrag(handleDragEnd, setAngle);

    // --- EFFECT TO LOAD DATA FROM CONTEXT (STABLE VERSION) ---
    // This effect is now stable because it only depends on the specific beat's data.
    const beatState = songData[selectedBeat]?.rotary?.[side];
    useEffect(() => {
        if (beatState) {
            setAngle(beatState.angle || 0);
            setGrounding(beatState.grounding || defaultGrounding);
        } else {
            setAngle(0);
            setGrounding(defaultGrounding);
        }
    }, [beatState]); // The dependency is now a specific object, breaking the loop.

    // --- DIRECT EVENT HANDLERS ---
    const handleGroundingChange = (newGrounding) => {
        setGrounding(newGrounding);
        if (selectedBeat !== null) {
            updateRotaryState(selectedBeat, side, { grounding: newGrounding });
        }
    };

    const groundingImagePath = GROUNDING_STATES[grounding] || GROUNDING_STATES[defaultGrounding];

    return (
        <div className="rotary-controller-container">
            <div className="rotary-static-background"></div>
            
            {/* The main rotating wheel. Everything that spins goes inside. */}
            <div 
                className="rotary-wheel" 
                ref={nodeRef} 
                onMouseDown={handleMouseDown} 
                style={{ transform: `rotate(${angle}deg)` }}
            >
                 <img src="/ground/foot-wheel.png" alt="Rotary Rim" className="rotary-rim-img" />
                 
                 {/* The foot image is NOW INSIDE the rotating wheel */}
                 <img src={groundingImagePath} alt={grounding} className="foot-img" />
                
                 {/* The interactive SVG is ALSO INSIDE the rotating wheel */}
                 <svg className="interaction-overlay" viewBox="0 0 100 100">
                    <rect x="20" y="10" width="60" height="50" className="zone" onMouseEnter={() => handleGroundingChange(side === 'left' ? 'L_HEEL_UP' : 'R_HEEL_UP')} />
                    <rect x="20" y="60" width="60" height="30" className="zone" onMouseEnter={() => handleGroundingChange(side === 'left' ? 'L_HEEL' : 'R_HEEL')} />
                    <rect width="100" height="100" fill="transparent" onMouseLeave={() => handleGroundingChange(defaultGrounding)} />
                 </svg>
            </div>
            
            <div className="active-zone-display">{grounding}</div>
        </div>
    );
};

export default RotaryController;
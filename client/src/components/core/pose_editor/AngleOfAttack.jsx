import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { getVectorFromXY, isPointInPolygon } from '../../../utils/helpers';
import { VECTOR_GRID_CELLS } from '../../../utils/constants';

const AngleOfAttack = ({ side, currentVector, validPath, onUpdate }) => {
    const containerRef = useRef(null);

    const handleInteraction = useCallback((e) => {
        if (!containerRef.current || !onUpdate) return;
        e.preventDefault();
        
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Normalize click/touch position to a -1 to 1 range, with (0,0) at the center
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = ((clientY - rect.top) / rect.height) * 2 - 1;

        // Get a point clamped to the valid polygon path
        const { x, y } = getVectorFromXY(normX, normY, validPath);
        
        onUpdate(side, { x, y, z: 0 }); // Update with the new, constrained vector

    }, [onUpdate, side, validPath]);

    const handlePointerMove = useCallback((e) => {
        if (e.buttons !== 1) return; // Only drag if mouse is down
        handleInteraction(e);
    }, [handleInteraction]);

    // Convert the -1 to 1 vector to SVG coordinates (0-250)
    const svgX = 125 + (currentVector.x * 100);
    const svgY = 125 - (currentVector.y * 100);

    // Convert the valid path polygon to an SVG-ready string
    const validPathString = validPath.map(p => `${125 + p.x * 100},${125 - p.y * 100}`).join(' ');

    return (
        <div className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm rounded-full z-30 flex flex-col items-center justify-center animate-fade-in-fast p-4">
            <div 
                ref={containerRef}
                className="w-full h-full rounded-full relative cursor-crosshair"
                onMouseDown={handleInteraction}
                onMouseMove={handlePointerMove}
            >
                <svg viewBox="0 0 250 250" className="w-full h-full pointer-events-none">
                    {/* The valid movement area polygon */}
                    <polygon points={validPathString} className="fill-pos-yellow/20 stroke-pos-yellow/50" strokeWidth="2" />

                    {/* The current knee position "blip" */}
                    <g>
                        <circle cx={svgX} cy={svgY} r="8" fill="#facc15" className="drop-shadow-lg" />
                        <circle cx={svgX} cy={svgY} r="16" fill="none" stroke="#fde047" strokeWidth="2" />
                    </g>
                </svg>
            </div>
            
            <div className="w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-3 grid-rows-3 gap-1 pointer-events-none">
                {VECTOR_GRID_CELLS.map((cell, i) => {
                    const isAllowed = isPointInPolygon({ x: cell.x, y: cell.y }, validPath);
                    return (
                        <div key={i} className={`flex items-center justify-center rounded-sm ${isAllowed ? 'bg-transparent' : 'bg-red-500/30'}`}>
                            {!isAllowed && <FontAwesomeIcon icon={faBan} className="text-red-400/50 text-xs"/>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

AngleOfAttack.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  currentVector: PropTypes.object.isRequired,
  validPath: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default AngleOfAttack;
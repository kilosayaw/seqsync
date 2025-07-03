import React, { useRef, useCallback, useEffect, useState } from 'react';
import { FOOT_HOTSPOT_COORDINATES, BASE_FOOT_PATHS } from '../utils/constants';

const RotarySVG = ({ side, angle, setAngle, activePoints, onPointClick, onDragEnd, isDisabled }) => {
   const svgSize = 550;
   const centerX = svgSize / 2;
   const centerY = svgSize / 2;
   const newSize = 340;
   const xOffset = 105;
   const yOffset = 109;

   const sideKey = side.charAt(0).toUpperCase();
   const allHotspots = FOOT_HOTSPOT_COORDINATES[sideKey];
   const baseFootPath = BASE_FOOT_PATHS[sideKey];

   // --- State and Refs for Turntable Physics ---
   const [isDragging, setIsDragging] = useState(false);
   const lastMouseAngleRef = useRef(0);
   const velocityRef = useRef(0);
   const animationFrameRef = useRef();
   const centerRef = useRef({ x: 0, y: 0 });

   const animate = useCallback(() => {
       velocityRef.current *= 0.95; // Friction
       if (Math.abs(velocityRef.current) < 0.01) {
           cancelAnimationFrame(animationFrameRef.current);
           if (typeof onDragEnd === 'function') {
               setAngle(currentAngle => {
                   onDragEnd(currentAngle);
                   return currentAngle;
               });
           }
           return;
       }
       setAngle(prev => prev + velocityRef.current);
       animationFrameRef.current = requestAnimationFrame(animate);
   }, [onDragEnd, setAngle]);

   const handleMouseMove = useCallback((e) => {
       if (!isDragging) return;
       const dx = e.clientX - centerRef.current.x;
       const dy = e.clientY - centerRef.current.y;
       const currentMouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
       let delta = currentMouseAngle - lastMouseAngleRef.current;
       if (delta < -180) delta += 360;
       else if (delta > 180) delta -= 360;
      
       setAngle(prev => prev + delta);
       velocityRef.current = delta;
       lastMouseAngleRef.current = currentMouseAngle;
   }, [isDragging, setAngle]);

   const handleMouseUp = useCallback(() => {
       if (!isDragging) return;
       setIsDragging(false);
       if (Math.abs(velocityRef.current) > 0.01) {
           animationFrameRef.current = requestAnimationFrame(animate);
       } else if (typeof onDragEnd === 'function') {
           onDragEnd(angle);
       }
   }, [isDragging, animate, angle, onDragEnd]);

   const handleMouseDown = useCallback((e) => {
       if (isDisabled) return;
       if (e.target.classList.contains('hotspot-indicator') || e.target.classList.contains('hotspot-clickable-area')) {
           return;
       }
       e.stopPropagation();
       setIsDragging(true);
       cancelAnimationFrame(animationFrameRef.current);
       velocityRef.current = 0;
      
       const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
       centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
       const dx = e.clientX - centerRef.current.x;
       const dy = e.clientY - centerRef.current.y;
       lastMouseAngleRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
   }, [isDisabled]);

   useEffect(() => {
       if (isDragging) {
           window.addEventListener('mousemove', handleMouseMove);
           window.addEventListener('mouseup', handleMouseUp);
       }
       return () => {
           window.removeEventListener('mousemove', handleMouseMove);
           window.removeEventListener('mouseup', handleMouseUp);
       };
   }, [isDragging, handleMouseMove, handleMouseUp]);

   if (!allHotspots) return null;

   return (
       <svg
           width={svgSize} height={svgSize}
           viewBox={`0 0 ${svgSize} ${svgSize}`}
           className={`rotary-svg-container ${isDisabled ? 'disabled' : ''}`}
       >
           <g transform={`rotate(${angle}, ${centerX}, ${centerY})`}>
               <image href="/ground/foot-wheel.png" x="0" y="0" width={svgSize} height={svgSize} style={{ pointerEvents: 'none' }} />
               <circle cx={centerX} cy={centerY} r={svgSize / 2} fill="transparent" className="rotary-grab-area" onMouseDown={handleMouseDown} />
              
               <image href={baseFootPath} x={xOffset} y={yOffset} width={newSize} height={newSize} className="base-foot-template" />

               {allHotspots.map(hotspot => (
                   <g key={hotspot.notation} onClick={() => onPointClick(hotspot.notation)} className="hotspot-group">
                       <circle
                           cx={hotspot.cx + (xOffset - 75)}
                           cy={hotspot.cy + (yOffset - 75)}
                           r={hotspot.r}
                           className={`hotspot-indicator ${activePoints.has(hotspot.notation) ? 'active' : 'inactive'}`}
                       />
                       <circle
                           cx={hotspot.cx + (xOffset - 75)}
                           cy={hotspot.cy + (yOffset - 75)}
                           r={hotspot.r + 5}
                           fill="transparent"
                           className="hotspot-clickable-area"
                       />
                   </g>
               ))}
           </g>
       </svg>
   );
};

export default RotarySVG;
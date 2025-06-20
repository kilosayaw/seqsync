import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowsSpin, faCrosshairs, faUndo, faRedo, 
    faArrowUp, faArrowDown, faArrowLeft, faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import { getCoreState } from '../../../utils/biomechanics';

const CoreDynamicsVisualizer = ({ fullPoseState, onCoreInputChange, beatGrounding, className = "" }) => {

  // 1. Calculate the core's state using the biomechanics kernel
  const coreState = useMemo(() => {
    const { coil, energy } = getCoreState(fullPoseState);
    const { SPIN_L } = fullPoseState || {};
    let bendTwistDirection = "Neutral";
    
    // Determine descriptive text for the core's current direction
    if (SPIN_L?.orientation === 'FLEX') bendTwistDirection = "Bend Forward";
    else if (SPIN_L?.orientation === 'EXT') bendTwistDirection = "Bend Backward";
    else if (SPIN_L?.orientation === 'L_BEND') bendTwistDirection = "Bend Left";
    else if (SPIN_L?.orientation === 'R_BEND') bendTwistDirection = "Bend Right";
    else if (Math.abs(coil) > 0.1) bendTwistDirection = coil > 0 ? "Twist Right" : "Twist Left";
    
    // Calculate a simplified stability score based on grounding
    let stability = 35; // Default for lifted or single-point contact
    const isLPlanted = beatGrounding?.L?.length > 0;
    const isRPlanted = beatGrounding?.R?.length > 0;
    if (isLPlanted && isRPlanted) {
        stability = 100;
    } else if (isLPlanted || isRPlanted) {
        stability = 65;
    }

    return { bendTwistDirection, stability, coil, energy };
  }, [fullPoseState, beatGrounding]);

  // 2. Determine the visual state of the energy ball
  const atomSphereState = useMemo(() => {
    const { coil, energy } = coreState;
    if (energy > 0.8) return 'coiled_max';
    if (coil > 0.2) return 'coiled_out'; // Twisting right
    if (coil < -0.2) return 'coiled_in'; // Twisting left
    return 'neutral';
  }, [coreState]);

  // 3. Define the actions for the interactive control buttons
  const coreControlActions = useMemo(() => [
    { label: 'Forward Bend', icon: faArrowUp, joint: 'SPIN_L', prop: 'orientation', val: 'FLEX'},
    { label: 'Twist Left', icon: faUndo, joint: 'LS', prop: 'rotation', val: (fullPoseState?.LS?.rotation || 0) - 15}, 
    { label: 'Center Core', icon: faCrosshairs, action: 'RESET'}, 
    { label: 'Twist Right', icon: faRedo, joint: 'LS', prop: 'rotation', val: (fullPoseState?.LS?.rotation || 0) + 15},
    { label: 'Bend Left', icon: faArrowLeft, joint: 'SPIN_L', prop: 'orientation', val: 'L_BEND'},
    { label: 'Backward Bend', icon: faArrowDown, joint: 'SPIN_L', prop: 'orientation', val: 'EXT'},
    { label: 'Bend Right', icon: faArrowRight, joint: 'SPIN_L', prop: 'orientation', val: 'R_BEND'},
  ], [fullPoseState]); // Re-calculate when pose changes to get latest rotation values

  // 4. Handle clicks on the control buttons
  const handleCoreControlClick = (control) => {
    if (control.action === 'RESET') {
        onCoreInputChange('SPIN_L', 'orientation', 'NEU');
        onCoreInputChange('LS', 'rotation', 0);
        onCoreInputChange('RS', 'rotation', 0); // Also reset the other shoulder
    } else {
        // For twist, apply symmetrically to both shoulders
        if (control.prop === 'rotation') {
            onCoreInputChange('LS', control.prop, control.val);
            onCoreInputChange('RS', control.prop, control.val);
        } else {
            onCoreInputChange(control.joint, control.prop, control.val);
        }
    }
  };
  
  // 5. Define visual parameters for the SVG
  const sphereColors = {
    neutral: '#3b82f6',    // blue-500
    coiled_in: '#f97316',  // orange-500 (Twist Left)
    coiled_out: '#ef4444', // red-500 (Twist Right)
    coiled_max: '#b91c1c', // red-700 (High Energy)
  };
  const sphereColor = sphereColors[atomSphereState] || '#6b7280';
  
  const coreX = coreState.coil * 25; // Visual horizontal shift based on coil
  const coreY = 0; // Placeholder for vertical shift based on bend
  const energyScale = 1 + coreState.energy * 0.5; // Visual scale based on energy

  // 6. Render the complete component
  return (
    <div className={`p-3 border border-yellow-500/50 rounded-lg bg-gray-800/80 shadow-xl text-center flex flex-col items-center justify-between h-full backdrop-blur-sm ${className}`}>
      <div className="flex-shrink-0 w-full">
        <h4 className="text-sm font-semibold text-pos-yellow font-orbitron tracking-wider">Core Dynamics</h4>
      </div>
      
      {/* Visualizer SVG */}
      <div className="flex-grow w-full flex items-center justify-center my-2">
        <svg viewBox="-60 -60 120 120" className="w-full h-auto max-w-[180px] aspect-square">
          <defs>
            <radialGradient id="energyGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
              <stop offset="100%" stopColor={sphereColor} />
            </radialGradient>
          </defs>
          {/* Limb connection points */}
          <circle cx="-40" cy="-40" r="4" fill="#9ca3af" opacity="0.6" /><text x="-40" y="-50" fill="#9ca3af" fontSize="8" textAnchor="middle">LS</text>
          <circle cx="40" cy="-40" r="4" fill="#9ca3af" opacity="0.6" /><text x="40" y="-50" fill="#9ca3af" fontSize="8" textAnchor="middle">RS</text>
          <circle cx="-40" cy="40" r="4" fill="#9ca3af" opacity="0.6" /><text x="-40" y="55" fill="#9ca3af" fontSize="8" textAnchor="middle">LH</text>
          <circle cx="40" cy="40" r="4" fill="#9ca3af" opacity="0.6" /><text x="40" y="55" fill="#9ca3af" fontSize="8" textAnchor="middle">RH</text>
          {/* Connection lines */}
          <line x1="-40" y1="-40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="40" y1="-40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="-40" y1="40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="40" y1="40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          {/* The Energy Ball */}
          <g style={{ transform: `translate(${coreX}px, ${coreY}px) scale(${energyScale})`, transition: 'transform 0.2s ease-out' }}>
            <circle cx="0" cy="0" r="15" fill="url(#energyGradient)" stroke={sphereColor} strokeWidth="2" />
            <g transform="translate(-8, -8)" className="transition-transform duration-300" style={{ transform: `rotate(${coreState.coil * 90}deg)` }}>
                <FontAwesomeIcon icon={faArrowsSpin} color="white" opacity="0.7" width="16" height="16" />
            </g>
          </g>
        </svg>
      </div>
      
      {/* Data Readouts */}
      <div className="text-xs text-center flex-shrink-0 w-full space-y-1">
        <p className="text-gray-400">Energy/Coil: <span className="font-semibold text-gray-200">{Math.round(coreState.energy*100)}% / {Math.round(coreState.coil*100)}%</span></p>
        <p className="text-gray-400">Direction: <span className="font-semibold text-gray-200">{coreState.bendTwistDirection}</span></p>
        <p className="text-gray-400 mb-2">Ground Stability: <span className="font-semibold text-gray-200">{coreState.stability}%</span></p>
      </div>
      
      {/* Interactive Controls */}
      <div className="w-full max-w-[200px] flex-shrink-0 mt-2">
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          <div/>
          <Tooltip content="Bend Forward" placement="top"><Button onClick={() => handleCoreControlClick(coreControlActions[0])} className="!p-1.5"><FontAwesomeIcon icon={faArrowUp}/></Button></Tooltip>
          <div/>
          <Tooltip content="Twist Left" placement="top"><Button onClick={() => handleCoreControlClick(coreControlActions[1])} className="!p-1.5"><FontAwesomeIcon icon={faUndo}/></Button></Tooltip>
          <Tooltip content="Reset Core" placement="top"><Button onClick={() => handleCoreControlClick(coreControlActions[2])} className="!p-1.5 !bg-gray-600 hover:!bg-gray-500"><FontAwesomeIcon icon={faCrosshairs}/></Button></Tooltip>
          <Tooltip content="Twist Right" placement="top"><Button onClick={() => handleCoreControlClick(coreControlActions[3])} className="!p-1.5"><FontAwesomeIcon icon={faRedo}/></Button></Tooltip>
          <Tooltip content="Bend Left" placement="top"><Button onClick={() => handleCoreControlClick(coreControlActions[4])} className="!p-1.5"><FontAwesomeIcon icon={faArrowLeft}/></Button></Tooltip>
          <Tooltip content="Bend Backward" placement="top"><Button onClick={() => handleCoreControlClick(coreControlActions[5])} className="!p-1.5"><FontAwesomeIcon icon={faArrowDown}/></Button></Tooltip>
          <Tooltip content="Bend Right" placement="top"><Button onClick={() => handleCoreControlClick(coreControlActions[6])} className="!p-1.5"><FontAwesomeIcon icon={faArrowRight}/></Button></Tooltip>
        </div>
        <p className="text-xxs text-gray-500 mt-2 italic">(Controls affect Spine/Shoulders)</p>
      </div>
    </div>
  );
};

CoreDynamicsVisualizer.propTypes = {
  fullPoseState: PropTypes.object.isRequired,
  onCoreInputChange: PropTypes.func.isRequired,
  beatGrounding: PropTypes.object,
  className: PropTypes.string,
};

export default CoreDynamicsVisualizer;
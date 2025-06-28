// [FINAL FIX] src/components/core/pose_editor/CoreDynamicsVisualizer.jsx

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

  const coreState = useMemo(() => {
    const { coil, energy } = getCoreState(fullPoseState);
    const { SPIN_L } = fullPoseState || {};
    let bendTwistDirection = "Neutral";
    
    if (SPIN_L?.orientation === 'FLEX') bendTwistDirection = "Bend Forward";
    else if (SPIN_L?.orientation === 'EXT') bendTwistDirection = "Bend Backward";
    else if (SPIN_L?.orientation === 'L_BEND') bendTwistDirection = "Bend Left";
    else if (SPIN_L?.orientation === 'R_BEND') bendTwistDirection = "Bend Right";
    else if (Math.abs(coil) > 0.1) bendTwistDirection = coil > 0 ? "Twist Right" : "Twist Left";
    
    let stability = 35;
    const isLPlanted = beatGrounding?.L && beatGrounding.L.length > 0;
    const isRPlanted = beatGrounding?.R && beatGrounding.R.length > 0;
    if (isLPlanted && isRPlanted) {
        const isLFullPlant = beatGrounding.L.some(p => p.includes('123'));
        const isRFullPlant = beatGrounding.R.some(p => p.includes('123'));
        stability = isLFullPlant && isRFullPlant ? 100 : 85;
    } else if (isLPlanted || isRPlanted) {
        stability = 65;
    }

    return { bendTwistDirection, stability, coil, energy };
  }, [fullPoseState, beatGrounding]);

  const atomSphereState = useMemo(() => {
    const { coil, energy } = coreState;
    if (energy < 0.1) return 'neutral';
    if (energy > 0.8) return 'coiled_max';
    if (coil > 0.2) return 'coiled_out';
    if (coil < -0.2) return 'coiled_in';
    return 'neutral';
  }, [coreState]);

  const coreControlActions = [
    { label: 'Forward Bend', icon: faArrowUp, action: 'CORE_BEND_FWD', joint: 'SPIN_L', prop: 'orientation', val: 'FLEX'},
    { label: 'Twist Left', icon: faUndo, action: 'CORE_TWIST_L', joint: 'LS', prop: 'rotation', val: -45}, 
    { label: 'Center Core', icon: faCrosshairs, action: 'CORE_RESET'}, 
    { label: 'Twist Right', icon: faRedo, action: 'CORE_TWIST_R', joint: 'LS', prop: 'rotation', val: 45},
    { label: 'Bend Left', icon: faArrowLeft, action: 'CORE_BEND_L', joint: 'SPIN_L', prop: 'orientation', val: 'L_BEND'},
    { label: 'Backward Bend', icon: faArrowDown, action: 'CORE_BEND_BWD', joint: 'SPIN_L', prop: 'orientation', val: 'EXT'},
    { label: 'Bend Right', icon: faArrowRight, action: 'CORE_BEND_R', joint: 'SPIN_L', prop: 'orientation', val: 'R_BEND'},
  ];

  const handleCoreControlClick = (control) => {
    if (onCoreInputChange) {
      if (control.action === 'CORE_RESET') {
        onCoreInputChange('PELV', 'rotation', 0);
        onCoreInputChange('SPIN_L', 'orientation', 'NEU');
        onCoreInputChange('LS', 'rotation', 0);
        onCoreInputChange('RS', 'rotation', 0);
      } else {
        onCoreInputChange(control.joint, control.prop, control.val);
      }
    }
  };
  
  const sphereColors = {
    neutral: '#3b82f6', // blue-500
    coiled_in: '#f97316', // orange-500
    coiled_out: '#ef4444', // red-500
    coiled_max: '#b91c1c', // red-700
  };
  const sphereColor = sphereColors[atomSphereState] || '#6b7280';
  
  const coreX = coreState.coil * 20;
  const coreY = 0;
  const energyScale = 1 + coreState.energy * 0.4;

  return (
    <div className={`p-3 border border-yellow-500/50 rounded-lg bg-gray-800/70 shadow-xl text-center flex flex-col items-center justify-between h-full backdrop-blur-sm ${className}`}>
      <div className="flex-shrink-0 w-full">
        <h4 className="text-sm font-semibold text-pos-yellow font-orbitron">Core Dynamics</h4>
      </div>
      
      <div className="flex-grow w-full flex items-center justify-center">
        <svg viewBox="-60 -60 120 120" className="w-full h-auto max-w-[180px] aspect-square">
          <defs>
            <radialGradient id="energyGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
              <stop offset="100%" stopColor={sphereColor} />
            </radialGradient>
          </defs>
          <circle cx="-40" cy="-40" r="5" fill="#e5e7eb" opacity="0.5" /><text x="-40" y="-50" fill="#9ca3af" fontSize="8" textAnchor="middle">LS</text>
          <circle cx="40" cy="-40" r="5" fill="#e5e7eb" opacity="0.5" /><text x="40" y="-50" fill="#9ca3af" fontSize="8" textAnchor="middle">RS</text>
          <circle cx="-40" cy="40" r="5" fill="#e5e7eb" opacity="0.5" /><text x="-40" y="55" fill="#9ca3af" fontSize="8" textAnchor="middle">LH</text>
          <circle cx="40" cy="40" r="5" fill="#e5e7eb" opacity="0.5" /><text x="40" y="55" fill="#9ca3af" fontSize="8" textAnchor="middle">RH</text>
          <line x1="-40" y1="-40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="40" y1="-40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="-40" y1="40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="40" y1="40" x2={coreX} y2={coreY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <g style={{ transform: `translate(${coreX}px, ${coreY}px) scale(${energyScale})` }}>
            <circle cx="0" cy="0" r="15" fill="url(#energyGradient)" stroke={sphereColor} strokeWidth="1.5" />
            <g transform="translate(-8, -8)">
                <FontAwesomeIcon icon={faArrowsSpin} color="white" opacity="0.7" width="16" height="16" />
            </g>
          </g>
        </svg>
      </div>
      
      <div className="text-xs text-center flex-shrink-0 w-full">
        <p className="text-gray-400 mb-0.5">Energy/Coil: <span className="font-semibold text-gray-200">{Math.round(coreState.energy*100)}% / {Math.round(coreState.coil*100)}%</span></p>
        <p className="text-gray-400 mb-0.5">Direction: <span className="font-semibold text-gray-200">{coreState.bendTwistDirection}</span></p>
        <p className="text-gray-400 mb-2">Ground Stability: <span className="font-semibold text-gray-200">{coreState.stability}%</span></p>
      </div>
      
      <div className="w-full max-w-[200px] flex-shrink-0">
        <div className="grid grid-cols-4 gap-1">
          {coreControlActions.map(control => (
            // [FIXED] The key prop is applied to the top-level element in the map, which is the Tooltip.
            <Tooltip content={control.label} placement="top" key={control.action}>
              <Button 
                  onClick={() => handleCoreControlClick(control)} 
                  variant="secondary" 
                  className={`!p-1.5 ${control.action === 'CORE_RESET' ? 'col-start-2 col-span-2 !bg-gray-600 hover:!bg-gray-500' : '!bg-gray-700 hover:!bg-gray-600'}`}
              >
                <FontAwesomeIcon icon={control.icon} />
              </Button>
            </Tooltip>
          ))}
        </div>
        <p className="text-xxs text-gray-500 mt-2 italic">(Controls affect Shoulders/Spine)</p>
      </div>
    </div>
  );
};

CoreDynamicsVisualizer.propTypes = {
  fullPoseState: PropTypes.object.isRequired,
  onCoreInputChange: PropTypes.func.isRequired,
  beatGrounding: PropTypes.shape({ L: PropTypes.arrayOf(PropTypes.string), R: PropTypes.arrayOf(PropTypes.string) }),
  className: PropTypes.string,
};

export default CoreDynamicsVisualizer;
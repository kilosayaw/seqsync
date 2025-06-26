// src/components/core/pose_editor/CoreDynamicsVisualizer.jsx

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsSpin, faCrosshairs, faUndo, faRedo, faArrowUp, faArrowDown, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import { getCoreState } from '../../../utils/biomechanics';

const CoreDynamicsVisualizer = ({ fullPoseState, onCoreInputChange, beatGrounding }) => {

  // --- [UPGRADED] ---
  // The coreState logic is now derived entirely from the biomechanics engine.
  // This memoized calculation will only re-run when the pose or grounding changes.
  const coreState = useMemo(() => {
    // 1. Get the primary energy/coil state from the biomechanics engine.
    // It requires the full pose state to understand shoulder/hip relationships.
    const { coil, energy } = getCoreState(fullPoseState);
    
    // 2. Determine the descriptive direction based on current pose data.
    // This logic remains to provide human-readable text labels.
    const { PELV, SPIN_L, LS, RS } = fullPoseState || {};
    let bendTwistDirection = "Neutral";
    
    if (SPIN_L?.orientation === 'FLEX') {
      bendTwistDirection = "Bend Forward";
    } else if (SPIN_L?.orientation === 'EXT') {
      bendTwistDirection = "Bend Backward";
    } else if (SPIN_L?.orientation === 'L_BEND') {
      bendTwistDirection = "Bend Left";
    } else if (SPIN_L?.orientation === 'R_BEND') {
      bendTwistDirection = "Bend Right";
    } else if (Math.abs(coil) > 0.1) { // Direction is primarily twist
      // coil > 0 means shoulders are twisted right relative to hips.
      bendTwistDirection = coil > 0 ? "Twist Right" : "Twist Left";
    }
    
    // 3. Calculate stability based on grounding.
    // A full plant on both feet is most stable. One foot is less. No feet is least stable.
    let stability = 35; // Default for no grounding
    const isLPlanted = beatGrounding?.L && beatGrounding.L.length > 0;
    const isRPlanted = beatGrounding?.R && beatGrounding.R.length > 0;

    if (isLPlanted && isRPlanted) {
        // Bonus for "full plant" on both feet
        const isLFullPlant = beatGrounding.L.some(p => p.includes('123'));
        const isRFullPlant = beatGrounding.R.some(p => p.includes('123'));
        stability = isLFullPlant && isRFullPlant ? 100 : 85;
    } else if (isLPlanted || isRPlanted) {
        stability = 65;
    }

    return { 
      bendTwistDirection,
      stability,
      coil,  // Raw coil value [-1, 1]
      energy // Raw energy value [0, 1]
    };
  }, [fullPoseState, beatGrounding]);

  // --- [NEW] ---
  // This separate memo determines the specific CSS class for the sphere.
  // It translates the raw `coil` and `energy` values into your descriptive states.
  const atomSphereState = useMemo(() => {
    const { coil, energy } = coreState;
    if (energy < 0.1) return 'neutral';
    if (energy > 0.8) return 'coiled_max';
    if (coil > 0.1) return 'coiled_out'; // Shoulders twisted right
    if (coil < -0.1) return 'coiled_in'; // Shoulders twisted left
    // Add logic for braced states if needed, based on spine orientation
    // For now, coil/energy is the primary driver.
    return 'neutral'; // Fallback
  }, [coreState]);


  // --- Your existing control logic (UNCHANGED) ---
  const coreControlActions = [
    { label: 'Forward Bend (Trunk Flexion)', icon: faArrowUp, action: 'CORE_BEND_FWD', joint: 'SPIN_L', prop: 'orientation', val: 'FLEX'},
    { label: 'Twist Left (Shoulders vs Hips)', icon: faUndo, action: 'CORE_TWIST_L', joint: 'LS', prop: 'rotation', val: -45}, 
    { label: 'Center Core Alignment', icon: faCrosshairs, action: 'CORE_RESET'}, 
    { label: 'Twist Right (Shoulders vs Hips)', icon: faRedo, action: 'CORE_TWIST_R', joint: 'LS', prop: 'rotation', val: 45},
    { label: 'Lateral Bend Left (Trunk)', icon: faArrowLeft, action: 'CORE_BEND_L', joint: 'SPIN_L', prop: 'orientation', val: 'L_BEND'},
    { label: 'Backward Bend (Trunk Extension)', icon: faArrowDown, action: 'CORE_BEND_BWD', joint: 'SPIN_L', prop: 'orientation', val: 'EXT'},
    { label: 'Lateral Bend Right (Trunk)', icon: faArrowRight, action: 'CORE_BEND_R', joint: 'SPIN_L', prop: 'orientation', val: 'R_BEND'},
  ];

  const handleCoreControlClick = (control) => {
    if (onCoreInputChange) {
      if (control.action === 'CORE_RESET') {
        // Reset all core components for a true neutral state
        onCoreInputChange('PELV', 'rotation', 0);
        onCoreInputChange('SPIN_L', 'orientation', 'NEU');
        onCoreInputChange('LS', 'rotation', 0);
        onCoreInputChange('RS', 'rotation', 0);
      } else {
        onCoreInputChange(control.joint, control.prop, control.val);
      }
    }
  };
  
  // --- Your existing render logic (with one minor dynamic style update) ---
  const sphereColors = {
    neutral: 'bg-blue-500/80 shadow-md',
    coiled_in: 'bg-orange-500/90 ring-2 ring-orange-300 animate-pulse shadow-lg',
    coiled_out: 'bg-red-500/90 ring-2 ring-red-300 animate-pulse shadow-lg',
    coiled_max: 'bg-red-700/90 ring-4 ring-red-400 animate-pulse shadow-xl',
    default: 'bg-gray-600/60'
  };
  const sphereDynamicClass = sphereColors[atomSphereState] || sphereColors.default;
  const sphereScale = 1 + (coreState.energy * 0.25);

  return (
    <div className="p-3 border border-gray-700/80 rounded-lg bg-gray-800/60 shadow-xl text-center">
      <h4 className="text-sm font-semibold text-pos-yellow mb-2 font-orbitron">Core Dynamics</h4>
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto bg-gray-900/30 rounded-lg mb-3 flex items-center justify-center border-2 border-gray-600/50 overflow-hidden shadow-inner">
          <div className="absolute top-1 left-1 text-xxs text-gray-500 font-mono">LS</div>
          <div className="absolute top-1 right-1 text-xxs text-gray-500 font-mono">RS</div>
          <div className="absolute bottom-1 left-1 text-xxs text-gray-500 font-mono">LH</div>
          <div className="absolute bottom-1 right-1 text-xxs text-gray-500 font-mono">RH</div>
          
          <div 
            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative z-10 ${sphereDynamicClass}`} 
            style={{ transform: `scale(${sphereScale}) translateX(${coreState.coil * 10}px)` }} // [UPGRADED] Apply dynamic scale and coil-based translation
            title={`Energy: ${Math.round(coreState.energy*100)}% | Coil: ${Math.round(coreState.coil*100)}%`}
          >
            <FontAwesomeIcon icon={faArrowsSpin} className="text-lg sm:text-xl text-white/90" />
          </div>
          <FontAwesomeIcon icon={faCrosshairs} className="absolute text-gray-600/50 text-5xl pointer-events-none" />
      </div>
      <p className="text-xs text-gray-400 mb-0.5">Energy/Coil: <span className="font-semibold text-gray-200">{Math.round(coreState.energy*100)}% / {Math.round(coreState.coil*100)}%</span></p>
      <p className="text-xs text-gray-400 mb-0.5">Direction: <span className="font-semibold text-gray-200">{coreState.bendTwistDirection}</span></p>
      <p className="text-xs text-gray-400 mb-2">Ground Stability: <span className="font-semibold text-gray-200">{coreState.stability}%</span></p>
      
      <div className="grid grid-cols-4 gap-1 mt-2 max-w-xs mx-auto">
        {coreControlActions.map(control => (
          <Tooltip content={control.label} placement="top" key={control.action}>
            <Button 
                onClick={() => handleCoreControlClick(control)} 
                variant="secondary" 
                className={`!p-1.5 sm:!p-2 ${control.action === 'CORE_RESET' ? 'col-start-2 col-span-2 !bg-gray-600 hover:!bg-gray-500' : '!bg-gray-700 hover:!bg-gray-600'}`}
            >
              <FontAwesomeIcon icon={control.icon} />
            </Button>
          </Tooltip>
        ))}
      </div>
      <p className="text-xxs text-gray-500 mt-2 italic">(Controls affect Shoulders/Spine)</p>
    </div>
  );
};

CoreDynamicsVisualizer.propTypes = {
  // [UPGRADED] This component now needs the full pose state to calculate relationships
  fullPoseState: PropTypes.object.isRequired,
  onCoreInputChange: PropTypes.func.isRequired,
  beatGrounding: PropTypes.shape({ 
      L: PropTypes.arrayOf(PropTypes.string), 
      R: PropTypes.arrayOf(PropTypes.string) 
  }),
};

export default CoreDynamicsVisualizer;
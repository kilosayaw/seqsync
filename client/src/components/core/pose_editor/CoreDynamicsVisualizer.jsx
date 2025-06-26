// src/components/core/pose_editor/CoreDynamicsVisualizer.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowsSpin, faCrosshairs, faUndo, faRedo, 
    faArrowUp, faArrowDown, faArrowLeft, faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button'; // Assuming Button component exists
import Tooltip from '../../common/Tooltip'; // For tooltips on controls

const CoreDynamicsVisualizer = ({ coreJointData, onCoreInputChange, beatGrounding }) => {
  const coreState = useMemo(() => {
    let bendTwistDirection = "Neutral";
    let atomSphereState = "neutral";
    let stability = 50;

    const pelvisRotationZ = coreJointData?.PELV?.rotation || 0;
    const lumbarOrientation = coreJointData?.SPIN_L?.orientation;

    if (Math.abs(pelvisRotationZ) > 10) { // Adjusted threshold slightly
      atomSphereState = Math.abs(pelvisRotationZ) > 40 ? 'coiled_max' : 'coiled_out';
      bendTwistDirection = pelvisRotationZ > 0 ? "Twist Right" : "Twist Left";
    }

    if (lumbarOrientation === 'FLEX') {
      bendTwistDirection = "Bend Forward";
      atomSphereState = coreState.atomSphereState === 'neutral' ? 'coiled_in' : `${coreState.atomSphereState}_flex`;
    } else if (lumbarOrientation === 'EXT') {
      bendTwistDirection = "Bend Backward";
      atomSphereState = coreState.atomSphereState === 'neutral' ? 'coiled_out' : `${coreState.atomSphereState}_ext`;
    } else if (lumbarOrientation === 'L_BEND') {
      bendTwistDirection = "Bend Left";
      atomSphereState = coreState.atomSphereState === 'neutral' ? 'braced_left' : `${coreState.atomSphereState}_lbend`;
    } else if (lumbarOrientation === 'R_BEND') {
      bendTwistDirection = "Bend Right";
      atomSphereState = coreState.atomSphereState === 'neutral' ? 'braced_right' : `${coreState.atomSphereState}_rbend`;
    }
    
    if (beatGrounding?.L && beatGrounding?.R) stability = 85;
    else if (beatGrounding?.L || beatGrounding?.R) stability = 65;
    else stability = 35;

    return { bendTwistDirection, atomSphereState, stability };
  }, [coreJointData, beatGrounding]);

  const coreControlActions = [
    { label: 'Forward Bend (Trunk Flexion)', icon: faArrowUp, action: 'CORE_BEND_FWD', joint: 'SPIN_L', prop: 'orientation', val: 'FLEX_TRUNK'}, // More specific key
    { label: 'Twist Left (Pelvis Rotate Left)', icon: faUndo, action: 'CORE_TWIST_L', joint: 'PELV', prop: 'rotation', val: -45}, 
    { label: 'Center Core Alignment', icon: faCrosshairs, action: 'CORE_RESET'}, 
    { label: 'Twist Right (Pelvis Rotate Right)', icon: faRedo, action: 'CORE_TWIST_R', joint: 'PELV', prop: 'rotation', val: 45},
    { label: 'Lateral Bend Left (Trunk)', icon: faArrowLeft, action: 'CORE_BEND_L', joint: 'SPIN_L', prop: 'orientation', val: 'L_BEND_TRUNK'},
    { label: 'Backward Bend (Trunk Extension)', icon: faArrowDown, action: 'CORE_BEND_BWD', joint: 'SPIN_L', prop: 'orientation', val: 'EXT_TRUNK'},
    { label: 'Lateral Bend Right (Trunk)', icon: faArrowRight, action: 'CORE_BEND_R', joint: 'SPIN_L', prop: 'orientation', val: 'R_BEND_TRUNK'},
  ];

  const handleCoreControlClick = (control) => {
    if (onCoreInputChange) {
      if (control.action === 'CORE_RESET') {
        onCoreInputChange('PELV', 'rotation', 0);
        onCoreInputChange('SPIN_L', 'orientation', 'NEU'); // Assuming NEU is neutral for spine
        // Potentially reset SPIN_T as well if it's part of core controls
      } else {
        onCoreInputChange(control.joint, control.prop, control.val);
      }
    }
  };

  const sphereColors = {
    neutral: 'bg-blue-500/80 shadow-md',
    coiled_in: 'bg-orange-500/90 ring-2 ring-orange-300 animate-pulse shadow-lg scale-90',
    coiled_out: 'bg-red-500/90 ring-2 ring-red-300 animate-pulse shadow-lg scale-110',
    coiled_max: 'bg-red-700/90 ring-2 ring-red-400 animate-pulse shadow-xl scale-125',
    braced_left: 'bg-purple-500/80 shadow-lg ring-1 ring-purple-300 transform -translate-x-1',
    braced_right: 'bg-purple-500/80 shadow-lg ring-1 ring-purple-300 transform translate-x-1',
    // Add combination states if needed, e.g. coiled_out_flex
    default: 'bg-gray-600/60'
  };
  const sphereDynamicClass = sphereColors[coreState.atomSphereState] || sphereColors.default;

  return (
    <div className="p-3 border border-gray-700/80 rounded-lg bg-gray-800/60 shadow-xl text-center">
      <h4 className="text-sm font-semibold text-pos-yellow mb-2 font-orbitron">Core Dynamics</h4>
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto bg-gray-900/30 rounded-lg mb-3 flex items-center justify-center border-2 border-gray-600/50 overflow-hidden shadow-inner">
          {/* Guide dots and labels */}
          <div className="absolute top-1 left-1 text-xxs text-gray-500 font-mono">LS</div>
          <div className="absolute top-1 right-1 text-xxs text-gray-500 font-mono">RS</div>
          <div className="absolute bottom-1 left-1 text-xxs text-gray-500 font-mono">LH</div>
          <div className="absolute bottom-1 right-1 text-xxs text-gray-500 font-mono">RH</div>
          
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative z-10 ${sphereDynamicClass}`} title={`Core State: ${coreState.atomSphereState}`}>
            <FontAwesomeIcon icon={faArrowsSpin} className="text-lg sm:text-xl text-white/90" />
          </div>
          <FontAwesomeIcon icon={faCrosshairs} className="absolute text-gray-600/50 text-5xl pointer-events-none" />
      </div>
      <p className="text-xs text-gray-400 mb-0.5">State: <span className="font-semibold text-gray-200">{coreState.atomSphereState}</span></p>
      <p className="text-xs text-gray-400 mb-0.5">Direction: <span className="font-semibold text-gray-200">{coreState.bendTwistDirection}</span></p>
      <p className="text-xs text-gray-400 mb-2">Ground Stability: <span className="font-semibold text-gray-200">{coreState.stability}%</span></p>
      
      <div className="grid grid-cols-4 gap-1 mt-2 max-w-xs mx-auto">
        {coreControlActions.map(control => (
          <Tooltip content={control.label} placement="top" key={control.action}>
            <Button 
                onClick={() => handleCoreControlClick(control)} 
                variant="secondary" 
                className={`!p-1.5 sm:!p-2 ${control.action === 'CORE_RESET' ? 'col-start-2 col-span-2 !bg-gray-600 hover:!bg-gray-500' : '!bg-gray-700 hover:!bg-gray-600'}`}
                // title prop handled by Tooltip
            >
              <FontAwesomeIcon icon={control.icon} />
            </Button>
          </Tooltip>
        ))}
      </div>
      <p className="text-xxs text-gray-500 mt-2 italic">(Controls affect Pelvis/Lumbar Spine)</p>
    </div>
  );
};

CoreDynamicsVisualizer.propTypes = {
  coreJointData: PropTypes.object,
  onCoreInputChange: PropTypes.func.isRequired,
  beatGrounding: PropTypes.shape({ L: PropTypes.arrayOf(PropTypes.string), R: PropTypes.arrayOf(PropTypes.string) }), // Assuming groundPoints is an array
};
// Ensure beatGrounding prop type matches expected data (array of strings or single string)

export default CoreDynamicsVisualizer;
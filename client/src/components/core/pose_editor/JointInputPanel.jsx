// [UPGRADED] src/components/core/pose_editor/JointInputPanel.jsx

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import KneeJoystick from './KneeJoystick';
import RotationKnob from '../../common/RotationKnob';
import Button from '../../common/Button';
import { calculateKneeBounds } from '../../../utils/biomechanics';
import { BIOMECHANICAL_CONSTANTS, POSE_DEFAULT_VECTOR, ENERGY_LEVEL_LABELS } from '../../../utils/constants';

export const JointInputPanel = ({
  jointAbbrev,
  jointData = {},
  footGrounding = null,
  onClose,
  onUpdate,
  liveRotation,
  onLiveRotationChange,
}) => {
  const { 
    vector = POSE_DEFAULT_VECTOR, 
    rotation = 0, 
    extension = 0,
    energy = 50 // Default to 50 if not present
  } = jointData || {};
  
  const isKneeJoint = jointAbbrev === 'LK' || jointAbbrev === 'RK';
  const isFootJoint = jointAbbrev === 'LF' || jointAbbrev === 'RF';

  const bounds = useMemo(() => {
    if (isKneeJoint) return calculateKneeBounds(footGrounding);
    return BIOMECHANICAL_CONSTANTS.KNEE_BOUNDS.DEFAULT;
  }, [isKneeJoint, footGrounding]);

  useEffect(() => {
    if (isFootJoint) {
      onLiveRotationChange({ jointAbbrev, value: rotation });
    }
    return () => {
      if (isFootJoint && liveRotation) {
        onUpdate(jointAbbrev, 'rotation', liveRotation.value);
      }
      onLiveRotationChange(null);
    };
  }, []);

  const handleVectorChange = (newVector) => onUpdate(jointAbbrev, 'vector', newVector);
  
  const handleRotationChange = (newRotation) => {
    if (isFootJoint) {
      onLiveRotationChange({ jointAbbrev, value: newRotation });
    } else {
      onUpdate(jointAbbrev, 'rotation', newRotation);
    }
  };

  const handleFlexionChange = (e) => onUpdate(jointAbbrev, 'extension', parseFloat(e.target.value));
  const handleEnergyChange = (e) => onUpdate(jointAbbrev, 'energy', parseInt(e.target.value, 10));

  const setMaxInternalRotation = () => handleRotationChange(BIOMECHANICAL_CONSTANTS.HIP_ROTATION.DEFAULT_MIN);
  const setMaxExternalRotation = () => handleRotationChange(BIOMECHANICAL_CONSTANTS.HIP_ROTATION.DEFAULT_MAX);

  const knobValue = (isFootJoint && liveRotation?.jointAbbrev === jointAbbrev) ? liveRotation.value : rotation;
  
  const energyLabel = energy <= 33 ? ENERGY_LEVEL_LABELS.LOW : (energy <= 66 ? ENERGY_LEVEL_LABELS.MEDIUM : ENERGY_LEVEL_LABELS.HIGH);

  return (
    <div className="w-full bg-gray-900/80 border border-yellow-500/50 rounded-lg p-3 space-y-4 mt-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-pos-yellow">Edit: {jointAbbrev}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><FontAwesomeIcon icon={faTimes} /></button>
      </div>

      {isKneeJoint ? ( <KneeJoystick initialVector={vector} onVectorChange={handleVectorChange} bounds={bounds} /> ) : (
        <div className="space-y-2 text-center text-gray-400 p-4 bg-gray-800/50 rounded-md">
          <p className="text-sm">Standard Joint Controls</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center space-y-2">
           <label className="text-sm font-semibold text-gray-300">Rotation</label>
           <RotationKnob value={knobValue} onChange={handleRotationChange} size={64} />
           <div className="flex items-center gap-2">
             <Button onClick={setMaxInternalRotation} variant="secondary" size="xs">IN</Button>
             <Button onClick={setMaxExternalRotation} variant="secondary" size="xs">OUT</Button>
           </div>
        </div>
        <div className="flex-1 space-y-2">
           <label htmlFor="flexion-slider" className="text-sm font-semibold text-gray-300">Flexion/Ext</label>
           <input id="flexion-slider" type="range" min="0" max="1" step="0.01" value={extension} onChange={handleFlexionChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
           <div className="text-center text-xs text-gray-400">{(extension * 100).toFixed(0)}%</div>
        </div>
      </div>
      
      {/* [NEW] Energy Slider */}
      <div className="space-y-2">
        <label htmlFor="energy-slider" className="text-sm font-semibold text-gray-300">Energy/Involvement</label>
        <input id="energy-slider" type="range" min="0" max="100" step="1" value={energy} onChange={handleEnergyChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
        <div className="text-center text-xs text-gray-400">{energyLabel} ({energy}%)</div>
      </div>
    </div>
  );
};

JointInputPanel.propTypes = {
  jointAbbrev: PropTypes.string.isRequired,
  jointData: PropTypes.object,
  footGrounding: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  liveRotation: PropTypes.object,
  onLiveRotationChange: PropTypes.func,
};

export default JointInputPanel;
// [UPGRADED] src/components/core/pose_editor/JointInputPanel.jsx
import React, { useMemo } from 'react'; // Added useMemo
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import KneeJoystick from './KneeJoystick';
import RotationKnob from '../../common/RotationKnob';
// This component should be used for non-knee joints
// import FootJoystickOverlay from '../../common/FootJoystickOverlay'; 
import { calculateKneeBounds } from '../../../utils/biomechanics';
import { BIOMECHANICAL_CONSTANTS } from '../../../utils/constants'; // Import constants for default bounds

export const JointInputPanel = ({
  jointAbbrev,
  jointData = {},
  footGrounding = null,
  onClose,
  onUpdate,
}) => {
  const { vector = {x:0, y:0, z:0}, rotation = 0, extension = 0 } = jointData || {};
  
  const isKneeJoint = jointAbbrev === 'LK' || jointAbbrev === 'RK';

  // [FIX] Memoize the bounds calculation and provide a default.
  // This ensures `bounds` is never undefined.
  const bounds = useMemo(() => {
    if (isKneeJoint) {
      return calculateKneeBounds(footGrounding);
    }
    // For non-knee joints, provide a default, unconstrained boundary.
    return BIOMECHANICAL_CONSTANTS.KNEE_BOUNDS.DEFAULT; 
  }, [isKneeJoint, footGrounding]);


  const handleVectorChange = (newVector) => {
    onUpdate(jointAbbrev, 'vector', newVector);
  };
  
  const handleRotationChange = (newRotation) => {
    onUpdate(jointAbbrev, 'rotation', newRotation);
  };

  const handleFlexionChange = (e) => {
    onUpdate(jointAbbrev, 'extension', parseFloat(e.target.value));
  };

  return (
    <div className="w-full bg-gray-900/80 border border-yellow-500/50 rounded-lg p-3 space-y-4 mt-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-pos-yellow">Edit: {jointAbbrev}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* [FIX] The logic now correctly shows the KneeJoystick ONLY for knee joints */}
      {isKneeJoint ? (
        <KneeJoystick 
          initialVector={vector}
          onVectorChange={handleVectorChange}
          bounds={bounds} // This is now guaranteed to be a valid object
        />
      ) : (
        <div className="space-y-2 text-center text-gray-400 p-4 bg-gray-800/50 rounded-md">
          <p className="text-sm">Standard Joint Controls</p>
          <p className="text-xs italic">(Positional control via video overlay or future 3D view)</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center space-y-2">
           <label className="text-sm font-semibold text-gray-300">Rotation</label>
           <RotationKnob value={rotation} onChange={handleRotationChange} size={64} />
        </div>
        <div className="flex-1 space-y-2">
           <label htmlFor="flexion-slider" className="text-sm font-semibold text-gray-300">Flexion/Ext</label>
           <input
             id="flexion-slider"
             type="range"
             min="0"
             max="1"
             step="0.01"
             value={extension}
             onChange={handleFlexionChange}
             className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
           />
           <div className="text-center text-xs text-gray-400">{(extension * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
};

JointInputPanel.propTypes = {
  jointAbbrev: PropTypes.string.isRequired,
  jointData: PropTypes.object,
  footGrounding: PropTypes.array, // Can be null or array
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
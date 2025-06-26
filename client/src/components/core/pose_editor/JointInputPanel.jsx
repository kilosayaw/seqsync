// src/components/core/pose_editor/JointInputPanel.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import KneeJoystick from './KneeJoystick';

// ==============================================================================
// == ACTION REQUIRED: One of these import blocks is correct. The others are not. ==
// == Please uncomment one block at a time until the error for this file goes away. ==
// == Once you find the working block, delete all the other commented-out blocks. ==
// ==============================================================================

/* --- OPTION 1: If 'common' is a sibling of 'core' (Most Likely) --- */
import RotationKnob from '../../common/RotationKnob';
import FootJoystickOverlay from '../../common/FootJoystickOverlay';
import { calculateKneeBounds } from '../../../utils/biomechanics';

/* --- OPTION 2: If 'common' is inside 'core' --- */
// import RotationKnob from '../common/RotationKnob';
// import FootJoystickOverlay from '../common/FootJoystickOverlay';
// import { calculateKneeBounds } from '../../../utils/biomechanics'; // This path for utils would likely still be correct

/* --- OPTION 3: If 'common' is at the root of 'src' --- */
// import RotationKnob from '../../../common/RotationKnob';
// import FootJoystickOverlay from '../../../common/FootJoystickOverlay';
// import { calculateKneeBounds } from '../../../utils/biomechanics';


export const JointInputPanel = ({
  jointAbbrev,
  jointData = {},
  footGrounding = null,
  onClose,
  onUpdate,
}) => {
  const { vector = {x:0, y:0, z:0}, rotation = 0, extension = 0 } = jointData || {};
  
  const isKneeJoint = jointAbbrev === 'LK' || jointAbbrev === 'RK';

  const handleVectorChange = (newVector) => {
    onUpdate(jointAbbrev, 'vector', newVector);
  };
  
  const handleRotationChange = (newRotation) => {
    onUpdate(jointAbbrev, 'rotation', newRotation);
  };

  const handleFlexionChange = (e) => {
    onUpdate(jointAbbrev, 'extension', parseFloat(e.target.value));
  };

  // This part of the logic remains the same
  const kneeBounds = isKneeJoint ? calculateKneeBounds(footGrounding) : null;

  return (
    <div className="w-full bg-gray-900/80 border border-yellow-500/50 rounded-lg p-3 space-y-4 mt-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-pos-yellow">Edit: {jointAbbrev}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {isKneeJoint ? (
        <KneeJoystick 
          initialVector={vector}
          onVectorChange={handleVectorChange}
          bounds={kneeBounds}
        />
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Position (X, Y)</label>
          <div className="w-full aspect-square relative">
            {/* This component may need its own onVectorChange prop added */}
            <FootJoystickOverlay 
              side="L" 
              onVectorChange={handleVectorChange}
              initialVector={vector}
            />
          </div>
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
  footGrounding: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
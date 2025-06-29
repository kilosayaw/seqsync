// src/components/studio/pose_editor/JointInputPanel.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import RotationKnob from '../../common/RotationKnob';
import VectorInputGrid from './VectorInputGrid'; // <-- IMPORT

export const JointInputPanel = ({ jointAbbrev, jointData = {}, onClose, onUpdate }) => {
  const { vector, rotation = 0, extension = 0 } = jointData;

  return (
    <div className="w-full bg-gray-900/80 border border-yellow-500/50 rounded-lg p-3 space-y-3 mt-4 animate-fade-in-fast">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-md text-yellow-400">Edit: {jointAbbrev}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><FontAwesomeIcon icon={faTimes} /></button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-center text-gray-400">Position</p>
        <VectorInputGrid vector={vector} onVectorChange={(v) => onUpdate(jointAbbrev, 'vector', v)} />
      </div>

      <div className="flex items-center justify-around gap-4 pt-3 border-t border-gray-700">
        <div className="flex-1 flex flex-col items-center space-y-1">
           <label className="text-sm font-semibold text-gray-300">Rotation</label>
           <RotationKnob value={rotation} onChange={(v) => onUpdate(jointAbbrev, 'rotation', v)} size={60} />
        </div>
        <div className="flex-1 space-y-1">
           <label htmlFor="flexion-slider" className="text-sm font-semibold text-gray-300">Flexion/Ext</label>
           <input id="flexion-slider" type="range" min="0" max="1" step="0.01" value={extension} onChange={(e) => onUpdate(jointAbbrev, 'extension', parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
           <div className="text-center text-xs text-gray-400">{(extension * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
};

JointInputPanel.propTypes = {
  jointAbbrev: PropTypes.string.isRequired,
  jointData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
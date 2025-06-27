import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import {
  POSE_DEFAULT_VECTOR,
  GENERAL_ORIENTATION_OPTIONS,
  INTENT_OPTIONS,
  ALL_JOINTS_MAP,
} from '../../../utils/constants';

// A reusable input component for vector/rotation values
const NumberInput = ({ label, value, onChange, min, max, step }) => (
  <div className="flex flex-col">
    <label className="text-xs text-gray-400 mb-1">{label}</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className="bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm focus:ring-2 focus:ring-pos-yellow focus:border-pos-yellow"
    />
  </div>
);

// A reusable dropdown component
const SelectInput = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-xs text-gray-400 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm focus:ring-2 focus:ring-pos-yellow focus:border-pos-yellow"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);


export const JointInputPanel = ({ jointAbbrev, jointData, onClose, onUpdate }) => {
  if (!jointAbbrev) return null;

  // Ensure we have a valid data structure to work with, using defaults if necessary
  const safeData = {
    vector: jointData?.vector || { ...POSE_DEFAULT_VECTOR },
    rotation: jointData?.rotation || 0,
    orientation: jointData?.orientation || 'NEU',
    intent: jointData?.intent || 'Transition',
  };

  const handleVectorChange = (axis, value) => {
    const newVector = { ...safeData.vector, [axis]: parseFloat(value) || 0 };
    onUpdate(jointAbbrev, 'vector', newVector);
  };

  const handleRotationChange = (e) => {
    onUpdate(jointAbbrev, 'rotation', parseInt(e.target.value, 10) || 0);
  };

  const handleOrientationChange = (e) => {
    onUpdate(jointAbbrev, 'orientation', e.target.value);
  };
  
  const handleIntentChange = (e) => {
    onUpdate(jointAbbrev, 'intent', e.target.value);
  };

  return (
    <div className="bg-gray-800 border border-pos-yellow/50 rounded-lg p-3 w-full animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-pos-yellow">Edit: {ALL_JOINTS_MAP[jointAbbrev]?.name || jointAbbrev}</h3>
        <Button onClick={onClose} variant="icon" size="sm" title="Close Panel">
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Vector Controls */}
        <div className="p-2 border border-gray-700 rounded-md">
            <h4 className="text-sm font-semibold mb-2 text-gray-300">Position Vector</h4>
            <div className="grid grid-cols-3 gap-2">
                <NumberInput label="X (L/R)" value={safeData.vector.x} onChange={e => handleVectorChange('x', e.target.value)} min={-1} max={1} step={0.05} />
                <NumberInput label="Y (U/D)" value={safeData.vector.y} onChange={e => handleVectorChange('y', e.target.value)} min={-1} max={1} step={0.05} />
                <NumberInput label="Z (F/B)" value={safeData.vector.z} onChange={e => handleVectorChange('z', e.target.value)} min={-1} max={1} step={0.05} />
            </div>
        </div>
        
        {/* Rotation Control */}
        <div className="p-2 border border-gray-700 rounded-md">
            <h4 className="text-sm font-semibold mb-2 text-gray-300">Rotation</h4>
             <NumberInput label="Degrees" value={safeData.rotation} onChange={handleRotationChange} min={-180} max={180} step={1} />
        </div>

        {/* Orientation & Intent Dropdowns */}
        <div className="p-2 border border-gray-700 rounded-md space-y-3">
            <SelectInput label="Orientation" value={safeData.orientation} onChange={handleOrientationChange} options={GENERAL_ORIENTATION_OPTIONS} />
            <SelectInput label="Intent" value={safeData.intent} onChange={handleIntentChange} options={INTENT_OPTIONS} />
        </div>
      </div>
    </div>
  );
};

JointInputPanel.propTypes = {
  jointAbbrev: PropTypes.string,
  jointData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
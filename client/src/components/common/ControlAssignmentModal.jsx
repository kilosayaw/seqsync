// [NEW] src/components/common/ControlAssignmentModal.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ALL_JOINTS_MAP } from '../../utils/constants';
import Button from './Button';

const ControlAssignmentModal = ({ controlName, onAssign, onClear, onClose }) => {
  const assignableProperties = [
    { value: 'rotation', label: 'Rotation' },
    { value: 'extension', label: 'Flexion/Extension' },
    { value: 'vector.x', label: 'Vector X (L/R)' },
    { value: 'vector.y', label: 'Vector Y (U/D)' },
    { value: 'vector.z', label: 'Vector Z (F/B)' },
  ];

  const handleAssignClick = (e) => {
    e.preventDefault();
    const joint = e.target.elements.joint.value;
    const property = e.target.elements.property.value;
    if (joint && property) {
      onAssign({ joint, property });
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-pos-yellow">Assign {controlName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleAssignClick} className="space-y-4">
          <div>
            <label htmlFor="joint-select" className="block text-sm font-medium text-gray-300 mb-1">
              Target Joint
            </label>
            <select
              id="joint-select"
              name="joint"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-pos-yellow focus:border-pos-yellow"
            >
              <option value="">-- Select a Joint --</option>
              {Object.entries(ALL_JOINTS_MAP).map(([abbrev, { name }]) => (
                <option key={abbrev} value={abbrev}>{abbrev} - {name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="property-select" className="block text-sm font-medium text-gray-300 mb-1">
              Target Property
            </label>
            <select
              id="property-select"
              name="property"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-pos-yellow focus:border-pos-yellow"
            >
              {assignableProperties.map(prop => (
                <option key={prop.value} value={prop.value}>{prop.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" onClick={onClear} variant="danger">
              Clear Assignment
            </Button>
            <Button type="submit" variant="primary">
              Assign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

ControlAssignmentModal.propTypes = {
  controlName: PropTypes.string.isRequired,
  onAssign: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ControlAssignmentModal;
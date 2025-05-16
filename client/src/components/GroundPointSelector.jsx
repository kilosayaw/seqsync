// src/components/GroundPointSelector.jsx
import React from 'react';

const groundOptions = [
  'L1', 'L2', 'L3', 'L12', 'L13', 'L23',
  'L12T12345', 'L12T345', 'L12T12',
  'R1', 'R2', 'R3', 'R12', 'R13', 'R23',
  'R12T12345', 'R12T345', 'R12T12'
];

const GroundPointSelector = ({ side, value, onChange }) => {
  return (
    <div className="mb-4">
      <label>{side === 'left' ? 'Left Foot Ground:' : 'Right Foot Ground:'}</label>
      <select
        value={value}
        onChange={(e) => onChange(side, e.target.value)}
        className="ml-2 bg-black text-white border p-1"
      >
        {groundOptions.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
    </div>
  );
};

export default GroundPointSelector;

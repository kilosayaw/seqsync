import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import Select from './Select';
import { ALL_JOINTS_MAP, VECTOR_GRID_CELLS } from '../../../utils/constants';

const AutoMapTool = ({ onApply }) => {
  const [joint, setJoint] = useState('LS');
  const [direction, setDirection] = useState('0,1,0'); // Up
  const [every, setEvery] = useState(4);

  const jointOptions = Object.keys(ALL_JOINTS_MAP).map(abbrev => ({ value: abbrev, label: `${abbrev} - ${ALL_JOINTS_MAP[abbrev].name}` }));
  const directionOptions = VECTOR_GRID_CELLS.map(cell => ({ value: `${cell.x},${cell.y},0`, label: cell.desc }));
  const frequencyOptions = [2, 4, 8, 16].map(val => ({ value: val, label: `Every ${val} beats` }));

  const handleApply = () => {
    const [x, y, z] = direction.split(',').map(Number);
    onApply({ joint, vector: { x, y, z }, every: parseInt(every, 10) });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg border border-dashed border-gray-600">
        <span className="text-sm font-bold text-gray-400">Auto-Map:</span>
        <Select options={jointOptions} value={joint} onChange={e => setJoint(e.target.value)} className="w-40" />
        <Select options={directionOptions} value={direction} onChange={e => setDirection(e.target.value)} className="w-32" />
        <Select options={frequencyOptions} value={every} onChange={e => setEvery(e.target.value)} className="w-32" />
        <Button size="sm" variant="primary" onClick={handleApply}>Apply</Button>
    </div>
  );
};

AutoMapTool.propTypes = {
  onApply: PropTypes.func.isRequired,
};

export default AutoMapTool;
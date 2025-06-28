import React from 'react';
import PropTypes from 'prop-types';
import { UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW } from '../../../utils/constants';

const SideJointSelector = ({ side, onJointSelect, activeEditingJoint }) => {
  const joints = side === 'L' ? UI_LEFT_JOINTS_ABBREVS_NEW : UI_RIGHT_JOINTS_ABBREVS_NEW;

  return (
    <div className="w-full space-y-1.5 flex-shrink-0">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">
        {side === 'L' ? 'Left Body' : 'Right Body'}
      </h3>
      {joints.map((joint) => (
        <button
          key={joint.abbrev}
          onClick={() => onJointSelect(joint.abbrev)}
          className={`w-full text-left p-2 rounded-md transition-all duration-150 ${
            activeEditingJoint === joint.abbrev
              ? 'bg-pos-yellow text-black font-bold shadow-lg'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          <span className="font-mono text-sm mr-2 bg-black/20 px-1.5 py-0.5 rounded">{joint.abbrev}</span>
          <span className="text-xs">{joint.name}</span>
        </button>
      ))}
    </div>
  );
};

SideJointSelector.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  onJointSelect: PropTypes.func.isRequired,
  activeEditingJoint: PropTypes.string,
};

export default SideJointSelector;
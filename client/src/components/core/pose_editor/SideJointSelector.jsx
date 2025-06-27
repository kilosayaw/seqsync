import React from 'react';
import PropTypes from 'prop-types';

const SideJointSelector = ({ side, onJointSelect, activeEditingJoint, weight = 50 }) => {
  const joints = side === 'L' 
    ? [{ abbrev: 'LS', name: 'L Shoulder' }, { abbrev: 'LE', name: 'L Elbow' }, { abbrev: 'LW', name: 'L Wrist' }, { abbrev: 'LP', name: 'L Palm' }, { abbrev: 'LH', name: 'L Hip' }, { abbrev: 'LK', name: 'L Knee' }, { abbrev: 'LA', name: 'L Ankle' }, { abbrev: 'LF', name: 'L Foot Base' }] 
    : [{ abbrev: 'RS', name: 'R Shoulder' }, { abbrev: 'RE', name: 'R Elbow' }, { abbrev: 'RW', name: 'R Wrist' }, { abbrev: 'RP', name: 'R Palm' }, { abbrev: 'RH', name: 'R Hip' }, { abbrev: 'RK', name: 'R Knee' }, { abbrev: 'RA', name: 'R Ankle' }, { abbrev: 'RF', name: 'R Foot Base' }];

  return (
    <div className="w-full space-y-1">
      {joints.map(({ abbrev, name }) => {
        const isActive = activeEditingJoint === abbrev;
        let illumination = 0;

        // Weight-based illumination for Hip buttons
        if (abbrev === 'LH') {
          illumination = weight / 100; // 0 to 1
        } else if (abbrev === 'RH') {
          illumination = (100 - weight) / 100; // 0 to 1
        }
        
        const color = side === 'L' ? `rgba(59, 130, 246, ${illumination})` : `rgba(239, 68, 68, ${illumination})`;
        const shadowColor = side === 'L' ? `rgba(59, 130, 246, ${illumination * 0.7})` : `rgba(239, 68, 68, ${illumination * 0.7})`;

        return (
          <button
            key={abbrev}
            onClick={() => onJointSelect(abbrev)}
            className={`
              w-full flex items-center justify-center px-3 py-2 text-sm font-bold rounded-md
              transition-all duration-200 ease-in-out border
              ${isActive
                ? 'bg-yellow-400 text-black shadow-lg ring-2 ring-white/50 border-yellow-300'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
              }
            `}
            style={{
              backgroundColor: isActive ? undefined : color,
              boxShadow: isActive ? undefined : `0 0 15px ${shadowColor}`,
            }}
            title={`Edit ${name}`}
          >
            {abbrev}
          </button>
        );
      })}
    </div>
  );
};

SideJointSelector.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  onJointSelect: PropTypes.func.isRequired,
  activeEditingJoint: PropTypes.string,
  weight: PropTypes.number,
};

export default SideJointSelector;
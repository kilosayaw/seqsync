// client/src/components/core/pose_editor/SideJointSelector.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW } from '../../../utils/constants';

const SideJointSelector = ({ side, onJointSelect, activeEditingJoint, weight = 50 }) => {
    const jointList = side === 'L' ? UI_LEFT_JOINTS_ABBREVS_NEW : UI_RIGHT_JOINTS_ABBREVS_NEW;

    // --- CROSSFADER WEIGHT LOGIC ---
    // Determine the opacity/glow based on weight distribution
    // If side is L, glow increases as weight approaches 100.
    // If side is R, glow increases as weight approaches 0.
    const hipWeight = side === 'L' ? weight : 100 - weight;
    // Map 50-100 range to 0-1 opacity range
    const hipGlowOpacity = Math.max(0, (hipWeight - 50) / 50);

    return (
        <div className="w-full space-y-1.5">
            {jointList.map(({ abbrev, name }) => {
                const isActive = activeEditingJoint === abbrev;
                const isHip = abbrev === 'LH' || abbrev === 'RH';
                
                return (
                    <button
                        key={abbrev}
                        onClick={() => onJointSelect(abbrev)}
                        className={`w-full text-left p-2 rounded-md transition-all duration-150 border
                            ${isActive ? 'bg-pos-blue text-white border-pos-blue' : 'bg-element-bg text-text-secondary border-gray-700 hover:bg-gray-700/50'}`
                        }
                        style={isHip ? { boxShadow: `inset 0 0 15px rgba(250, 204, 21, ${hipGlowOpacity})` } : {}}
                    >
                        <span className="font-bold">{abbrev}</span>
                        <span className="text-xs ml-2">{name}</span>
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
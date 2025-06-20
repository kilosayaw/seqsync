import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useUIState } from '../../../contexts/UIStateContext'; // --- DEFINITIVE FIX: Consume context directly ---
import { UI_LEFT_JOINTS_ABBREVS_NEW, UI_RIGHT_JOINTS_ABBREVS_NEW } from '../../../utils/constants';
import Tooltip from '../../common/Tooltip';

const OctagonButton = ({ abbrev, name, onClick, isActive, isLocked, lockDuration }) => (
    <button
        onClick={() => onClick(abbrev)}
        className={`
            relative flex flex-col items-center justify-center font-semibold transition-colors duration-200
            ${isActive ? 'bg-pos-yellow text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
        `}
        style={{
            width: '50px',
            height: '50px',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
        }}
    >
        <span className="font-mono text-xl font-bold">{abbrev}</span>
        {isLocked && (
            <Tooltip content={`Locked for ${lockDuration} beats`} placement="right">
                <FontAwesomeIcon icon={faLock} className="absolute top-2 right-2 text-blue-400" />
            </Tooltip>
        )}
    </button>
);

OctagonButton.propTypes = {
    abbrev: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    isLocked: PropTypes.bool.isRequired, // Changed to bool for presence check
    lockDuration: PropTypes.number,
};

const SideJointSelector = ({ side }) => {
    // --- DEFINITIVE FIX: Get state and setters directly from the context ---
    const { activeEditingJoint, setActiveEditingJoint, activeBeatData } = useUIState();
    const joints = side === 'L' ? UI_LEFT_JOINTS_ABBREVS_NEW : UI_RIGHT_JOINTS_ABBREVS_NEW;

    return (
        <div className="flex flex-col items-center gap-2">
            {joints.map(({ abbrev, name }) => {
                const lockDuration = activeBeatData?.jointInfo[abbrev]?.lockDuration;
                return (
                    <OctagonButton
                        key={abbrev}
                        abbrev={abbrev}
                        name={name}
                        onClick={setActiveEditingJoint} // Pass the setter directly
                        isActive={activeEditingJoint === abbrev}
                        isLocked={!!lockDuration}
                        lockDuration={lockDuration}
                    />
                );
            })}
        </div>
    );
};

SideJointSelector.propTypes = {
    side: PropTypes.oneOf(['L', 'R']).isRequired,
    // --- DEFINITIVE FIX: onJointSelect is no longer needed as a prop ---
    // onJointSelect: PropTypes.func.isRequired,
};

export default SideJointSelector;
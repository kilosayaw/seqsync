import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnchor, faBolt, faBalanceScale, faWalking } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../common/Tooltip';

// A small, reusable sub-component for displaying a single piece of info.
const InfoItem = ({ icon, label, value, colorClass = 'text-gray-300', tooltipContent }) => (
    <Tooltip content={tooltipContent} placement="top">
        <div className="flex items-center gap-2 text-xs cursor-help">
            <FontAwesomeIcon icon={icon} className="text-gray-500 w-3" />
            <span className="font-semibold text-gray-400">{label}:</span>
            <span className={`font-mono ${colorClass}`}>{value}</span>
        </div>
    </Tooltip>
);

const StabilityBar = ({ score, isStable }) => {
    const barColor = isStable ? 'bg-green-500' : 'bg-yellow-500';
    return (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${score}%` }}
            ></div>
        </div>
    );
};

const PoseInfoDisplay = ({ poseDynamics }) => {
    const {
        anchors = [],
        driver = 'N/A',
        isStable = false,
        stabilityScore = 0,
        gait = { isContralateral: false, description: 'N/A' },
    } = poseDynamics || {};

    return (
        <div className="w-full bg-gray-900/50 p-3 rounded-lg mt-2 grid grid-cols-2 gap-x-6 gap-y-2 backdrop-blur-sm">
            <InfoItem 
                icon={faAnchor} 
                label="Anchors" 
                value={anchors.length > 0 ? anchors.join(', ') : 'None'}
                tooltipContent="The grounded points forming the Base of Support."
            />
            <InfoItem 
                icon={faBolt} 
                label="Driver" 
                value={driver}
                tooltipContent="The primary joint initiating movement based on its 'Intent'."
            />
            <div className="col-span-2 flex flex-col gap-1" title={`Stability Score: ${stabilityScore}%`}>
                <div className="flex justify-between items-center text-xs">
                     <span className="font-semibold text-gray-400 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faBalanceScale} className="text-gray-500 w-3" />
                        Stability
                     </span>
                     <span className={isStable ? 'text-green-400' : 'text-yellow-400'}>
                        {isStable ? 'Stable' : 'Unstable'}
                     </span>
                </div>
                <StabilityBar score={stabilityScore} isStable={isStable} />
            </div>
        </div>
    );
};

PoseInfoDisplay.propTypes = {
    poseDynamics: PropTypes.object,
};

export default PoseInfoDisplay;
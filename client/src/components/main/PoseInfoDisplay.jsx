import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBalanceScale } from '@fortawesome/free-solid-svg-icons';

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-1.5 text-xs">
        <FontAwesomeIcon icon={icon} className="text-gray-400 w-3" />
        <span className="text-gray-300 font-medium">{label}:</span>
        <span className="text-white font-mono">{value}</span>
    </div>
);

const StabilityBar = ({ value }) => {
    const width = Math.max(0, Math.min(100, value));
    let colorClass = 'bg-green-500';
    if (width < 60) colorClass = 'bg-yellow-500';
    if (width < 30) colorClass = 'bg-red-500';

    return (
        <div className="w-full bg-gray-900/50 rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full transition-all duration-300 ${colorClass}`}
                style={{ width: `${width}%` }}
            ></div>
        </div>
    );
};

const PoseInfoDisplay = ({ poseDynamics }) => {
    if (!poseDynamics) return null;

    const { momentum, driver, stability } = poseDynamics;

    return (
        <div className="w-full bg-gray-800/60 p-2 rounded-md space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <InfoItem icon={faBolt} label="Momentum" value={momentum.toFixed(0)} />
                <InfoItem icon={faBalanceScale} label="Driver" value={driver || 'N/A'} />
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-medium">Stability</span>
                    <span className="text-white font-mono">{Math.round(stability)}%</span>
                </div>
                <StabilityBar value={stability} />
            </div>
        </div>
    );
};

PoseInfoDisplay.propTypes = {
    poseDynamics: PropTypes.shape({
        momentum: PropTypes.number,
        driver: PropTypes.string,
        stability: PropTypes.number,
    }).isRequired,
};

export default PoseInfoDisplay;
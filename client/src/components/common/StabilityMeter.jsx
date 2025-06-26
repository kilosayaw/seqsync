import React from 'react';
import PropTypes from 'prop-types';

const StabilityMeter = ({ score = 0 }) => {
    const scoreNum = Math.round(score);

    // Determine color based on score
    let barColorClass = 'bg-red-500';
    if (scoreNum > 70) {
        barColorClass = 'bg-green-500';
    } else if (scoreNum > 30) {
        barColorClass = 'bg-yellow-500';
    }

    return (
        <div aria-live="polite" className="w-full max-w-[200px] flex flex-col items-center gap-1">
            <div className="w-full flex justify-between items-center text-xs">
                <span className="font-bold text-text-secondary uppercase tracking-wider">Stability</span>
                <span className="font-mono text-white">{scoreNum}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-900/80 rounded-full overflow-hidden border border-gray-700">
                <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${barColorClass}`}
                    style={{ width: `${scoreNum}%` }}
                    role="meter"
                    aria-valuenow={scoreNum}
                    aria-valuemin="0"
                    aria-valuemax="100"
                />
            </div>
        </div>
    );
};

StabilityMeter.propTypes = {
    score: PropTypes.number,
};

export default React.memo(StabilityMeter);
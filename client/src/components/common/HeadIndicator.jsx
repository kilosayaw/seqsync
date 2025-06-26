import React from 'react';
import PropTypes from 'prop-types';

const HeadIndicator = ({ xOffset = 0, neckRotation = 0 }) => {
    
    // Task 3.2: Cone is visible only when neck rotation is between -90 and +90 degrees.
    const isFacingForward = neckRotation >= -90 && neckRotation <= 90;

    const translateX = xOffset * 40; // max 40% translation left or right

    return (
        <div className="relative w-48 h-8 bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-500/50" style={{ transform: 'translateX(-50%)' }} />
            <div 
                className="absolute top-1/2 left-1/2 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-600 transition-transform duration-100 ease-linear"
                style={{ transform: `translate(-50%, -50%) translateX(${translateX}%)` }}
            >
                {/* The "cone" representing forward direction */}
                <div 
                    className={`absolute top-[-4px] left-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-pos-yellow transition-opacity duration-300 ${isFacingForward ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transform: 'translateX(-50%)' }}
                />
            </div>
        </div>
    );
};

HeadIndicator.propTypes = {
    xOffset: PropTypes.number,
    neckRotation: PropTypes.number,
};

export default HeadIndicator;
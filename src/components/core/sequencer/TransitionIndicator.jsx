import React from 'react';
import PropTypes from 'prop-types'; // --- DEFINITIVE FIX: Import PropTypes ---
import { useDroppable } from '@dnd-kit/core';
import { TRANSITION_CURVES } from '../../../utils/constants';
import Tooltip from '../../common/Tooltip';

// A memoized component to render the SVG curve path.
const CurveIcon = React.memo(({ curveFunction, className = '' }) => {
    const path = React.useMemo(() => {
        let d = 'M 0,100';
        for (let i = 1; i <= 100; i++) {
            const t = i / 100;
            const y = 100 - (curveFunction(t) * 100);
            d += ` L ${i},${y}`;
        }
        return d;
    }, [curveFunction]);

    return (
        <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={path} stroke="currentColor" strokeWidth="15" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
});

CurveIcon.displayName = 'CurveIcon';
CurveIcon.propTypes = {
    curveFunction: PropTypes.func.isRequired,
    className: PropTypes.string,
};

// The main TransitionIndicator component, acting as a drop zone.
const TransitionIndicator = ({ beatIndex, curveType = 'LINEAR', targetMode }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `transition-drop-target-${beatIndex}`,
        data: {
            type: 'transition-drop',
            targetBeat: beatIndex,
        },
    });

    const curveData = TRANSITION_CURVES[curveType] || TRANSITION_CURVES['LINEAR'];
    const tooltipContent = `Transition (${targetMode}): ${curveData.label}`;

    return (
        <div 
            ref={setNodeRef}
            className={`absolute top-1/2 -translate-y-1/2 -right-3 z-10
                        w-6 h-6 flex items-center justify-center p-1 rounded-md transition-all duration-150
                        ${isOver ? 'bg-pos-yellow/50 ring-2 ring-pos-yellow' : 'bg-gray-700/60 hover:bg-gray-600'}`
            }
        >
            <Tooltip content={tooltipContent} placement="top">
                <CurveIcon
                    curveFunction={curveData.function}
                    className="w-full h-full text-gray-400"
                />
            </Tooltip>
        </div>
    );
};

TransitionIndicator.propTypes = {
    beatIndex: PropTypes.number.isRequired,
    curveType: PropTypes.string,
    targetMode: PropTypes.string.isRequired,
};

export default React.memo(TransitionIndicator);
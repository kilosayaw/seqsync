import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button';
import Select from '../../common/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoePrints } from '@fortawesome/free-solid-svg-icons';
import { TRANSITION_CURVES } from '../../../utils/constants';

const TransitionEditor = ({ 
    startBeat, endBeat, curve, maxBeat,
    onStartBeatChange, onEndBeatChange, onCurveChange, onApplyTransition 
}) => {
    const isTransitionValid = startBeat < endBeat;

    const beatOptions = Array.from({ length: maxBeat }, (_, i) => ({
        value: i,
        label: `Beat ${i + 1}`,
    }));

    const curveOptions = Object.keys(TRANSITION_CURVES).map(key => ({
        value: key,
        label: TRANSITION_CURVES[key].label,
    }));

    return (
        <div className="bg-gray-800/60 rounded-lg p-2 flex items-center justify-center gap-x-4 gap-y-2 flex-wrap w-full max-w-xl mx-auto backdrop-blur-sm">
            <span className="text-sm font-semibold text-gray-300">Transition</span>
            
            <div className="flex items-center gap-2">
                <label htmlFor="start-beat" className="text-xs text-gray-400">From:</label>
                <Select id="start-beat" options={beatOptions} value={startBeat} onChange={(e) => onStartBeatChange(Number(e.target.value))} className="w-24 bg-gray-900 border-gray-700" />
            </div>
            
            <div className="flex items-center gap-2">
                <label htmlFor="end-beat" className="text-xs text-gray-400">To:</label>
                <Select id="end-beat" options={beatOptions} value={endBeat} onChange={(e) => onEndBeatChange(Number(e.target.value))} className="w-24 bg-gray-900 border-gray-700" />
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="curve-type" className="text-xs text-gray-400">Curve:</label>
                <Select id="curve-type" options={curveOptions} value={curve} onChange={(e) => onCurveChange(e.target.value)} className="w-36 bg-gray-900 border-gray-700" />
            </div>

            <Button
                variant="primary" size="sm" onClick={onApplyTransition}
                disabled={!isTransitionValid} title={isTransitionValid ? "Apply transition" : "Start beat must be before end beat"}
                iconLeft={faShoePrints}
            >
                Apply
            </Button>
        </div>
    );
};

TransitionEditor.propTypes = {
    startBeat: PropTypes.number.isRequired,
    endBeat: PropTypes.number.isRequired,
    curve: PropTypes.string.isRequired,
    maxBeat: PropTypes.number.isRequired,
    onStartBeatChange: PropTypes.func.isRequired,
    onEndBeatChange: PropTypes.func.isRequired,
    onCurveChange: PropTypes.func.isRequired,
    onApplyTransition: PropTypes.func.isRequired,
};

export default TransitionEditor;
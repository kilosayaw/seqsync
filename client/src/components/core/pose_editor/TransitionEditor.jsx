import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button';
import Select from '../../common/Select';

const TransitionEditor = ({
  startBeat,
  endBeat,
  onStartBeatChange,
  onEndBeatChange,
  onApplyTransition,
  maxBeat,
}) => {
    const transitionOptions = [
        { value: 'linear', label: 'Linear Interpolate' },
        { value: 'ease-in-out', label: 'Ease In/Out (Future)' },
    ];
    
    const beatOptions = Array.from({ length: maxBeat }, (_, i) => ({
        value: i,
        label: `Beat ${i + 1}`
    }));

    return (
        <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg border border-dashed border-gray-600">
            <span className="text-sm font-bold text-gray-400">Transition</span>
            <Select
                label="From:"
                value={startBeat}
                onChange={(e) => onStartBeatChange(parseInt(e.target.value, 10))}
                options={beatOptions}
                className="w-28"
            />
            <span className="text-gray-500">to</span>
             <Select
                label="To:"
                value={endBeat}
                onChange={(e) => onEndBeatChange(parseInt(e.target.value, 10))}
                options={beatOptions}
                className="w-28"
            />
            <Select options={transitionOptions} className="w-40"/>
            <Button size="sm" variant="primary" onClick={onApplyTransition}>Apply</Button>
        </div>
    );
};

TransitionEditor.propTypes = {
    startBeat: PropTypes.number.isRequired,
    endBeat: PropTypes.number.isRequired,
    onStartBeatChange: PropTypes.func.isRequired,
    onEndBeatChange: PropTypes.func.isRequired,
    onApplyTransition: PropTypes.func.isRequired,
    maxBeat: PropTypes.number.isRequired,
};

export default TransitionEditor;
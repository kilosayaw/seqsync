// src/components/core/pose_editor/TransitionEditorPlaceholder.jsx
import React from 'react';
import Button from '../../common/Button';
import Select from '../../common/Select';

const TransitionEditorPlaceholder = () => {
    const transitionOptions = [
        { value: 'linear', label: 'Linear Interpolate' },
        { value: 'ease-in-out', label: 'Ease In/Out' },
        { value: 'snap', label: 'Snap Transition' },
    ];
    return (
        <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg border border-dashed border-gray-600">
            <span className="text-sm font-bold text-gray-400">Transition</span>
            <Button size="sm" variant="secondary" className="w-20">Beat: 1</Button>
            <span className="text-gray-500">to</span>
            <Button size="sm" variant="secondary" className="w-20">Beat: 2</Button>
            <Select options={transitionOptions} className="w-40"/>
            <Button size="sm" variant="primary">Apply</Button>
        </div>
    );
};
export default TransitionEditorPlaceholder;
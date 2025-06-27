import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faWaveSquare } from '@fortawesome/free-solid-svg-icons';

const DraggableTransition = ({ label, icon }) => (
    <div draggable="true" className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded-md cursor-grab active:cursor-grabbing">
        <FontAwesomeIcon icon={icon} className="text-gray-300" />
        <span className="text-xs text-gray-400">{label}</span>
    </div>
);

const TransitionPalette = () => (
    <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg border border-dashed border-gray-600">
        <span className="text-sm font-bold text-gray-400">Transitions:</span>
        <DraggableTransition label="Linear" icon={faArrowRight} />
        <DraggableTransition label="Ease In/Out" icon={faWaveSquare} />
    </div>
);
export default TransitionPalette;
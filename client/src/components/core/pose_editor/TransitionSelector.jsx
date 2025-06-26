import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types'; // --- DEFINITIVE FIX: Import PropTypes ---
import { useDraggable } from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { TRANSITION_CURVES } from '../../../utils/constants';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import Button from '../../common/Button';
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
CurveIcon.propTypes = { curveFunction: PropTypes.func.isRequired, className: PropTypes.string };

// The draggable icon component.
const TransitionIcon = ({ curveKey, curveData, targetMode }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: curveKey,
        data: { type: 'transition-icon', targetMode }, // Pass targetMode in draggable data
    });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50, touchAction: 'none' } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Tooltip content={curveData.label} placement="top">
                <div className="flex flex-col items-center p-2 rounded-lg bg-gray-700 cursor-grab active:cursor-grabbing hover:bg-pos-yellow hover:text-black transition-colors shadow-inner">
                    <CurveIcon curveFunction={curveData.function} className="w-10 h-10" />
                </div>
            </Tooltip>
        </div>
    );
};
TransitionIcon.propTypes = { 
    curveKey: PropTypes.string.isRequired, 
    curveData: PropTypes.object.isRequired, 
    targetMode: PropTypes.string.isRequired 
};

// The main TransitionSelector palette component.
const TransitionSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCurve, setSelectedCurve] = useState('LINEAR');
    const [targetMode, setTargetMode] = useState('BOTH'); // 'POS', 'SEQ', 'BOTH'
    const { applyTransitionToAll } = useSequence();
    const { currentEditingBar } = useUIState();

    const handleApplyToAll = useCallback(() => {
        applyTransitionToAll(currentEditingBar, selectedCurve, targetMode);
        toast.success(`'${TRANSITION_CURVES[selectedCurve].label}' applied to all ${targetMode.toLowerCase()} transitions.`);
    }, [selectedCurve, targetMode, currentEditingBar, applyTransitionToAll]);

    return (
        <div className="fixed top-1/2 -right-4 transform -translate-y-1/2 z-40">
            <button
                onClick={() => setIsOpen(p => !p)}
                className="w-8 h-20 bg-gray-700 text-white rounded-l-lg flex items-center justify-center hover:bg-pos-yellow hover:text-black shadow-lg"
                title="Toggle Transition Palette"
            >
                <FontAwesomeIcon icon={isOpen ? faChevronRight : faChevronLeft} />
            </button>
            {isOpen && (
                <div className="absolute top-1/2 -translate-y-1/2 right-10 w-auto bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border border-gray-700 shadow-2xl animate-fade-in-fast">
                    <h4 className="text-sm font-bold text-center mb-2 text-pos-yellow">Transition Palette</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(TRANSITION_CURVES).map(([key, data]) => (
                            <div key={key} onClick={() => setSelectedCurve(key)} className={`rounded-lg p-0.5 border-2 ${selectedCurve === key ? 'border-pos-yellow' : 'border-transparent'}`}>
                                <TransitionIcon curveKey={key} curveData={data} targetMode={targetMode} />
                            </div>
                        ))}
                    </div>
                    <div className="my-3 p-1 bg-black/20 rounded-md flex justify-center gap-1">
                        <Button size="xs" variant={targetMode === 'POS' ? 'primary' : 'secondary'} onClick={() => setTargetMode('POS')}>Pose</Button>
                        <Button size="xs" variant={targetMode === 'SEQ' ? 'primary' : 'secondary'} onClick={() => setTargetMode('SEQ')}>Sound</Button>
                        <Button size="xs" variant={targetMode === 'BOTH' ? 'primary' : 'secondary'} onClick={() => setTargetMode('BOTH')}>Both</Button>
                    </div>
                    <Button onClick={handleApplyToAll} variant="primary" size="sm" className="w-full">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
                        Apply to All ({targetMode})
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TransitionSelector;
import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { useLongPress } from '../../hooks/useLongPress';
import './PerformancePad.css';

const PerformancePad = ({ padIndex, beatNum, isPulsing, isSelected, onMouseDown, onMouseUp, onMouseLeave, side }) => {
    const { activePad, activePresetPage, showNotification } = useUIState();
    const { savePoseToPreset } = useSequence();

    const handleShortClick = (e) => {
        // The parent deck's onPadEvent handles this.
    };

    const handleLongPress = () => {
        if (activePad === null) {
            showNotification("Select a pad to save a pose from.", 2000);
            return;
        }
        
        // The preset slot index (0-3) corresponds to the pad's position on the deck.
        const presetIndex = side === 'left' ? padIndex % 4 : (padIndex % 8) - 4;
        const pageIndex = activePresetPage[side];

        savePoseToPreset(side, pageIndex, presetIndex);
        showNotification(`Pose saved to ${side.toUpperCase()} Preset Page ${pageIndex + 1}, Slot ${presetIndex + 1}.`, 2000);
    };

    const longPressEvents = useLongPress(handleShortClick, handleLongPress, { ms: 500 });
    
    const padClasses = classNames('performance-pad', {
        'pulsing': isPulsing,
        'selected': isSelected,
    });

    return (
        <button 
            className={padClasses} 
            onMouseDown={(e) => {
                onMouseDown(e);
                longPressEvents.onMouseDown(e);
            }}
            onMouseUp={(e) => {
                onMouseUp(e);
                longPressEvents.onMouseUp(e);
            }}
            onMouseLeave={(e) => {
                onMouseLeave(e);
                longPressEvents.onMouseLeave(e);
            }}
        >
            {beatNum}
        </button>
    );
};
export default PerformancePad;
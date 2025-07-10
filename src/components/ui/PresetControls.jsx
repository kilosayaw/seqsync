import React from 'react';
import classNames from 'classnames';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { useLongPress } from '../../hooks/useLongPress';
import './PresetControls.css';

const PresetControls = ({ side }) => {
    const { activePad, activePresetPage, setActivePresetPage, showNotification } = useUIState();
    const { presets, savePoseToPreset, loadPoseFromPreset } = useSequence();

    const currentPageIndex = activePresetPage[side];
    const presetsForCurrentPage = presets[side][currentPageIndex];

    const handlePageChange = (pageIndex) => {
        setActivePresetPage(prev => ({ ...prev, [side]: pageIndex }));
    };

    // DEFINITIVE: Use a long press to SAVE, and a short click to LOAD.
    const handleShortClick = (presetIndex) => {
        if (activePad === null) {
            showNotification("Select a pad to load a preset onto.", 2000);
            return;
        }
        loadPoseFromPreset(side, currentPageIndex, presetIndex);
    };

    const handleLongPress = (presetIndex) => {
        if (activePad === null) {
            showNotification("Select a pad to save a pose from.", 2000);
            return;
        }
        savePoseToPreset(side, currentPageIndex, presetIndex);
        showNotification(`Pose saved to ${side.toUpperCase()} Preset Page ${currentPageIndex + 1}, Slot ${presetIndex + 1}.`, 2000);
    };

    return (
        <div className="preset-controls-container">
            <div className="preset-page-buttons">
                {[0, 1, 2].map(i => (
                    <button
                        key={`page-${i}`}
                        className={classNames('page-btn', { 'active': currentPageIndex === i })}
                        onClick={() => handlePageChange(i)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            <div className="preset-slot-buttons">
                {[0, 1, 2, 3].map(i => {
                    const longPressEvents = useLongPress(
                        () => handleShortClick(i), 
                        () => handleLongPress(i),
                        { ms: 500 } // 500ms for a distinct long press
                    );
                    
                    return (
                        <button
                            key={`slot-${i}`}
                            className={classNames('slot-btn', { 'filled': !!presetsForCurrentPage[i] })}
                            {...longPressEvents}
                        >
                            P{i + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PresetControls;
import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePadMapping } from '../hooks/usePadMapping';
import { GROUNDING_PRESETS } from '../utils/constants';
import './PadsRenderer.css';

const PadsRenderer = ({ side }) => {
    const { selectedBar, selectedBeat, footEditState, setSelectedBeat } = useUIState();
    const { songData, updateJointData } = useSequence();
    const { activePadIndex, handlePadDown, handlePadUp } = usePadMapping();

    const sideKey = side.charAt(0).toUpperCase(); // 'L' or 'R'
    const isFootEditMode = footEditState.left || footEditState.right;
    const jointToEdit = footEditState[side] ? `${sideKey}F` : null;

    const handlePresetClick = (preset) => {
        const dataIndex = ((selectedBar - 1) * 16) + selectedBeat;
        if (dataIndex < 0) return;
        // When clicking a preset, we know which foot to update.
        const jointIdToUpdate = preset.side === 'L' ? 'LF' : 'RF';
        console.log(`[PadsRenderer-${side}] Preset clicked: ${preset.name}. Updating joint ${jointIdToUpdate} on beat ${dataIndex}`);
        updateJointData(dataIndex, jointIdToUpdate, { grounding: preset.notation });
    };

    const currentBeatData = songData[((selectedBar - 1) * 16) + selectedBeat];

    return (
        <div className="pads-grid">
            {isFootEditMode ? (
                // --- PRESET MODE ---
                GROUNDING_PRESETS
                    // If DUAL mode is on, both decks show presets. Filter by side.
                    // If only one side is on, the other side shows empty pads (or beats).
                    .filter(p => footEditState[side] && p.side === sideKey)
                    .map((preset, index) => (
                        <PerformancePad
                            key={`preset-${side}-${index}`}
                            mode="preset"
                            presetData={preset}
                            onClick={() => handlePresetClick(preset)}
                            isSelected={currentBeatData?.joints[preset.side === 'L' ? 'LF' : 'RF']?.grounding === preset.notation}
                        />
                    ))
            ) : (
                // --- BEAT MODE ---
                Array.from({ length: 8 }, (_, i) => {
                    const padOffset = side === 'left' ? 0 : 8;
                    const globalPadIndex = padOffset + i;
                    const globalBeatIndex = ((selectedBar - 1) * 16) + globalPadIndex;
                    return (
                        <PerformancePad
                            key={`beat-${side}-${i}`}
                            mode="beat"
                            beatNum={globalPadIndex + 1}
                            beatData={songData[globalBeatIndex]}
                            isSelected={selectedBeat === globalPadIndex}
                            isActive={activePadIndex === globalPadIndex} 
                            onMouseDown={() => handlePadDown(globalPadIndex)}
                            onMouseUp={() => handlePadUp(globalPadIndex)}
                        />
                    );
                })
            )}
        </div>
    );
};

export default PadsRenderer;
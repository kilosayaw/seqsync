import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePadMapping } from '../hooks/usePadMapping';
import { GROUNDING_PRESETS } from '../utils/constants';
import './PadsRenderer.css';

const PadsRenderer = ({ side }) => {
    const { selectedBar, selectedBeat, selectedJoint, setSelectedBeat } = useUIState();
    const { songData, updateJointData } = useSequence();
    const { activePadIndex, handlePadDown, handlePadUp } = usePadMapping();

    const isFootEditMode = selectedJoint === 'LF' || selectedJoint === 'RF';

    const handlePresetClick = (preset) => {
        if (selectedBeat === null) return;
        const dataIndex = ((selectedBar - 1) * 16) + selectedBeat;
        const jointIdToUpdate = preset.side === 'L' ? 'LF' : 'RF';
        console.log(`[PadsRenderer] Preset clicked: ${preset.name}. Updating beat ${dataIndex}`);
        updateJointData(dataIndex, jointIdToUpdate, { grounding: preset.notation });
    };

    const dataIndex = selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1;
    const currentBeatData = dataIndex >= 0 ? songData[dataIndex] : null;

    // Use a flag to decide which set of pads to show. For now, it's tied to foot edit mode.
    const showPresets = isFootEditMode;

    return (
        <div className="pads-renderer-container">
            {showPresets ? (
                GROUNDING_PRESETS.map(preset => (
                    <PerformancePad
                        key={`preset-${preset.padId}`}
                        mode="preset"
                        presetData={preset}
                        onClick={() => handlePresetClick(preset)}
                        isSelected={currentBeatData?.joints[preset.side === 'L' ? 'LF' : 'RF']?.grounding === preset.notation}
                    />
                ))
            ) : (
                Array.from({ length: 16 }, (_, i) => {
                    const globalBeatIndex = ((selectedBar - 1) * 16) + i;
                    return (
                        <PerformancePad
                            key={`beat-${i}`}
                            mode="beat"
                            beatNum={i + 1}
                            beatData={songData[globalBeatIndex]}
                            // --- FIX: Pass edit mode state down to each pad ---
                            isEditMode={isFootEditMode} 
                            isSelected={selectedBeat === i}
                            isActive={activePadIndex === i} 
                            onMouseDown={() => { console.log(`[PadsRenderer] Mouse Down on pad ${i+1}`); handlePadDown(i); }}
                            onMouseUp={() => { console.log(`[PadsRenderer] Mouse Up on pad ${i+1}`); handlePadUp(i); }}
                        />
                    )
                })
            )}
        </div>
    );
};

export default PadsRenderer;
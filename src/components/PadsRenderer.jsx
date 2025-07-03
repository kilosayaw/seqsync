import React from 'react';
import PerformancePad from './PerformancePad';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import { usePadMapping } from '../hooks/usePadMapping';
import { GROUNDING_PRESETS } from '../utils/constants';
import './PadsRenderer.css';

const PadsRenderer = () => {
    const { selectedBar, selectedBeat, selectedJoint, setSelectedBeat } = useUIState();
    const { songData, updateJointData } = useSequence();
    const { activePadIndex, handlePadDown, handlePadUp } = usePadMapping();

    const isPresetMode = selectedJoint === 'LF' || selectedJoint === 'RF';

    const handlePresetClick = (preset) => {
        if (selectedBeat === null) return;
        const dataIndex = ((selectedBar - 1) * 16) + selectedBeat;
        const jointIdToUpdate = preset.side === 'L' ? 'LF' : 'RF';
        updateJointData(dataIndex, jointIdToUpdate, { grounding: preset.notation });
    };

    const dataIndex = selectedBeat !== null ? ((selectedBar - 1) * 16) + selectedBeat : -1;
    const currentBeatData = dataIndex >= 0 ? songData[dataIndex] : null;

    return (
        <div className="pads-renderer-container">
            {isPresetMode ? (
                GROUNDING_PRESETS.map(preset => (
                    <PerformancePad
                        key={`preset-${preset.padId}`}
                        mode="preset"
                        presetData={preset}
                        onClick={() => handlePresetClick(preset)}
                        isSelected={currentBeatData?.joints[preset.side === 'L' ? 'LF' : 'RF']?.grounding === preset.notation}
                        isActive={activePadIndex === (preset.padId - 1)}
                    />
                ))
            ) : (
                Array.from({ length: 16 }, (_, i) => (
                    <PerformancePad
                        key={`beat-${i}`}
                        mode="beat"
                        beatNum={i + 1}
                        isSelected={selectedBeat === i}
                        isActive={activePadIndex === i}
                        onMouseDown={() => { setSelectedBeat(i); handlePadDown(i); }}
                        onMouseUp={() => handlePadUp(i)}
                    />
                ))
            )}
        </div>
    );
};

export default PadsRenderer;
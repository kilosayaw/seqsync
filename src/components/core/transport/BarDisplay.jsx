// client/src/components/core/transport/BarDisplay.jsx
import React from 'react';
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStepBackward, faStepForward, faPlus, faMinus, faTrash, faCopy, faPaste } from '@fortawesome/free-solid-svg-icons';

const BarDisplay = () => {
    const { currentEditingBar, handleNavigateEditingBar } = useUIState();
    const { songData, addBar, removeBar, clearBar, copyBar, pasteBar, copiedBarData } = useSequence();
    const totalBars = songData.length;

    return (
        <div className="flex items-center gap-2">
            <Tooltip text="Previous Bar"><Button onClick={() => handleNavigateEditingBar(-1)} size="sm" variant="secondary"><FontAwesomeIcon icon={faStepBackward} /></Button></Tooltip>
            <div className="font-mono text-center">
                <span className="text-lg text-white">{currentEditingBar + 1} / {totalBars}</span>
                <div className="text-xs text-gray-400 -mt-1"># of Bars</div>
            </div>
            <Tooltip text="Next Bar"><Button onClick={() => handleNavigateEditingBar(1)} size="sm" variant="secondary"><FontAwesomeIcon icon={faStepForward} /></Button></Tooltip>
            <div className="flex items-center gap-1 border-l border-gray-700 pl-2">
                <Tooltip text="Add Bar"><Button onClick={addBar} size="xs" variant="secondary"><FontAwesomeIcon icon={faPlus} /></Button></Tooltip>
                <Tooltip text="Remove Last Bar"><Button onClick={removeBar} size="xs" variant="secondary" disabled={totalBars <= 1}><FontAwesomeIcon icon={faMinus} /></Button></Tooltip>
                <Tooltip text="Clear Bar"><Button onClick={() => clearBar(currentEditingBar)} size="xs" variant="danger"><FontAwesomeIcon icon={faTrash} /></Button></Tooltip>
            </div>
        </div>
    );
};

export default BarDisplay;
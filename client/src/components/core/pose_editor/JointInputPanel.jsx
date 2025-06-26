import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';
import VectorInputGrid from '../../common/VectorInputGrid';
import RotationKnob from '../../common/RotationKnob';
import Input from '../../common/Input';
import Button from '../../common/Button';
import ToggleButton from '../../common/ToggleButton';

// Use a standard component declaration
const JointInputPanel = ({ jointAbbrev, onClose }) => {
    const { activeBeatData, currentEditingBar, activeBeatIndex } = useUIState();
    const { updateBeatDynamics, setJointLock } = useSequence();

    const jointData = activeBeatData?.jointInfo?.[jointAbbrev] || {};
    const [lockDuration, setLockDuration] = useState(jointData.lockDuration || 1);

    useEffect(() => {
        setLockDuration(activeBeatData?.jointInfo?.[jointAbbrev]?.lockDuration || 1);
    }, [activeBeatData, jointAbbrev]);

    const handleVectorChange = useCallback((newVector) => {
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            jointInfo: { [jointAbbrev]: { vector: newVector } },
        });
    }, [currentEditingBar, activeBeatIndex, jointAbbrev, updateBeatDynamics]);

    const handleRotationChange = useCallback((newRotation) => {
        updateBeatDynamics(currentEditingBar, activeBeatIndex, {
            jointInfo: { [jointAbbrev]: { rotation: newRotation } },
        });
    }, [currentEditingBar, activeBeatIndex, jointAbbrev, updateBeatDynamics]);
    
    const handleLockToggle = useCallback(() => {
        const currentLock = jointData.lockDuration;
        if (currentLock) {
            setJointLock(currentEditingBar, activeBeatIndex, jointAbbrev, 0);
        } else {
            setJointLock(currentEditingBar, activeBeatIndex, jointAbbrev, lockDuration);
        }
    }, [jointData.lockDuration, currentEditingBar, activeBeatIndex, jointAbbrev, lockDuration, setJointLock]);

    const handleDurationChange = (e) => {
        const newDuration = parseInt(e.target.value, 10);
        setLockDuration(newDuration > 0 ? newDuration : 1);
        if (jointData.lockDuration) {
            setJointLock(currentEditingBar, activeBeatIndex, jointAbbrev, newDuration);
        }
    };
    
    return (
        <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700 w-full animate-fade-in-fast">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-pos-yellow">{jointAbbrev} Control</h3>
                <Button onClick={onClose} variant="icon" size="sm" title="Close Panel"><FontAwesomeIcon icon={faTimes} /></Button>
            </div>
            <div className="flex flex-col items-center gap-4">
                <VectorInputGrid vector={jointData.vector} onVectorChange={handleVectorChange} />
                <RotationKnob value={jointData.rotation || 0} onChange={handleRotationChange} label="ROTATION" min={-180} max={180} />
                
                <div className="w-full space-y-2 pt-2 border-t border-gray-700">
                    <ToggleButton
                        onClick={handleLockToggle}
                        isActive={!!jointData.lockDuration}
                        activeClassName="bg-blue-600 text-white"
                        inactiveClassName="bg-gray-600 text-gray-300"
                        className="w-full"
                    >
                        <FontAwesomeIcon icon={jointData.lockDuration ? faLock : faLockOpen} className="mr-2" />
                        {jointData.lockDuration ? `Locked for ${jointData.lockDuration} beats` : 'Lock Joint'}
                    </ToggleButton>
                    <Input
                        type="number"
                        label="Lock Duration (beats)"
                        value={lockDuration}
                        onChange={handleDurationChange}
                        min="1"
                        disabled={!jointData.lockDuration}
                        inputClassName="text-center"
                    />
                </div>
            </div>
        </div>
    );
};

JointInputPanel.propTypes = {
    jointAbbrev: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

// --- DEFINITIVE FIX: Use a default export ---
export default JointInputPanel; 
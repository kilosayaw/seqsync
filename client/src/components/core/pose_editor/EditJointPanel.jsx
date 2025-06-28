// src/components/studio/pose_editor/EditJointPanel.jsx
import React from 'react';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import VectorInputGrid from './VectorInputGrid';
import RotationKnob from '../../common/RotationKnob';
import KneePositionVisualizer from './KneePositionVisualizer';
import { POSE_DEFAULT_VECTOR } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const EditJointPanel = () => {
    const { activeBeatData, activeEditingJoint, setActiveEditingJoint, currentEditingBar, activeBeatIndex } = useUIState();
    const { updateBeatDynamics } = useSequence();

    if (!activeEditingJoint) return null;

    const jointData = activeBeatData?.jointInfo?.[activeEditingJoint] || {};
    const vector = jointData.vector || POSE_DEFAULT_VECTOR;
    const rotation = jointData.rotation || 0;
    const flexion = jointData.flexion || 0;

    const handleUpdate = (dataType, value) => {
        const payload = { jointInfo: { [activeEditingJoint]: { ...jointData, [dataType]: value } } };
        updateBeatDynamics(currentEditingBar, activeBeatIndex, payload);
    };

    const handleVectorUpdate = (newVector) => handleUpdate('vector', newVector);

    const isKnee = ['LK', 'RK'].includes(activeEditingJoint);
    const hasRotationControl = !isKnee;
    const hasFlexionControl = ['LE', 'RE', 'LK', 'RK'].includes(activeEditingJoint);

    return (
        <div className="p-3 bg-gray-800 rounded-lg w-full border border-pos-yellow/50 shadow-lg space-y-4 mt-4 animate-fade-in-fast">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-pos-yellow">Edit: {activeEditingJoint}</h3>
                <button onClick={() => setActiveEditingJoint(null)} className="text-gray-400 hover:text-white"><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            
            {isKnee ? (
                <div>
                    <h4 className="text-xs text-center text-gray-400 mb-1">Knee Position (Relative to Foot)</h4>
                    <div className="flex justify-center p-2 bg-black/20 rounded-md">
                       <KneePositionVisualizer
                           kneeVector={vector}
                           onUpdate={handleVectorUpdate}
                           isEditing={true}
                       />
                    </div>
                </div>
            ) : (
                <div>
                    <h4 className="text-xs text-center text-gray-400 mb-1">Position (X, Y, Z)</h4>
                    <div className="flex justify-center">
                        <VectorInputGrid vector={vector} onVectorChange={handleVectorUpdate} />
                    </div>
                </div>
            )}
            
            <div className="flex justify-around items-center gap-2 pt-2 border-t border-gray-700">
                {hasRotationControl && (
                    <div className="flex flex-col items-center">
                        <RotationKnob value={rotation} onChange={(v) => handleUpdate('rotation', v)} size={52} label="Rotation" />
                    </div>
                )}
                {hasFlexionControl && (
                    <div className="flex flex-col items-center">
                        <RotationKnob value={flexion * 100} onChange={(v) => handleUpdate('flexion', v / 100)} size={52} label="Flex/Ext" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditJointPanel;
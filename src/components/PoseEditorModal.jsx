import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import SkeletalRenderer from './SkeletalRenderer';
import './PoseEditorModal.css';

const PoseEditorModal = () => {
    const { setIsPoseEditorOpen, beatToEdit, setBeatToEdit, selectedJoint } = useUIState();
    const { updateBeatData } = useSequence();

    const editablePose = beatToEdit?.poseData;
    const currentJointData = editablePose?.keypoints?.[selectedJoint];

    const handleClose = () => {
        setIsPoseEditorOpen(false);
        setBeatToEdit(null);
    };

    const handleSave = () => {
        console.log(`[PoseEditorModal] Saving changes for global index: ${beatToEdit.globalIndex}`);
        updateBeatData(beatToEdit.globalIndex, { poseData: editablePose });
        handleClose();
    };

    // --- REWRITTEN UPDATE HANDLER ---
    const handleJointPositionChange = (axis, value) => {
        // Use a functional update to ensure we are always working with the latest state
        setBeatToEdit(prevBeatToEdit => {
            // Guard against null state, which can happen in rapid updates
            if (!prevBeatToEdit?.poseData?.keypoints || selectedJoint === null) {
                return prevBeatToEdit;
            }

            // Create a deep copy to ensure we don't mutate the original state
            const newKeypoints = JSON.parse(JSON.stringify(prevBeatToEdit.poseData.keypoints));
            
            // KEY FIX: Check if the joint exists before trying to update it
            if (newKeypoints[selectedJoint]) {
                newKeypoints[selectedJoint][axis] = parseFloat(value);
            } else {
                // This case should not happen with valid data, but it's a good safeguard
                console.warn(`Attempted to edit non-existent joint at index ${selectedJoint}`);
                return prevBeatToEdit;
            }

            // Return the new, updated state object
            return {
                ...prevBeatToEdit,
                poseData: {
                    ...prevBeatToEdit.poseData,
                    keypoints: newKeypoints,
                },
            };
        });
    };

    if (!beatToEdit) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Editing Pose - Bar: {beatToEdit.bar}, Beat: {beatToEdit.beat + 1}</h2>
                    <button onClick={handleClose} className="close-button">×</button>
                </div>
                <div className="modal-body">
                    <div className="modal-visualizer">
                        <SkeletalRenderer 
                            poseData={editablePose}
                            selectedJointId={selectedJoint}
                            width={500}
                            height={500}
                        />
                    </div>
                    <div className="modal-controls">
                        <h3>Joint Controls</h3>
                        {/* Add extra checks for robustness */}
                        {selectedJoint !== null && currentJointData && typeof currentJointData.x === 'number' ? (
                            <div className="joint-editor">
                               <h4>Editing: {currentJointData.name || `Joint #${selectedJoint}`}</h4>
                               <div className="slider-group">
                                   <label>X: {currentJointData.x.toFixed(2)}</label>
                                   <input type="range" min={0} max={1280} step={1} value={currentJointData.x} onChange={e => handleJointPositionChange('x', e.target.value)} />
                               </div>
                               <div className="slider-group">
                                   <label>Y: {currentJointData.y.toFixed(2)}</label>
                                   <input type="range" min={0} max={720} step={1} value={currentJointData.y} onChange={e => handleJointPositionChange('y', e.target.value)} />
                               </div>
                               <div className="slider-group">
                                   <label>Z: {(currentJointData.z || 0).toFixed(2)}</label>
                                   <input type="range" min={-1} max={1} step={0.01} value={currentJointData.z || 0} onChange={e => handleJointPositionChange('z', e.target.value)} />
                               </div>
                            </div>
                        ) : (
                           <p>Select a joint from the side panels to begin editing.</p>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleClose}>Cancel</button>
                    <button onClick={handleSave} className="save-button">Save & Close</button>
                </div>
            </div>
        </div>
    );
};

export default PoseEditorModal;
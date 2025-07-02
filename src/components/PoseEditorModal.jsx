import React, { useState, useEffect } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useSequence } from '../context/SequenceContext';
import './PoseEditorModal.css';

const PoseEditorModal = () => {
    const { setIsPoseEditorOpen, beatToEdit } = useUIState();
    const { updateBeatData } = useSequence();

    // Local state for the edits
    const [editablePose, setEditablePose] = useState(null);

    useEffect(() => {
        // When the modal opens, load the beat's data into local state
        if (beatToEdit && beatToEdit.poseData) {
            setEditablePose(JSON.parse(JSON.stringify(beatToEdit.poseData))); // Deep copy
        }
    }, [beatToEdit]);

    const handleClose = () => {
        setIsPoseEditorOpen(false);
    };

    const handleSave = () => {
        // Create a new data object with the updated pose
        const updatedBeatData = { ...beatToEdit, poseData: editablePose };
        // Find the global index to update the correct beat in the master array
        const globalIndex = ((beatToEdit.bar - 1) * 16) + beatToEdit.beat;
        updateBeatData(globalIndex, updatedBeatData);
        handleClose();
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
                    <div className="modal-visualizer-placeholder">
                        Skeletal Visualizer Here
                    </div>
                    <div className="modal-controls-placeholder">
                        Pose Controls Here
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
import React, { useState, useEffect } from 'react';
import './PoseEditorModal.css';

const PoseEditorModal = ({ isOpen, onClose, beatData, jointId, onSave }) => {
  // We'll use local state for edits and only save to context on 'Save'
  const [poseEdits, setPoseEdits] = useState({});

  useEffect(() => {
    // When a new beat/joint is selected, load its data into the local state
    if (beatData && beatData.poseData && beatData.poseData[jointId]) {
      setPoseEdits(beatData.poseData[jointId]);
    } else {
      // Set default state for a new pose
      setPoseEdits({
        orientation: 'NEU',
        spatial: { x: 0, y: 0, z: 0 },
        energy: 50,
      });
    }
  }, [beatData, jointId]);
  
  if (!isOpen) return null;

  const handleSave = () => {
    onSave(jointId, poseEdits);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit: {jointId} at Bar {beatData.bar}:{beatData.beat + 1}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          <div className="modal-section visual-section">
            <div className="placeholder-skeletal">2D Skeletal Figure</div>
          </div>
          <div className="modal-section controls-section">
            <div className="control-group">
              <label>Orientation</label>
              <div className="placeholder-control">IN / NEU / OUT Buttons</div>
            </div>
            <div className="control-group">
              <label>3x3 Spatial Grid</label>
              <div className="placeholder-control grid-3x3">3x3 Grid</div>
            </div>
             <div className="control-group">
              <label>Grid Increment</label>
              <div className="placeholder-control">Increment Changer</div>
            </div>
            <div className="control-group">
              <label>Energy</label>
              <div className="placeholder-control">Energy Meter</div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
};

export default PoseEditorModal;
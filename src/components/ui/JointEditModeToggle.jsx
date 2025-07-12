import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import './JointEditModeToggle.css';

const JointEditModeToggle = () => {
    const { jointEditMode, setJointEditMode, selectedJoints } = useUIState();

    // Do not render the toggle if no joint is selected
    if (selectedJoints.length === 0) {
        return null;
    }
    
    // Do not render if a foot is selected, as it has its own dedicated editor
    if (selectedJoints[0].endsWith('F')) {
        return null;
    }

    return (
        <div className="joint-edit-mode-toggle-container">
            <button
                className={`toggle-button ${jointEditMode === 'position' ? 'active' : ''}`}
                onClick={() => setJointEditMode('position')}
            >
                Position
            </button>
            <button
                className={`toggle-button ${jointEditMode === 'rotation' ? 'active' : ''}`}
                onClick={() => setJointEditMode('rotation')}
            >
                Rotation
            </button>
        </div>
    );
};

export default JointEditModeToggle;
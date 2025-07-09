// src/components/ui/JointRoleSelector.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import './JointRoleSelector.css';

const ROLES = ['mover', 'stabilizer', 'frame', 'coiled'];

const JointRoleSelector = () => {
    const { activePad, selectedJoints } = useUIState();
    const { songData, updateJointData } = useSequence();

    if (selectedJoints.length === 0 || activePad === null) {
        return <div className="joint-role-selector-placeholder">Select a Joint & Pad</div>;
    }

    const handleRoleChange = (jointId, newRole) => {
        updateJointData(activePad, jointId, { role: newRole });
    };

    return (
        <div className="joint-role-selector-container">
            {selectedJoints.map(jointId => {
                const currentRole = songData[activePad]?.joints?.[jointId]?.role || 'frame';
                return (
                    <div key={jointId} className="role-selector-row">
                        <span className="joint-label">{jointId}</span>
                        <select 
                            value={currentRole} 
                            onChange={(e) => handleRoleChange(jointId, e.target.value)}
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>
                                    {role.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}
        </div>
    );
};

export default JointRoleSelector;
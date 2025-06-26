import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { X } from 'react-feather';

// --- CONTEXT HOOKS ---
import { useUIState } from '../../contexts/UIStateContext';
import { useSequence } from '../../contexts/SequenceContext';

// --- COMPONENT IMPORTS ---
import CoordinateGridEditor from './CoordinateGridEditor';
import P5SkeletalVisualizer from '../core/pose_editor/P5SkeletalVisualizer';
import JointSelector from '../core/studio/JointSelector';

// A styled component for our new directional buttons
const DirectionButton = styled.button`
    background-color: #273142;
    border: 1px solid #334155;
    color: #94a3b8;
    font-family: monospace;
    font-size: 1.2rem;
    &:hover { background-color: #334155; }
    &.active { background-color: var(--color-accent-yellow); color: #0f172a; }
`;

const DirectionalPad = ({ currentVector, onSelect }) => {
    const directions = [
        {sh: 'LS <^', gridArea: '1 / 1'}, {sh: 'LS ^', gridArea: '1 / 2'}, {sh: 'LS ^/>', gridArea: '1 / 3'},
        {sh: 'LS <', gridArea: '2 / 1'}, {sh: 'LS 0', gridArea: '2 / 2'}, {sh: 'LS >', gridArea: '2 / 3'},
        {sh: 'LS </', gridArea: '3 / 1'}, {sh: 'LS v', gridArea: '3 / 2'}, {sh: 'LS </v', gridArea: '3 / 3'} // Placeholder for down-back
    ];

    const currentShorthand = getShorthandFromVector('LS', currentVector);

    return (
        <div style={{ display: 'grid', gridTemplate: 'repeat(3, 40px) / repeat(3, 40px)', gap: '5px' }}>
            {directions.map(({ sh, gridArea }) => {
                const notationObj = Object.values(NOTATION_MAP).find(val => val.shorthand === sh);
                if (!notationObj) return null;
                return (
                    <DirectionButton 
                        key={sh} 
                        style={{ gridArea }}
                        className={currentShorthand === sh ? 'active' : ''}
                        onClick={() => onSelect(notationObj.vector)}
                    >
                        {notationObj.symbol}
                    </DirectionButton>
                );
            })}
        </div>
    );
};

// --- The Main Component ---
const DetailEditor = ({ onClose }) => {
    const { editingBeatIndex, selectedBar, selectedJoint, setSelectedJoint } = useUIState();
    const { getBeatData, setPoseForBeat } = useSequence();

    // --- LOCAL STATE for editing to prevent re-rendering the whole app ---
    const [editablePose, setEditablePose] = useState(null);

    // Load the beat's pose into local state when the modal opens
    useEffect(() => {
        const beatData = getBeatData(selectedBar, editingBeatIndex);
        setEditablePose(beatData?.pose || createEmptyPose());
    }, [selectedBar, editingBeatIndex, getBeatData]);

    const handleVectorChange = (newVector) => {
        if (!selectedJoint || !editablePose) return;
        setEditablePose(prevPose => {
            const newPose = JSON.parse(JSON.stringify(prevPose));
            if (!newPose.jointInfo) newPose.jointInfo = {};
            if (!newPose.jointInfo[selectedJoint]) newPose.jointInfo[selectedJoint] = {};
            newPose.jointInfo[selectedJoint].vector = newVector;
            return newPose;
        });
    };

    const handleSaveChanges = () => {
        setPoseForBeat(selectedBar, editingBeatIndex, editablePose);
        onClose(); // Close modal after saving
    };

    if (!editablePose) return null; // Don't render if pose is not yet loaded

    const jointVector = editablePose.jointInfo?.[selectedJoint]?.vector;

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Edit Pose (Bar {selectedBar + 1}, Beat {editingBeatIndex + 1})</ModalTitle>
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>
                </ModalHeader>
                <ModalBody>
                    <MainColumn>
                        <div style={{ width: '100%', aspectRatio: '4 / 3', backgroundColor: '#0f172a', borderRadius: '4px' }}>
                            <P5SkeletalVisualizer poseData={editablePose} mode="2D" highlightJoint={selectedJoint} />
                        </div>
                        {/* Other main controls can go here */}
                    </MainColumn>

                    <SideColumn>
                        {/* --- ADDED JOINT SELECTORS INSIDE MODAL --- */}
                        <ControlSection>
                        <SectionTitle>Displacement</SectionTitle>
                        {/* --- UPGRADE: Use the new DirectionalPad --- */}
                        <DirectionalPad 
                            currentVector={jointVector}
                            onSelect={handleVectorChange}
                        />
                    </ControlSection>

                        <ControlSection>
                             <SectionTitle>Displacement: {selectedJoint || 'None'}</SectionTitle>
                             <InputGroup>
                                <CoordinateGridEditor 
                                    key={selectedJoint}
                                    initialVector={jointVector}
                                    onVectorChange={handleVectorChange}
                                />
                                <div className="font-mono text-xs text-slate-400 pl-4">
                                    X: {jointVector?.x || 0}<br/>
                                    Y: {jointVector?.y || 0}<br/>
                                    Z: {jointVector?.z || 0}
                                </div>
                             </InputGroup>
                        </ControlSection>

                        {/* Save Button */}
                        <button onClick={handleSaveChanges} style={{ /* ... styles for save button ... */ }}>
                            Save Details
                        </button>
                    </SideColumn>
                </ModalBody>
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default DetailEditor;
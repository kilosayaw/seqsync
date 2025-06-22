import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { X } from 'react-feather'; // <-- FIX: Import the missing icon

// --- Context Hooks ---
import { useUIState } from '../../contexts/UIStateContext';
import { useSequence } from '../../contexts/SequenceContext';

// --- Component Imports ---
import CoordinateGridEditor from './CoordinateGridEditor';
import FootControl from '../core/grounding/FootControl';
import P5SkeletalVisualizer from '../core/pose_editor/P5SkeletalVisualizer';

// --- STYLED COMPONENTS ---
const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; padding: 1rem;
`;
const ModalContainer = styled.div`
  background-color: #1e293b; border: 1px solid #334155; border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5); width: 100%; max-width: 900px;
  max-height: 95vh; display: flex; flex-direction: column;
  color: #e2e8f0; overflow: hidden;
`;
const ModalHeader = styled.div`
  padding: 1rem 1.5rem; border-bottom: 1px solid #334155; display: flex;
  justify-content: space-between; align-items: center; flex-shrink: 0;
`;
const ModalTitle = styled.h2` font-size: 1.25rem; font-weight: bold; `;
const CloseButton = styled.button`
  background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  &:hover { background-color: #334155; color: white; }
`;
const ModalBody = styled.div`
  padding: 1.5rem; display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem; overflow-y: auto;
`;
const ControlSection = styled.div`
  background-color: #273142; border-radius: 6px; padding: 1rem;
  display: flex; flex-direction: column; gap: 1rem;
`;
const SectionTitle = styled.h3`
  font-weight: bold; color: #94a3b8; margin-bottom: 0.5rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid #334155;
  font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;
`;
const Placeholder = styled.div`
  background-color: #1e293b; border: 1px dashed #475569; border-radius: 4px;
  min-height: 40px; display: flex; justify-content: center; align-items: center;
  color: #64748b; font-size: 0.8rem;
`;
const InputGroup = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
`;

const createEmptyPose = () => ({
    jointInfo: {},
    grounding: { L: null, R: null, L_weight: 50, R_weight: 50, },
});

// --- The Main Component ---
const DetailEditor = ({ onClose }) => {
    const { editingBeatIndex, selectedBar, selectedJoint } = useUIState();
    const { getBeatData, setPoseForBeat } = useSequence();

    const beatData = getBeatData(selectedBar, editingBeatIndex) || { pose: createEmptyPose() };
    const currentPose = beatData.pose || createEmptyPose();
    const jointVector = currentPose.jointInfo?.[selectedJoint]?.vector;

    const handleVectorChange = (newVector) => {
        if (!selectedJoint || !currentPose) return;
        const newPose = JSON.parse(JSON.stringify(currentPose));
        if (!newPose.jointInfo) newPose.jointInfo = {};
        if (!newPose.jointInfo[selectedJoint]) newPose.jointInfo[selectedJoint] = {};
        newPose.jointInfo[selectedJoint].vector = newVector;
        setPoseForBeat(selectedBar, editingBeatIndex, newPose);
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Edit: {selectedJoint || 'Pose'} (Bar {selectedBar + 1}, Beat {editingBeatIndex + 1})</ModalTitle>
                    {/* FIX: The <X> component is now correctly imported and rendered */}
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>
                </ModalHeader>
                <ModalBody>
                    {/* All the existing modal content... */}
                    <ControlSection>
                        <SectionTitle>Displacement (X,Y) & Depth (Z)</SectionTitle>
                        <InputGroup>
                            <CoordinateGridEditor 
                                key={selectedJoint}
                                initialVector={jointVector}
                                onVectorChange={handleVectorChange}
                            />
                            <Placeholder style={{ flex: 1, marginLeft: '1rem' }}>
                                XYZ: [{jointVector?.x || 0}, {jointVector?.y || 0}, {jointVector?.z || 0}]
                            </Placeholder>
                        </InputGroup>
                    </ControlSection>
                    <ControlSection>
                        <SectionTitle>2D Pose Preview</SectionTitle>
                        <div style={{ width: '100%', height: '180px', backgroundColor: '#0f172a', borderRadius: '4px' }}>
                            <P5SkeletalVisualizer poseData={currentPose} mode="2D" highlightJoint={selectedJoint} />
                        </div>
                    </ControlSection>
                    {/* ... etc. */}
                </ModalBody>
            </ModalContainer>
        </ModalBackdrop>
    );
};

DetailEditor.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default DetailEditor;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'react-feather';
import { useUIState } from '../../contexts/UIStateContext.jsx';
import { useSequence } from '../../contexts/SequenceContext.jsx';

import CoordinateGridEditor from '../common/CoordinateGridEditor.jsx'; 
import P5SkeletalVisualizer from '../core/pose_editor/P5SkeletalVisualizer.jsx';
import JointSelector from '../core/studio/JointSelector.jsx'; 

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
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr; /* Make the main area wider */
  gap: 1.5rem;
  overflow-y: auto;
`;
const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
    // --- FIX: Get all necessary state from contexts ---
    const { editingBeatIndex, selectedBar, selectedJoint, setSelectedJoint } = useUIState();
    const { getBeatData, setPoseForBeat } = useSequence();

    const [editablePose, setEditablePose] = useState(null);

    useEffect(() => {
        if (editingBeatIndex !== null) {
            const beatData = getBeatData(selectedBar, editingBeatIndex);
            setEditablePose(beatData?.pose || createEmptyPose());
        }
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
        // Use the function from the context to save the changes
        setPoseForBeat(selectedBar, editingBeatIndex, editablePose);
        onClose();
    };

    if (!editablePose) return null;

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
                    </MainColumn>

                    <SideColumn>
                        <ControlSection>
                            <SectionTitle>Select Joint</SectionTitle>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                <JointSelector side="left" />
                                <JointSelector side="right" />
                            </div>
                        </ControlSection>

                        <ControlSection>
                             <SectionTitle>Displacement: {selectedJoint || 'None'}</SectionTitle>
                             <InputGroup>
                                <CoordinateGridEditor 
                                    key={selectedJoint} // Key ensures it re-mounts with new initial data
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

                        <button onClick={handleSaveChanges} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">
                            Save Details
                        </button>
                    </SideColumn>
                </ModalBody>
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default DetailEditor;
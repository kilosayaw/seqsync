import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { X, Play } from 'react-feather';

// --- CONTEXT HOOKS ---
import { useUIState } from '../../contexts/UIStateContext';
import { useSequence } from '../../contexts/SequenceContext';

// --- COMPONENT IMPORTS ---
import CoordinateGridEditor from './CoordinateGridEditor';
import P5SkeletalVisualizer from '../core/pose_editor/P5SkeletalVisualizer';
import JointSelector from '../core/studio/JointSelector';

// --- FIX: RESTORED MISSING STYLED COMPONENT DEFINITIONS ---
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
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  overflow-y: auto;
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: center;
  background-color: #0f172a;
  padding: 1rem;
  border-radius: 8px;
`;

const PreviewPane = styled.div`
  aspect-ratio: 4 / 3;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  position: relative;
  
  &.main-preview {
    border: 2px solid var(--color-accent-yellow);
  }
`;

const PreviewLabel = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(15, 23, 42, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #94a3b8;
`;
const SideColumn = styled.div`
  display: flex; flex-direction: column; gap: 1rem;
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
const InputGroup = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
`;
const SaveButton = styled.button`
    padding: 10px 20px; border-radius: 6px; border: none;
    background-color: #38bdf8; color: white;
    cursor: pointer; align-self: flex-end; font-weight: bold;
    &:hover { background-color: #7dd3fc; }
`;


const Dropdown = styled.select`
  width: 100%;
  background-color: #1e293b;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 8px;
  border-radius: 4px;
`;

const PlayButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 8px 12px;
    background-color: #273142;
    border: 1px solid #475569;
    color: #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    &:hover { background-color: #334155; }
`;

// --- Main Component ---
const DetailEditor = ({ onClose }) => {
    const { editingBeatIndex, selectedBar, selectedJoint, setSelectedJoint } = useUIState();
    const { getBeatData, setPoseForBeat, triggerBeat } = useSequence();

    const [editablePose, setEditablePose] = useState(null);

    // Memoize previous and next beat data for stability
    const { prevBeatData, nextBeatData } = useMemo(() => {
        const prevIndex = editingBeatIndex > 0 ? editingBeatIndex - 1 : 15;
        const prevBar = editingBeatIndex > 0 ? selectedBar : selectedBar - 1;
        
        const nextIndex = editingBeatIndex < 15 ? editingBeatIndex + 1 : 0;
        const nextBar = editingBeatIndex < 15 ? selectedBar : selectedBar + 1;
        
        return {
            prevBeatData: getBeatData(prevBar, prevIndex),
            nextBeatData: getBeatData(nextBar, nextIndex)
        };
    }, [selectedBar, editingBeatIndex, getBeatData]);

    useEffect(() => {
        const beatData = getBeatData(selectedBar, editingBeatIndex);
        setEditablePose(beatData?.pose || createEmptyPose());
    }, [selectedBar, editingBeatIndex, getBeatData]);

    const handleDataChange = (path, value) => {
        if (!selectedJoint || !editablePose) return;
        
        setEditablePose(prevPose => {
            const newPose = JSON.parse(JSON.stringify(prevPose));
            if (!newPose.jointInfo[selectedJoint]) {
                newPose.jointInfo[selectedJoint] = {};
            }
            // Simple path assignment for now, can be made more robust for nested paths
            newPose.jointInfo[selectedJoint][path] = value;
            return newPose;
        });
    };
    
    const handleSaveChanges = () => {
        setPoseForBeat(selectedBar, editingBeatIndex, editablePose);
        onClose();
    };

    if (!editablePose) return null;

    const jointData = editablePose.jointInfo?.[selectedJoint] || {};

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Edit: {selectedJoint || 'Pose'} (Bar {selectedBar + 1}, Beat {editingBeatIndex + 1})</ModalTitle>
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>
                </ModalHeader>
                <ModalBody>
                    <MainColumn>
                        <PreviewContainer>
                            <PreviewPane><P5SkeletalVisualizer poseData={prevBeatData?.pose} /><PreviewLabel>Previous</PreviewLabel></PreviewPane>
                            <PreviewPane className="main-preview"><P5SkeletalVisualizer poseData={editablePose} highlightJoint={selectedJoint} /><PreviewLabel>Current</PreviewLabel></PreviewPane>
                            <PreviewPane><P5SkeletalVisualizer poseData={nextBeatData?.pose} /><PreviewLabel>Next</PreviewLabel></PreviewPane>
                        </PreviewContainer>
                        {/* Other controls can go here */}
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
                            <CoordinateGridEditor 
                                key={selectedJoint} // Re-mounts when joint changes
                                initialVector={jointData.vector}
                                onVectorChange={(vec) => handleDataChange('vector', vec)}
                            />
                        </ControlSection>
                        <ControlSection>
                            <SectionTitle>Parameters</SectionTitle>
                            <Dropdown value={jointData.rotation || 'NEU'} onChange={e => handleDataChange('rotation', e.target.value)}>
                                <option value="NEU">Rotation: Neutral</option>
                                <option value="IN">Rotation: Internal</option>
                                <option value="OUT">Rotation: External</option>
                            </Dropdown>
                             <Dropdown value={jointData.intent || 'None'} onChange={e => handleDataChange('intent', e.target.value)}>
                                <option value="None">Intent: None</option>
                                <option value="Strike">Intent: Strike</option>
                            </Dropdown>
                        </ControlSection>
                        <InputGroup>
                            <PlayButton onClick={() => triggerBeat(selectedBar, editingBeatIndex)}>
                                <Play size={16}/> Preview Sound
                            </PlayButton>
                            <SaveButton onClick={handleSaveChanges}>Save Details</SaveButton>
                        </InputGroup>
                    </SideColumn>
                </ModalBody>
            </ModalContainer>
        </ModalBackdrop>
    );
};

// ... propTypes ...
export default DetailEditor;
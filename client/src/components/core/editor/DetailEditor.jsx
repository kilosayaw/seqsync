import React from 'react';
import styled from 'styled-components';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';
import P5SkeletalVisualizer from '../pose_editor/P5SkeletalVisualizer';
import JointEditorPanel from './JointEditorPanel'; // We will create this next

const EditorLayout = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 900px; /* Give the editor more space */
`;

const VisualizerColumn = styled.div`
    flex-grow: 1;
`;

const ControlsColumn = styled.div`
    flex-shrink: 0;
    width: 250px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const DetailEditor = () => {
    const { selectedBar, selectedBeat, selectedJoint } = useUIState();
    const { getBeatData } = useSequence();

    if (selectedBeat === null) {
        return <div style={{width: '640px', height: '360px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px'}}>Select a beat in Edit Mode.</div>;
    }
    
    const beatData = getBeatData(selectedBar, selectedBeat);
    const pose = beatData?.pose;

    return (
        <EditorLayout>
            <VisualizerColumn>
                {/* The main visualizer shows the full pose for context */}
                {pose && <P5SkeletalVisualizer poseData={pose} highlightJoint={selectedJoint} mode="3D" />}
            </VisualizerColumn>
            <ControlsColumn>
                {/* The editor panel only appears when a joint is selected */}
                {selectedJoint ? (
                    <JointEditorPanel 
                        key={`${selectedBar}-${selectedBeat}-${selectedJoint}`} // Force re-mount on selection change
                        barIndex={selectedBar}
                        beatIndex={selectedBeat}
                        jointAbbrev={selectedJoint}
                    />
                ) : (
                    <div style={{color: '#777'}}>Select a joint to edit its parameters.</div>
                )}
            </ControlsColumn>
        </EditorLayout>
    );
};

export default DetailEditor;
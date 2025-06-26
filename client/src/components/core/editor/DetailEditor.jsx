import React from 'react';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';

const EditorContainer = styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    background-color: #1e293b;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    color: white;
`;

const DetailEditor = () => {
    const { editingBeatIndex, selectedBar } = useUIState();
    const { getBeatData } = useSequence();

    if (editingBeatIndex === null) {
        return (
            <EditorContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
                <p>Select a beat to edit.</p>
            </EditorContainer>
        );
    }
    
    const beatData = getBeatData(selectedBar, editingBeatIndex);

    return (
        <EditorContainer>
            <h2>Editing Bar {selectedBar + 1}, Beat {editingBeatIndex + 1}</h2>
            {/* Future content will go here */}
        </EditorContainer>
    );
};

export default DetailEditor;
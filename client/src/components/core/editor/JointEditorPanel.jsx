import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSequence } from '../../../contexts/SequenceContext';

const PanelContainer = styled.div`
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 1rem;
    color: #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Title = styled.h3`
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--color-accent);
    margin: 0;
`;

const ControlRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Label = styled.label`
    font-size: 0.9rem;
    color: #a1a1aa;
`;

const Select = styled.select`
    background-color: #27272a;
    color: #e2e8f0;
    border: 1px solid #3f3f46;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
`;


const JointEditorPanel = ({ barIndex, beatIndex, jointAbbrev }) => {
    const { getBeatData, setJointOrientation } = useSequence(); // We will need a new function in SequenceContext
    
    const [jointData, setJointData] = useState(null);

    useEffect(() => {
        const beat = getBeatData(barIndex, beatIndex);
        setJointData(beat?.pose?.jointInfo?.[jointAbbrev]);
    }, [barIndex, beatIndex, jointAbbrev, getBeatData]);

    const handleOrientationChange = (e) => {
        const newOrientation = e.target.value;
        setJointOrientation(barIndex, beatIndex, jointAbbrev, newOrientation);
    };

    if (!jointData) {
        return <PanelContainer>No data for this joint.</PanelContainer>;
    }

    return (
        <PanelContainer>
            <Title>Edit: {jointAbbrev}</Title>
            <ControlRow>
                <Label htmlFor="orientation-select">Rotation</Label>
                <Select id="orientation-select" value={jointData.orientation || 'NEU'} onChange={handleOrientationChange}>
                    <option value="IN">Internal (IN)</option>
                    <option value="NEU">Neutral (NEU)</option>
                    <option value="OUT">External (OUT)</option>
                </Select>
            </ControlRow>
            {/* We will add more controls here for FLEX/EXT, Intent, etc. */}
        </PanelContainer>
    );
};

JointEditorPanel.propTypes = {
    barIndex: PropTypes.number.isRequired,
    beatIndex: PropTypes.number.isRequired,
    jointAbbrev: PropTypes.string.isRequired,
};

export default JointEditorPanel;
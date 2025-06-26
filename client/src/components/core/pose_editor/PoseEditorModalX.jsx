import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useSequence } from '../../../contexts/SequenceContext';
import { generateNotationForBeat } from '../../../utils/notationUtils';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  width: 90vw;
  max-width: 1200px;
  border: 1px solid #334155;
  color: #e2e8f0;
  font-family: 'Share Tech Mono', monospace;
  position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
    &:hover {
        color: white;
    }
`;

// This component now correctly receives and uses the beatDataRef prop
const PoseEditorModal = ({ isOpen, onClose, beatDataRef }) => {
    const { getBeatData } = useSequence();
    const [notation, setNotation] = useState(null);

    useEffect(() => {
        // The check for beatDataRef is the key
        if (beatDataRef) {
            const beatData = getBeatData(beatDataRef.bar, beatDataRef.beat);
            const generated = generateNotationForBeat(beatDataRef.bar, beatDataRef.beat, beatData, {mm:0, ss:0, cs:0});
            setNotation(generated);
        } else {
            setNotation(null); // Clear notation if no beat is selected
        }
    }, [beatDataRef, getBeatData]);

    if (!isOpen || !beatDataRef) return null; // Don't render if not open or no data ref

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>×</CloseButton>
                <h2>Pose Editor for Bar {beatDataRef.bar + 1}, Beat {beatDataRef.beat + 1}</h2>
                <hr style={{borderColor: '#334155', margin: '1rem 0'}} />
                {notation ? (
                    <div>
                        <h3>Shorthand:</h3>
                        <p style={{background: '#0f172a', padding: '0.5rem', borderRadius: '4px'}}>{notation.shorthand}</p>
                        <h3>Plain English:</h3>
                        <p>{notation.plainEnglish}</p>
                        <h3>Analysis:</h3>
                        <p>{notation.analysis}</p>
                    </div>
                ) : (
                    <p>Loading notation...</p>
                )}
            </ModalContent>
        </ModalBackdrop>
    );
};

// <<< FIX: The PropTypes now correctly match the props being passed >>>
PoseEditorModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    beatDataRef: PropTypes.shape({
        bar: PropTypes.number,
        beat: PropTypes.number
    }), // It can be null when the modal is closed
};

export default PoseEditorModal;
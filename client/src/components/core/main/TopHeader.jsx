import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LoadSave from '../../common/LoadSave';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState } from '../../../contexts/UIStateContext';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--color-background-darker, #1a1a1a);
  border-bottom: 1px solid var(--color-border, #333);
  flex-shrink: 0; /* Prevent header from shrinking */
`;

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem; /* 12px */
`;

const Button = styled.button`
    padding: 8px 12px;
    background-color: ${({ $active }) => ($active ? 'var(--color-accent, #00AACC)' : '#444')};
    border: 1px solid ${({ $active }) => ($active ? 'var(--color-accent-light, #00FFFF)' : '#666')};
    color: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.875rem;
    transition: all 0.2s ease-in-out;
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    &:hover:not(:disabled) {
        border-color: var(--color-accent-light, #7FFFD4);
    }
`;

const RecordButton = styled(Button)`
    background-color: ${({ $active }) => ($active ? '#FF0000' : '#444')};
    border-color: ${({ $active }) => ($active ? '#FF6666' : '#666')};
`;

const BPMDisplay = styled.div`
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    color: var(--color-text, #FFF);
    padding: 8px 12px;
    background-color: #222;
    border-radius: 4px;
    min-width: 80px;
    text-align: center;
`;

const TimecodeDisplay = styled(BPMDisplay)`
    font-size: 1.2rem;
    min-width: 100px;
    letter-spacing: 2px;
`;

const TopHeader = ({ onSave, onLoad, onFileSelected, onOpenPoseEditor }) => {
    const { undo, redo, canUndo, canRedo } = useSequence();
    const { 
        isPlaying, togglePlay, 
        isRecording, toggleRecord, 
        isMetronomeEnabled, toggleMetronome,
        bpm, tapTempo, currentStep
    } = usePlayback();
    const { 
        isLiveCamActive, toggleLiveCam,
        isMirrored, toggleMirror,
        selectedBar
    } = useUIState();

    return (
        <HeaderContainer>
            <ControlGroup>
                <h1>SĒQsync</h1>
                <LoadSave
                    onSave={onSave}
                    onLoad={onLoad}
                    onFileSelected={onFileSelected}
                />
            </ControlGroup>
            <ControlGroup>
                <Button onClick={toggleLiveCam} $active={isLiveCamActive}>Live Cam</Button>
                <Button onClick={toggleMirror} $active={isMirrored} disabled={!isLiveCamActive}>Mirror</Button>
                <RecordButton onClick={toggleRecord} $active={isRecording} disabled={!isLiveCamActive}>Record</RecordButton>
                
                <TimecodeDisplay>
                    {String(selectedBar + 1).padStart(2, '0')}:
                    {/* Display 00 if playback is stopped, otherwise show the current beat */}
                    {isPlaying ? String(currentStep + 1).padStart(2, '0') : '00'}
                </TimecodeDisplay>
                <BPMDisplay>{bpm.toFixed(0)}</BPMDisplay>
                <Button onClick={tapTempo}>Tap</Button>
                <Button onClick={toggleMetronome} $active={isMetronomeEnabled}>Metronome</Button>
                <Button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Play'}</Button>

                <Button onClick={undo} disabled={!canUndo}>Undo</Button>
                <Button onClick={redo} disabled={!canRedo}>Redo</Button>
                <Button onClick={onOpenPoseEditor}>Pose Editor</Button>
            </ControlGroup>
        </HeaderContainer>
    );
};

TopHeader.propTypes = {
    onSave: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
    onFileSelected: PropTypes.func.isRequired,
    onOpenPoseEditor: PropTypes.func.isRequired,
};

export default TopHeader;
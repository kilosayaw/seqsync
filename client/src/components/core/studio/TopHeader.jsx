import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// --- CONTEXT HOOKS ---
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useUIState, MODES } from '../../../contexts/UIStateContext';
import { useSequencerSettings } from '../../../contexts/SequencerSettingsContext';

// --- STYLED COMPONENTS ---
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--color-background-darker, #1a1a1a);
  border-bottom: 1px solid var(--color-border, #333);
  flex-shrink: 0;
`;

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const Button = styled.button`
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: bold;
    background-color: ${({ $active }) => ($active ? 'var(--color-accent, #00AACC)' : '#444')};
    border: 1px solid ${({ $active }) => ($active ? 'var(--color-accent-light, #00FFFF)' : '#666')};
    color: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    &:hover:not(:disabled) {
        border-color: var(--color-accent-light, #7FFFD4);
    }
`;

const RecordButton = styled(Button)`
    background-color: ${({ $active }) => ($active ? '#e11d48' : '#444')};
    border-color: ${({ $active }) => ($active ? '#fb7185' : '#666')};
    &:hover:not(:disabled) {
        background-color: ${({ $active }) => ($active ? '#fb7185' : '#555')};
    }
`;

const Display = styled.div`
    font-family: var(--font-digital-solid, 'Orbitron', monospace);
    color: var(--color-text, #FFF);
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 1.25rem;
    text-align: center;
    line-height: 1;
`;

const BPMDisplay = styled(Display)`
    min-width: 80px;
    color: #67e8f9;
`;

const BarBeatDisplay = styled(Display)`
    min-width: 120px;
    color: #fef08a;
`;

// --- The Main Header Component ---
const TopHeader = ({ onSave, onLoad, onLoadAudio, onToggleLiveCam }) => {
    const { undo, redo, canUndo, canRedo } = useSequence();
    const { 
        isPlaying, togglePlay, 
        isRecording, toggleRecord, 
        isMetronomeEnabled, toggleMetronome, 
        tapTempo,
        currentBar,
    } = usePlayback();
    const { bpm } = useSequencerSettings();
    const { 
        isLiveCamActive,
        isMirrored, toggleMirror,
        selectedBar, setSelectedBar,
        isEditMode, toggleEditMode,
        currentMode, setCurrentMode,
        isNudgeModeActive, setNudgeModeActive
    } = useUIState();

    const goToNextBar = () => setSelectedBar(prev => Math.min(3, prev + 1));
    const goToPrevBar = () => setSelectedBar(prev => Math.max(0, prev - 1));

    const displayBar = isPlaying ? currentBar + 1 : selectedBar + 1;

    return (
        <HeaderContainer>
            <ControlGroup>
                <Button onClick={onSave}>Save</Button>
                <Button onClick={onLoad}>Load Seq</Button>
                <Button onClick={onLoadAudio}>Load Audio</Button>
            </ControlGroup>
            
            <ControlGroup>
                 <Button onClick={goToPrevBar}>{'<'}</Button>
                 <BarBeatDisplay>
                    BAR {String(displayBar).padStart(2, '0')}
                 </BarBeatDisplay>
                 <Button onClick={goToNextBar}>{'>'}</Button>
            </ControlGroup>

            <ControlGroup>
                <BPMDisplay>{bpm.toFixed(0)}</BPMDisplay>
                <Button onClick={tapTempo}>Tap</Button>
                <Button onClick={() => setNudgeModeActive(prev => !prev)} $active={isNudgeModeActive}>
                    Nudge
                </Button>
            </ControlGroup>

            <ControlGroup>
                <Button onClick={() => setCurrentMode(MODES.SEQ)} $active={currentMode === MODES.SEQ}>SEQ</Button>
                <Button onClick={() => setCurrentMode(MODES.POS)} $active={currentMode === MODES.POS}>POS</Button>
                <Button onClick={onToggleLiveCam} $active={isLiveCamActive}>Live</Button>
                <Button onClick={toggleMirror} $active={isMirrored} disabled={!isLiveCamActive}>Mirror</Button>
                <RecordButton onClick={toggleRecord} $active={isRecording} disabled={!isLiveCamActive}>Rec</RecordButton>
                <Button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Play'}</Button>
                <Button onClick={toggleMetronome} $active={isMetronomeEnabled}>Click</Button>
                <Button onClick={undo} disabled={!canUndo}>Undo</Button>
                <Button onClick={redo} disabled={!canRedo}>Redo</Button>
                <Button onClick={toggleEditMode} $active={isEditMode}>Edit</Button>
            </ControlGroup>
        </HeaderContainer>
    );
};

TopHeader.propTypes = {
    onSave: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
    onLoadAudio: PropTypes.func.isRequired,
    onToggleLiveCam: PropTypes.func.isRequired,
};

export default TopHeader;
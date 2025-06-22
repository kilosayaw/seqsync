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
  background-color: #1e293b;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
  user-select: none;
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
    background-color: ${({ $active }) => ($active ? '#38bdf8' : '#334155')};
    border: 1px solid ${({ $active }) => ($active ? '#7dd3fc' : '#475569')};
    color: white;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background-color: #334155;
        border-color: #475569;
    }
    &:hover:not(:disabled) {
        border-color: #7dd3fc;
    }
`;

const RecordButton = styled(Button)`
    background-color: ${({ $active }) => ($active ? '#f43f5e' : '#334155')};
    border-color: ${({ $active }) => ($active ? '#fb7185' : '#475569')};
    &:hover:not(:disabled) {
        background-color: ${({ $active }) => ($active ? '#fb7185' : '#475569')};
    }
`;

const Display = styled.div`
    font-family: var(--font-digital-solid, 'Orbitron', monospace);
    color: #e2e8f0;
    background-color: #0f172a;
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


const TopHeader = ({ onSave, onLoad, onLoadAudio, onToggleLiveCam }) => {
    const { undo, redo, canUndo, canRedo } = useSequence();
    const { isPlaying, togglePlay, isRecording, toggleRecord, isMetronomeEnabled, toggleMetronome, tapTempo, currentBar } = usePlayback();
    const { bpm } = useSequencerSettings();
    const { 
        isLiveCamActive, isMirrored, toggleMirror, selectedBar, setSelectedBar,
        isEditMode, toggleEditMode, currentMode, setCurrentMode, isNudgeModeActive, 
        setNudgeModeActive, is2dOverlayEnabled, set2dOverlayEnabled 
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
                 <BarBeatDisplay>BAR {String(displayBar).padStart(2, '0')}</BarBeatDisplay>
                 <Button onClick={goToNextBar}>{'>'}</Button>
            </ControlGroup>
            <ControlGroup>
                <BPMDisplay>{bpm.toFixed(0)}</BPMDisplay>
                <Button onClick={tapTempo}>Tap</Button>
                <Button onClick={() => setNudgeModeActive(true)} $active={isNudgeModeActive}>Nudge</Button>
            </ControlGroup>
            <ControlGroup>
                <Button onClick={() => setCurrentMode(MODES.SEQ)} $active={currentMode === MODES.SEQ}>SEQ</Button>
                <Button onClick={() => setCurrentMode(MODES.POS)} $active={currentMode === MODES.POS}>POS</Button>
            </ControlGroup>
            <ControlGroup>
                <Button onClick={onToggleLiveCam} $active={isLiveCamActive}>Live</Button>
                {/* --- FIX: ADDED 2D OVERLAY TOGGLE --- */}
                <Button onClick={() => set2dOverlayEnabled(p => !p)} $active={is2dOverlayEnabled} disabled={!isLiveCamActive}>2D</Button>
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
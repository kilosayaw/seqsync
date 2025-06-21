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
`;

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const Button = styled.button`
    padding: 6px 10px;
    font-size: 0.8rem;
    background-color: ${({ $active }) => ($active ? 'var(--color-accent, #00AACC)' : '#444')};
    border: 1px solid ${({ $active }) => ($active ? 'var(--color-accent-light, #00FFFF)' : '#666')};
    color: white;
    cursor: pointer;
    border-radius: 4px;
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

const Display = styled.div`
    font-family: 'Orbitron', sans-serif;
    color: var(--color-text, #FFF);
    background-color: #222;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 1rem;
    text-align: center;
`;

const BPMDisplay = styled(Display)`
    min-width: 60px;
`;

const BarBeatDisplay = styled(Display)`
    min-width: 100px;
`;

// FIX: Component signature no longer accepts onOpenPoseEditor
const TopHeader = ({ onSave, onLoad, onFileSelected }) => {
    const { undo, redo, canUndo, canRedo } = useSequence();
    const { 
        isPlaying, togglePlay, 
        isRecording, toggleRecord, 
        isMetronomeEnabled, toggleMetronome, 
        bpm, tapTempo,
        bar // Get bar from playback context for display
    } = usePlayback();
    const { 
        isLiveCamActive, toggleLiveCam,
        isMirrored, toggleMirror,
        selectedBar, setSelectedBar,
        visualizerMode, setVisualizerMode,
        isEditMode, toggleEditMode
    } = useUIState();

    const goToNextBar = () => setSelectedBar(prev => prev + 1);
    const goToPrevBar = () => setSelectedBar(prev => Math.max(0, prev - 1));
    const handleToggleVisualizer = () => setVisualizerMode(prev => prev === '2D' ? '3D' : '2D');

    return (
        <HeaderContainer>
            <ControlGroup>
                <h1>SĒQsync</h1>
                <LoadSave onSave={onSave} onLoad={onLoad} onFileSelected={onFileSelected} />
            </ControlGroup>
            
            <ControlGroup>
                 <Button onClick={goToPrevBar} disabled={selectedBar === 0}>{'<'}</Button>
                 {/* Use selectedBar from UIState as it's the user-facing control */}
                 <BarBeatDisplay>BAR {String(selectedBar + 1).padStart(2, '0')}</BarBeatDisplay>
                 <Button onClick={goToNextBar}>{'>'}</Button>
            </ControlGroup>

            <ControlGroup>
                <Button onClick={toggleLiveCam} $active={isLiveCamActive}>Live Cam</Button>
                <Button onClick={toggleMirror} $active={isMirrored} disabled={!isLiveCamActive}>Mirror</Button>
                <Button onClick={handleToggleVisualizer} disabled={!isLiveCamActive}>{visualizerMode}</Button>
                <BPMDisplay>{bpm.toFixed(0)}</BPMDisplay>
                <Button onClick={tapTempo}>Tap</Button>
                <RecordButton onClick={toggleRecord} $active={isRecording} disabled={!isLiveCamActive}>Record</RecordButton>
                <Button onClick={toggleMetronome} $active={isMetronomeEnabled}>Metronome</Button>
                <Button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Play'}</Button>
                <Button onClick={undo} disabled={!canUndo}>Undo</Button>
                <Button onClick={redo} disabled={!canRedo}>Redo</Button>
                <Button onClick={toggleEditMode} $active={isEditMode}>Edit</Button>
            </ControlGroup>
        </HeaderContainer>
    );
};

// FIX: The propType for onOpenPoseEditor is removed
TopHeader.propTypes = {
    onSave: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
    onFileSelected: PropTypes.func.isRequired,
};

export default TopHeader;
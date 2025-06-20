import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSequence } from '../../../contexts/SequenceContext';
import LoadSave from '../../common/LoadSave';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useUIState } from '../../../contexts/UIStateContext';

// <<< FIX: The missing styled-component definitions are now included >>>
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--color-background-darker);
  border-bottom: 1px solid var(--color-border);
`;

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const Button = styled.button`
    padding: 8px 12px;
    background-color: ${({ $active }) => ($active ? 'var(--color-accent)' : '#444')};
    border: 1px solid ${({ $active }) => ($active ? 'var(--color-accent-light)' : '#666')};
    color: white;
    cursor: pointer;
    border-radius: 4px;
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const RecordButton = styled(Button)`
    background-color: ${({ $active }) => ($active ? '#FF0000' : '#444')};
    border-color: ${({ $active }) => ($active ? '#FF6666' : '#666')};
`;

const StudioHeader = ({ onOpenPoseEditor, onFileSelect, onToggleLiveCam, isLiveCamActive, onToggleMirror, isMirrored }) => {
  const { undo, redo, canUndo, canRedo } = useSequence();
  const { 
    isPlaying, togglePlay, 
    isRecording, toggleRecord,
    isMetronomeEnabled, toggleMetronome // Get metronome state and function
  } = usePlayback();
  const { visualizerMode, setVisualizerMode } = useUIState();

  const handleToggleVisualizer = () => {
      setVisualizerMode(prev => prev === '2D' ? '3D' : '2D');
  };

  const handleSave = () => console.log('Save action triggered');
  const handleLoad = () => console.log('Load action triggered');

  return (
    <HeaderContainer>
      <ControlGroup>
        <h1>SĒQsync</h1>
        <LoadSave
          onSave={handleSave}
          onLoad={handleLoad}
          onFileSelected={onFileSelect}
        />
      </ControlGroup>
      <ControlGroup>
          <Button onClick={onToggleLiveCam} $active={isLiveCamActive}>Live Cam</Button>
          <Button onClick={onToggleMirror} $active={isMirrored} disabled={!isLiveCamActive}>Mirror</Button>
          <Button onClick={handleToggleVisualizer} disabled={!isLiveCamActive}>
            {visualizerMode}
          </Button>
          <RecordButton 
            onClick={toggleRecord} 
            $active={isRecording} 
            disabled={!isLiveCamActive}
          >
            Record
          </RecordButton>
          <Button onClick={toggleMetronome} $active={isMetronomeEnabled}>Metronome</Button>
          <Button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Play'}</Button>
          <Button onClick={undo} disabled={!canUndo}>Undo</Button>
          <Button onClick={redo} disabled={!canRedo}>Redo</Button>
          <Button onClick={onOpenPoseEditor}>Pose Editor</Button>
      </ControlGroup>
    </HeaderContainer>
  );
};

// Add all required prop types for completeness
StudioHeader.propTypes = {
  onOpenPoseEditor: PropTypes.func.isRequired,
  onFileSelect: PropTypes.func.isRequired,
  onToggleLiveCam: PropTypes.func.isRequired,
  isLiveCamActive: PropTypes.bool.isRequired,
  onToggleMirror: PropTypes.func.isRequired,
  isMirrored: PropTypes.bool.isRequired,
};

export default StudioHeader;
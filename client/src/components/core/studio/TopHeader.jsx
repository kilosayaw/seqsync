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
  flex-shrink: 0;
`;

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
    min-width: 120px;
    letter-spacing: 1px;
`;

const BarBeatDisplay = styled(BPMDisplay)`
    font-size: 1.2rem;
    min-width: 100px;
`;

// Helper function to format time in MM:SS:MS format
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 1000) % 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(3, '0')}`;
};

const TopHeader = ({ onSave, onLoad, onFileSelected, onOpenPoseEditor }) => {
    const { undo, redo, canUndo, canRedo } = useSequence();
    const { 
        isPlaying, togglePlay, 
        isMetronomeEnabled, toggleMetronome,
        bpm, tapTempo, currentStep,
        bar, elapsedTime // Get all the new values from the playback context
    } = usePlayback();
    const { isLiveCamActive, toggleLiveCam, isMirrored, toggleMirror } = useUIState();

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
                
                {/* All the new and updated displays */}
                <TimecodeDisplay>{formatTime(elapsedTime)}</TimecodeDisplay>
                <BarBeatDisplay>
                    {String(bar).padStart(2, '0')}:
                    {/* When stopped, show 00, otherwise show the beat + 1 */}
                    {isPlaying ? String(currentStep + 1).padStart(2, '0') : '00'}
                </BarBeatDisplay>
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
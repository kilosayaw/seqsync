// /client/src/components/core/studio/TopHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { MODES } from '../../../contexts/UIStateContext.jsx';
import ViewOptionsToggle from '../../common/ViewOptionsToggle.jsx';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #1e293b;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
`;
const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;
const Button = styled.button`
    padding: 6px 10px;
    font-size: 0.8rem;
    font-weight: bold;
    background-color: ${({ $active }) => ($active ? '#0ea5e9' : '#334155')};
    border: 1px solid #475569;
    color: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    &:hover:not(:disabled) {
        border-color: #38bdf8;
    }
`;
const RecordButton = styled(Button)`
    background-color: ${({ $active }) => ($active ? '#ef4444' : '#334155')};
    border-color: ${({ $active }) => ($active ? '#f87171' : '#475569')};
`;
const BarDisplayInput = styled.input`
    font-family: 'Orbitron', sans-serif;
    color: #fef08a;
    background-color: #0f172a;
    border: 1px solid #334155;
    border-radius: 4px;
    padding: 6px;
    font-size: 1.25rem;
    text-align: center;
    line-height: 1;
    width: 60px;
`;
const BpmDisplay = styled(BarDisplayInput)`
    color: #67e8f9;
    width: 70px;
`;

const TopHeader = ({
  onNew, onSave, onLoad, onLoadAudio, onAnalyzeVideo, isAnalyzing,
  selectedBar, totalBars, onBarChange,
  bpm, onBpmChange, onTapTempo,
  currentMode, onModeChange,
  isRecording, onToggleRecord,
  isPlaying, onTogglePlay,
  isMetronomeEnabled, onToggleMetronome,
  onUndo, onRedo, canUndo, canRedo,
  isEditMode, onToggleEditMode,
  isNudgeModeActive, onToggleNudgeMode,
}) => {
    return (
        <HeaderContainer>
            <ControlGroup>
                <Button onClick={onNew}>New</Button>
                <Button onClick={onSave}>Save</Button>
                <Button onClick={onLoad}>Load Seq</Button>
                <Button onClick={onLoadAudio}>Load Media</Button>
                <Button onClick={onAnalyzeVideo} disabled={isAnalyzing}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
            </ControlGroup>
            
            <ControlGroup>
                 <Button onClick={() => onBarChange(selectedBar - 1)} disabled={selectedBar <= 0}>{'<'}</Button>
                 <BarDisplayInput
                    type="number"
                    value={selectedBar + 1}
                    onChange={(e) => onBarChange(parseInt(e.target.value, 10) - 1)}
                    min="1"
                    max={totalBars}
                 />
                 <span className="text-slate-400">/ {totalBars}</span>
                 <Button onClick={() => onBarChange(selectedBar + 1)} disabled={selectedBar >= totalBars - 1}>{'>'}</Button>
            </ControlGroup>

            <ControlGroup>
                <BpmDisplay type="number" value={Math.round(bpm)} onChange={(e) => onBpmChange(e.target.value)} />
                <Button onClick={onTapTempo}>Tap</Button>
                <Button onClick={onToggleNudgeMode} $active={isNudgeModeActive}>Nudge</Button>
            </ControlGroup>

            <ControlGroup>
                <Button onClick={() => onModeChange(MODES.SEQ)} $active={currentMode === MODES.SEQ}>SEQ</Button>
                <Button onClick={() => onModeChange(MODES.POS)} $active={currentMode === MODES.POS}>POS</Button>
            </ControlGroup>

            {/* --- FIX: The old view buttons are replaced with the new dropdown component --- */}
            <ControlGroup>
                <ViewOptionsToggle />
            </ControlGroup>

            <ControlGroup>
                <RecordButton onClick={onToggleRecord} $active={isRecording}>Rec</RecordButton>
                <Button onClick={onTogglePlay}>{isPlaying ? 'Stop' : 'Play'}</Button>
                <Button onClick={onToggleMetronome} $active={isMetronomeEnabled}>Click</Button>
            </ControlGroup>
            
            <ControlGroup>
                <Button onClick={onUndo} disabled={!canUndo}>Undo</Button>
                <Button onClick={onRedo} disabled={!canRedo}>Redo</Button>
                <Button onClick={onToggleEditMode} $active={isEditMode}>Edit</Button>
            </ControlGroup>
        </HeaderContainer>
    );
};

// --- PROP TYPES (The old view toggle props are removed) ---
TopHeader.propTypes = {
  onNew: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onLoadAudio: PropTypes.func.isRequired,
  // ... all other props are correct ...
};

export default TopHeader;
import React from 'react';
import { MODES } from '../../../contexts/UIStateContext';

// Import the new consolidated component
import ViewOptionsToggle from '../../common/ViewOptionsToggle.jsx';

// Reusable Button component
const Button = ({ onClick, children, active = false, disabled = false }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1 text-sm rounded transition-colors duration-200
            ${disabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 
            active ? 'bg-emerald-500 text-white' : 
            'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}
    >
        {children}
    </button>
);

const TopHeader = ({
    onNew, onSave, onLoad, onLoadAudio, onAnalyzeVideo, isAnalyzing,
    selectedBar, totalBars, onBarChange,
    bpm, onBpmChange, onTapTempo,
    currentMode, onModeChange,
    isLiveCamActive, onToggleLiveCam,
    isFeedMirrored, onToggleFeedMirror,
    isOverlayMirrored, onToggleOverlayMirror,
    isRecording, onToggleRecord, isPlaying, onTogglePlay, isMetronomeEnabled, onToggleMetronome,
    onUndo, onRedo, canUndo, canRedo,
    isEditMode, onToggleEditMode,
    isNudgeModeActive, onToggleNudgeMode,
}) => {
    return (
        <header className="bg-slate-800 text-white p-2 flex items-center justify-between shadow-md flex-shrink-0 z-10">
            {/* Left Section: File & Project Management */}
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-emerald-400 mr-4">SĒQsync</span>
                <Button onClick={onNew}>New</Button>
                <Button onClick={onSave}>Save</Button>
                <Button onClick={onLoad}>Load Seq</Button>
                <Button onClick={onLoadAudio}>Load Media</Button>
                <Button onClick={onAnalyzeVideo} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
            </div>

            {/* Center Section: Transport & Timing */}
            <div className="flex items-center gap-2">
                <input 
                    type="number"
                    value={selectedBar}
                    onChange={(e) => onBarChange(parseInt(e.target.value, 10))}
                    className="w-12 bg-slate-700 text-center rounded"
                    min="1"
                    max={totalBars}
                />
                <span>/ {totalBars}</span>
                <input
                    type="number"
                    value={bpm}
                    onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
                    className="w-16 bg-slate-700 text-center rounded mx-2"
                />
                <Button onClick={onTapTempo}>Tap</Button>
                <Button onClick={onToggleNudgeMode} active={isNudgeModeActive}>Nudge</Button>
                <div className="flex items-center gap-1 bg-slate-700 rounded p-1 ml-2">
                    <Button onClick={() => onModeChange(MODES.SEQ)} active={currentMode === MODES.SEQ}>SEQ</Button>
                    <Button onClick={() => onModeChange(MODES.POS)} active={currentMode === MODES.POS}>POS</Button>
                </div>
            </div>

            {/* Right Section: View & Action Controls */}
            <div className="flex items-center gap-2">
                {/* --- FIX: USE THE NEW CONSOLIDATED DROPDOWN --- */}
                <ViewOptionsToggle
                    isLiveCamActive={isLiveCamActive}
                    onToggleLiveCam={onToggleLiveCam}
                    isFeedMirrored={isFeedMirrored}
                    onToggleFeedMirror={onToggleFeedMirror}
                    isOverlayMirrored={isOverlayMirrored}
                    onToggleOverlayMirror={onToggleOverlayMirror}
                />
                <Button onClick={onToggleRecord} active={isRecording}>Rec</Button>
                <Button onClick={onTogglePlay} active={isPlaying}>{isPlaying ? 'Stop' : 'Play'}</Button>
                <Button onClick={onToggleMetronome} active={isMetronomeEnabled}>Click</Button>
                <Button onClick={onUndo} disabled={!canUndo}>Undo</Button>
                <Button onClick={onRedo} disabled={!canRedo}>Redo</Button>
                <Button onClick={onToggleEditMode} active={isEditMode}>Edit</Button>
            </div>
        </header>
    );
};

export default TopHeader;
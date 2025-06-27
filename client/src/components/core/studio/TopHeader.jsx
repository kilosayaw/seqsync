import React from 'react';

// Import hooks used ONLY by this component's children
import { useUIState } from '../../../contexts/UIStateContext.jsx';
import { useMotionAnalysis } from '../../../hooks/useMotionAnalysis';

// Import Child Components
import LoadSave from '../../common/LoadSave';
import Button from '../../common/Button';
import SoundBank from '../sequencer/SoundBank';
import { MODES } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';

// This component receives its complex handlers as props
const TopHeader = ({ onSave, onLoad, onFileSelected, onActivateCamera, onAnalyze }) => {
    // It can still consume contexts for its own direct needs
    const { viewMode, setViewMode, selectedKitName, setSelectedKitName, currentSoundInBank, setCurrentSoundInBank, soundKitsObject } = useUIState();
    const { isAnalyzing, progress, cancelFullAnalysis } = useMotionAnalysis({ onAnalysisComplete: () => {} }); // onAnalysisComplete is handled by parent

    return (
        <header className="mb-2 p-2 bg-gray-800 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-x-4 gap-y-2 flex-shrink-0 z-30">
            <div className="flex items-center gap-2 flex-wrap">
                <LoadSave 
                    onSave={onSave}
                    onLoad={onLoad}
                    onFileSelected={onFileSelected}
                    onActivateCamera={onActivateCamera}
                />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
                <Button 
                    onClick={onAnalyze} 
                    variant="primary" 
                    size="sm" 
                    disabled={isAnalyzing} // Simplified disabled logic
                    iconLeft={isAnalyzing ? faSpinner : faMicrochip} 
                    iconProps={isAnalyzing ? { spin: true } : {}}
                >
                    {isAnalyzing ? `Analyzing... ${progress.toFixed(0)}%` : "Analyze"}
                </Button>
                {isAnalyzing && <Button onClick={cancelFullAnalysis} variant="danger" size="xs" iconLeft={faTimes} />}
            </div>

            <div className="flex items-center gap-4">
                <SoundBank 
                    soundKits={soundKitsObject} 
                    selectedKitName={selectedKitName} 
                    onKitSelect={setSelectedKitName} 
                    currentSoundInKit={currentSoundInBank} 
                    onSoundInKitSelect={setCurrentSoundInBank} 
                />
                <div className="flex items-center gap-1">
                    <Button onClick={() => setViewMode(MODES.POS)} variant={viewMode === MODES.POS ? "custom" : "secondary"} className={`!px-3 h-8 ${viewMode === MODES.POS && '!bg-pos-yellow !text-black font-semibold'}`}>POS</Button>
                    <Button onClick={() => setViewMode(MODES.SEQ)} variant={viewMode === MODES.SEQ ? "custom" : "secondary"} className={`!px-3 h-8 ${viewMode === MODES.SEQ && '!bg-brand-seq !text-white font-semibold'}`}>SEQ</Button>
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
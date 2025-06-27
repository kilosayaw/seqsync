import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import LoadSave from '../../common/LoadSave';
import Button from '../../common/Button';
import SoundBank from '../sequencer/SoundBank';
import { MODES } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faSpinner, faTimes, faVideo } from '@fortawesome/free-solid-svg-icons';

const TopHeader = ({
  onSave, onLoad, onFileSelected, setMediaStream,
  isAnalyzing, progress, cancelFullAnalysis,
  viewMode, setViewMode,
  selectedKitName, setSelectedKitName,
  currentSoundInBank, setCurrentSoundInBank,
  soundKitsObject
}) => {
  const handleActivateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (stream) setMediaStream(stream);
    } catch (err) {
      toast.error("Could not access camera.");
    }
  };

  return (
    <header className="mb-2 p-2 bg-gray-800/60 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-x-4 gap-y-2 flex-shrink-0 z-30">
      <div className="flex items-center gap-2 flex-wrap">
        <LoadSave onLoad={onLoad} onFileSelected={onFileSelected} onSave={onSave} />
        <Button onClick={handleActivateCamera} variant="secondary" size="sm" title="Activate Live Camera">
            <FontAwesomeIcon icon={faVideo} className="mr-2" />
            Live Cam
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {isAnalyzing ? (
          <div className="flex items-center gap-3 text-sm text-pos-yellow font-semibold">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-pos-yellow transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span>{progress.toFixed(0)}%</span>
            <Button onClick={cancelFullAnalysis} variant="danger" size="xs">
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </div>
        ) : (
            // The "Analyze Media" button is now conceptually tied to thumbnail generation,
            // which we haven't built yet. We can hide it or give it a placeholder function.
            // For now, let's keep it but make it clear it's for post-analysis.
           <Button variant="primary" size="sm" disabled={true} title="Analyze video frames (future feature)">
            <FontAwesomeIcon icon={faMicrochip} className="mr-2" />
            Analyze Frames
           </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <SoundBank
          soundKits={soundKitsObject}
          selectedKitName={selectedKitName}
          onKitSelect={setSelectedKitName}
          currentSoundInKit={currentSoundInBank}
          onSoundInKitSelect={setCurrentSoundInBank}
        />
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-md">
          <Button onClick={() => setViewMode(MODES.POS)} variant={viewMode === MODES.POS ? "custom" : "secondary"} className={`!px-4 h-8 ${viewMode === MODES.POS && '!bg-pos-yellow !text-black font-semibold'}`}>POS</Button>
          <Button onClick={() => setViewMode(MODES.SEQ)} variant={viewMode === MODES.SEQ ? "custom" : "secondary"} className={`!px-4 h-8 ${viewMode === MODES.SEQ && '!bg-brand-seq !text-white font-semibold'}`}>SEQ</Button>
        </div>
      </div>
    </header>
  );
};

// PropTypes updated to reflect the new state flow
TopHeader.propTypes = {
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func.isRequired,
  setMediaStream: PropTypes.func.isRequired,
  isAnalyzing: PropTypes.bool.isRequired,
  progress: PropTypes.number.isRequired,
  cancelFullAnalysis: PropTypes.func.isRequired,
  viewMode: PropTypes.string.isRequired,
  setViewMode: PropTypes.func.isRequired,
  selectedKitName: PropTypes.string.isRequired,
  setSelectedKitName: PropTypes.func.isRequired,
  currentSoundInBank: PropTypes.string,
  setCurrentSoundInBank: PropTypes.func.isRequired,
  soundKitsObject: PropTypes.object.isRequired,
};

export default TopHeader;
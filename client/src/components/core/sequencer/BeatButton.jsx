import React from 'react';
import PropTypes from 'prop-types';
import { Plus, X } from 'react-feather';

import { useUIState, MODES } from '../../../contexts/UIStateContext.jsx';
import { getSoundNameFromPath } from '../../../utils/soundLibrary.js';
// We no longer need to generate the thumbnail here
// import { generatePoseThumbnail } from '../../../utils/thumbnailUtils.js'; 

import BeatWaveform from './BeatWaveform.jsx';
import './BeatButton.css';

const BeatButton = ({ 
    beatData, 
    onClick, 
    onAddSoundClick, 
    onSoundDelete, 
    isActive, 
    isCurrentStep, 
    isSelectedForEdit 
}) => {
    const { currentMode } = useUIState();

    // The component now just checks for the data it receives
    const hasWaveform = beatData?.waveform && beatData.waveform.length > 0;
    const hasPose = beatData?.pose?.jointInfo && Object.keys(beatData.pose.jointInfo).length > 0;
    const hasSounds = beatData?.sounds && beatData.sounds.length > 0;
    
    // The poseThumbnail is now directly from the beatData prop
    const poseThumbnail = beatData?.thumbnail;

    const wrapperClasses = `
        beat-button-wrapper 
        ${currentMode === MODES.SEQ ? 'seq-mode' : 'pos-mode'}
        ${isCurrentStep ? 'current-step' : ''}
        ${isSelectedForEdit ? 'selected-edit' : ''}
        ${isActive || hasSounds || hasPose ? 'active' : ''}
    `;

    return (
        <div className={wrapperClasses} onClick={onClick}>
            <span className="beat-number">{beatData.beatIndex + 1}</span>

            {/* This layer is for a future feature, can be removed if not needed */}
            {/* It was intended for video frame snapshots, not pose thumbnails */}
            
            {hasWaveform && (
                <div className="beat-layer waveform-layer">
                    <BeatWaveform waveformPoints={beatData.waveform} />
                </div>
            )}
            
            {/* The Pose Thumbnail Layer */}
            {poseThumbnail && (
                <div 
                    className="beat-layer pose-layer"
                    style={{ backgroundImage: `url(${poseThumbnail})` }}
                />
            )}

            {/* SEQ Mode UI Layer */}
            <div className="beat-layer seq-ui-layer">
                {hasSounds && (
                    <div className="sound-list">
                        {beatData.sounds.map(soundUrl => (
                            <div className="sound-label" key={soundUrl}>
                                <span>{getSoundNameFromPath(soundUrl)}</span>
                                <button 
                                    className="delete-sound-btn" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onSoundDelete(soundUrl); 
                                    }}
                                    aria-label={`Remove sound ${getSoundNameFromPath(soundUrl)}`}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button 
                    className="add-sound-btn" 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onAddSoundClick(); 
                    }}
                    aria-label="Add sound to this beat"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
};

BeatButton.propTypes = {
  beatData: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onAddSoundClick: PropTypes.func.isRequired,
  onSoundDelete: PropTypes.func.isRequired,
  isActive: PropTypes.bool, // isActive is not always passed, so it's not required
  isCurrentStep: PropTypes.bool.isRequired,
  isSelectedForEdit: PropTypes.bool,
};

export default React.memo(BeatButton);
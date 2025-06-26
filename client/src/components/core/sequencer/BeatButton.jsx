// /client/src/components/core/sequencer/BeatButton.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Plus, X } from 'react-feather';

import { useUIState, MODES } from '../../../contexts/UIStateContext.jsx';
import { getSoundNameFromPath } from '../../../utils/soundLibrary.js';
import { generatePoseThumbnail } from '../../../utils/thumbnailUtils.js';

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

    // Correctly check if the beat has valid waveform data to display
    const hasWaveform = beatData?.waveform && beatData.waveform.length > 0;
    const videoSnapshot = beatData?.thumbnail;
    const hasPose = beatData?.pose?.jointInfo && Object.keys(beatData.pose.jointInfo).length > 0;
    const hasSounds = beatData?.sounds && beatData.sounds.length > 0;

    const poseThumbnail = hasPose ? generatePoseThumbnail(beatData.pose.jointInfo) : null;

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

            {/* --- NEW: Video Snapshot Layer (at the very back) --- */}
            {videoSnapshot && (
                <div 
                    className="beat-layer video-snapshot-layer"
                    style={{ backgroundImage: `url(${videoSnapshot})` }}
                />
            )}
            
            {hasWaveform && (
                <div className="beat-layer waveform-layer">
                    <BeatWaveform waveformPoints={beatData.waveform} />
                </div>
            )}
            
            {/* Layer 2: Pose Thumbnail */}
            {poseThumbnail && (
                <div 
                    className="beat-layer pose-layer"
                    style={{ backgroundImage: `url(${poseThumbnail})` }}
                />
            )}

            {/* Layer 3: SEQ Mode UI (sounds, add button) */}
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
  isActive: PropTypes.bool.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
  isSelectedForEdit: PropTypes.bool,
};

export default React.memo(BeatButton);
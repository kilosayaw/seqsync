import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import { Plus, X } from 'react-feather';

// --- CONTEXT & UTILS ---
import { useUIState, MODES } from '../../../contexts/UIStateContext';
import { getSoundNameFromPath } from '../../../utils/soundLibrary';

// --- COMPONENTS ---
import BeatWaveform from './BeatWaveform';

// The p5 sketch for rendering pose thumbnails.
function thumbnailSketch(p5) {
    let pose = null;
    p5.setup = () => { p5.createCanvas(100, 100); p5.noLoop(); };
    p5.updateWithProps = (props) => { if (props.pose) { pose = props.pose; p5.redraw(); } };
    p5.draw = () => {
        p5.clear();
        p5.background(40, 40, 50, 150);
        p5.translate(p5.width / 2, p5.height / 2);
        p5.scale(0.4);
        p5.stroke(255, 255, 255, 25);
        p5.strokeWeight(1.5);
        p5.line(-50, 0, 50, 0); p5.line(0, -50, 0, 50);
        if (!pose || !pose.jointInfo) return;
        
        const jointInfo = pose.jointInfo;
        const connections = [
            ['N', 'LS'], ['N', 'RS'], ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'],
            ['RS', 'RE'], ['RE', 'RW'], ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'],
            ['LH', 'LK'], ['LK', 'LA'], ['RH', 'RK'], ['RK', 'RA']
        ];
        
        p5.stroke(255);
        p5.strokeWeight(3);
        connections.forEach(([startKey, endKey]) => {
            const startJoint = jointInfo[startKey];
            const endJoint = jointInfo[endKey];
            if (startJoint?.vector && endJoint?.vector) {
                p5.line(startJoint.vector.x * 100, -startJoint.vector.y * 100, endJoint.vector.x * 100, -endJoint.vector.y * 100);
            }
        });
        
        p5.stroke(255, 221, 0);
        p5.strokeWeight(6);
        for (const key in jointInfo) {
            if (jointInfo[key]?.vector) {
                p5.point(jointInfo[key].vector.x * 100, -jointInfo[key].vector.y * 100);
            }
        }
    };
}

// --- FIX: RESTORED THE MISSING STYLED COMPONENT DEFINITIONS ---
const ButtonWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-small, 4px);
  overflow: hidden;
  border: 3px solid ${({ $isActive, $isCurrentStep, $isSelectedForEdit }) => 
    ($isSelectedForEdit ? 'var(--color-accent-yellow, #FFD700)' :
    ($isCurrentStep ? 'var(--color-highlight-strong, #00FFFF)' : 
    ($isActive ? 'var(--color-accent, #00AACC)' : 'var(--color-border, #444)')))};
  box-shadow: ${({ $isCurrentStep, $isSelectedForEdit }) => 
    ($isSelectedForEdit ? '0 0 10px 2px var(--color-accent-yellow, #FFD700)' :
    ($isCurrentStep ? '0 0 8px 2px var(--color-highlight-strong, #00FFFF)' : 'none'))};
  background-color: #0f172a; /* Darker background to match theme */
  transition: all 0.1s ease-in-out;
  cursor: pointer;
  &:hover {
    border-color: var(--color-accent-light, #7FFFD4);
  }
`;

const BeatNumber = styled.span`
  position: absolute;
  top: 4px;
  left: 4px;
  color: var(--color-text-muted, #999);
  font-size: 0.8em;
  font-weight: bold;
  opacity: 0.6;
  pointer-events: none;
`;

const ContentContainer = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SoundListContainer = styled.div`
  position: absolute;
  top: 2px; left: 2px; right: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  max-height: calc(100% - 28px);
  overflow: hidden;
`;

const SoundLabel = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  color: #e2e8f0;
  font-size: 0.6rem;
  padding: 1px 3px 1px 6px;
  border-radius: 3px;
  width: 95%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DeleteSoundButton = styled.button`
  background: none; border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0 2px;
  margin-left: 4px;
  display: flex;
  border-radius: 50%;
  &:hover { 
    color: #f87171;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PoseContainer = styled.div`
  width: 100%;
  height: 100%;
  opacity: 0.9;
`;

const AddSoundButton = styled.button`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(45, 212, 191, 0.2);
  border: 1px solid rgba(45, 212, 191, 0.5);
  color: #5eead4;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: rgba(45, 212, 191, 0.4);
    transform: scale(1.1);
  }
`;

// --- The Main Mode-Aware BeatButton Component ---
const BeatButton = ({ beatData, onClick, onAddSoundClick, onSoundDelete, isActive, isCurrentStep, isSelectedForEdit }) => {
    const { currentMode } = useUIState();

    const hasPose = beatData?.pose?.jointInfo && Object.keys(beatData.pose.jointInfo).length > 0;
    const hasWaveform = beatData?.waveform?.length > 0;
    const hasSounds = beatData?.sounds?.length > 0;

  const renderSeqContent = () => (
    <>
      {hasWaveform && <BeatWaveform waveformPoints={beatData.waveform} color={'rgba(0, 170, 204, 0.5)'} />}
      {hasSounds && (
        <SoundListContainer>
          {beatData.sounds.map(soundUrl => (
            <SoundLabel key={soundUrl}>
              <span>{getSoundNameFromPath(soundUrl)}</span>
              <DeleteSoundButton onClick={(e) => { e.stopPropagation(); onSoundDelete(soundUrl); }}>
                <X size={12} />
              </DeleteSoundButton>
            </SoundLabel>
          ))}
        </SoundListContainer>
      )}
      <AddSoundButton onClick={(e) => { e.stopPropagation(); onAddSoundClick(); }}>
        <Plus size={14} />
      </AddSoundButton>
    </>
  );

  const renderPosContent = () => {
        // In POS mode, the pose thumbnail is the highest priority.
        if (hasPose) {
            return (
                <PoseContainer>
                    {/* The key prop ensures p5 rerenders when the pose data changes */}
                    <ReactP5Wrapper key={JSON.stringify(beatData.pose.jointInfo)} sketch={thumbnailSketch} pose={beatData.pose} />
                </PoseContainer>
            );
        }
        // If there's no pose, it will appear empty, ready for recording.
        return null;
    };

  const renderContent = () => {
        // Always show the waveform as a background layer if it exists
        const backgroundWaveform = hasWaveform ? (
            <BeatWaveform 
                waveformPoints={beatData.waveform} 
                color={currentMode === 'SEQ' ? 'rgba(0, 170, 204, 0.5)' : 'rgba(100, 116, 139, 0.3)'}
            />
        ) : null;
    
        const foregroundContent = currentMode === MODES.SEQ ? renderSeqContent() : renderPosContent();
    
        return (
            <>
                {backgroundWaveform}
                {foregroundContent}
            </>
        );
    };

    return (
        <ButtonWrapper onClick={onClick} $isActive={isActive} $isCurrentStep={isCurrentStep} $isSelectedForEdit={isSelectedForEdit}>
            <BeatNumber>{beatData.beatIndex + 1}</BeatNumber>
            <ContentContainer>
                {renderContent()}
            </ContentContainer>
        </ButtonWrapper>
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
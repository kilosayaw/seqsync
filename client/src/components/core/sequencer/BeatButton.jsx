import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Plus, X } from 'react-feather';

// --- CONTEXT & UTILS ---
import { useUIState, MODES } from '../../../contexts/UIStateContext';
import { getSoundNameFromPath } from '../../../utils/soundLibrary';

// --- COMPONENTS ---
import BeatWaveform from './BeatWaveform';



// --- P5.JS SKETCH FOR THUMBNAILS ---
// This sketch is optimized to be lightweight and reusable.
function thumbnailSketch(p5) {
    let pose = null;

    p5.setup = () => {
        p5.createCanvas(100, 100);
        p5.noLoop(); // We only redraw when props change
    };

    p5.updateWithProps = (props) => {
        if (props.pose) {
            pose = props.pose;
            p5.redraw();
        }
    };

    p5.draw = () => {
        p5.clear();
        p5.background(15, 23, 42, 220); // Dark background for contrast

        if (!pose?.jointInfo) return;

        p5.push();
        p5.translate(50, 50); // Center the drawing
        p5.scale(0.4, -0.4);  // Scale and flip Y-axis for standard coordinates

        const { jointInfo } = pose;

        // --- FULL IMPLEMENTATION of connections ---
        const connections = [
            ['N', 'LS'], ['N', 'RS'], ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'],
            ['RS', 'RE'], ['RE', 'RW'], ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'],
            ['LH', 'LK'], ['LK', 'LA'], ['RH', 'RK'], ['RK', 'RA']
        ];
        
        // Draw skeleton lines
        p5.stroke(200, 200, 220, 150);
        p5.strokeWeight(3);
        connections.forEach(([startKey, endKey]) => {
            const p1 = jointInfo[startKey]?.vector;
            const p2 = jointInfo[endKey]?.vector;
            if (p1 && p2) {
                p5.line(p1.x * 100, p1.y * 100, p2.x * 100, p2.y * 100);
            }
        });
        
        // Draw joints
        p5.stroke('#facc15'); // Yellow for joints
        p5.strokeWeight(8);
        for (const key in jointInfo) {
            if (jointInfo[key]?.vector) {
                p5.point(jointInfo[key].vector.x * 100, jointInfo[key].vector.y * 100);
            }
        }
        p5.pop();
    };
}


// --- STYLED COMPONENTS ---
const ButtonWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-small, 4px);
  overflow: hidden;
  border: 3px solid ${({ $isActive, $isCurrentStep, $isSelectedForEdit }) => 
    ($isSelectedForEdit ? '#facc15' : $isCurrentStep ? '#22d3ee' : $isActive ? '#38bdf8' : '#334155')};
  box-shadow: ${({ $isCurrentStep, $isSelectedForEdit }) => 
    ($isSelectedForEdit ? '0 0 10px 2px #facc15' : $isCurrentStep ? '0 0 8px 2px #22d3ee' : 'none')};
  background-color: #0f172a;
  transition: all 0.1s ease-in-out;
  cursor: pointer;
  &:hover {
    border-color: #5eead4;
  }
`;
const BeatNumber = styled.span`
  position: absolute;
  top: 4px;
  left: 4px;
  color: #64748b;
  font-size: 0.8em;
  font-weight: bold;
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
const PoseContainer = styled.div`
  width: 100%;
  height: 100%;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
`;

// --- The Main Mode-Aware BeatButton Component ---
const BeatButton = ({ beatData, onClick, onAddSoundClick, onSoundDelete, isCurrentStep, isSelectedForEdit }) => {
    const { currentMode } = useUIState();
    const [thumbnailUrl, setThumbnailUrl] = useState(null);

    const hasPose = beatData?.pose?.jointInfo && Object.keys(beatData.pose.jointInfo).length > 0;
    const hasSounds = beatData?.sounds?.length > 0;
    const hasWaveform = beatData?.waveform?.length > 0;
    const isActive = hasPose || hasSounds;

    useEffect(() => {
        if (hasPose && currentMode === MODES.POS) {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Drawing logic
            ctx.fillStyle = '#0f172a'; // Match background
            ctx.fillRect(0, 0, 100, 100);
            ctx.save();
            ctx.translate(50, 50);
            ctx.scale(0.4, -0.4);

            const { jointInfo } = beatData.pose;
            const connections = [
                ['N', 'LS'], ['N', 'RS'], ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'],
                ['RS', 'RE'], ['RE', 'RW'], ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'],
                ['LH', 'LK'], ['LK', 'LA'], ['RH', 'RK'], ['RK', 'RA']
            ];
            
            ctx.strokeStyle = '#94a3b8'; // Lighter gray for lines
            ctx.lineWidth = 2;
            connections.forEach(([startKey, endKey]) => {
                const p1 = jointInfo[startKey]?.vector;
                const p2 = jointInfo[endKey]?.vector;
                if (p1 && p2) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x * 100, p1.y * 100);
                    ctx.lineTo(p2.x * 100, p2.y * 100);
                    ctx.stroke();
                }
            });

            ctx.fillStyle = '#facc15'; // Yellow
            for (const key in jointInfo) {
                if (jointInfo[key]?.vector) {
                    ctx.beginPath();
                    ctx.arc(jointInfo[key].vector.x * 100, jointInfo[key].vector.y * 100, 5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
            ctx.restore();
            
            // Set the generated image as a data URL
            setThumbnailUrl(canvas.toDataURL('image/png'));
        } else {
            setThumbnailUrl(null); // Clear thumbnail if no pose or not in POS mode
        }
    }, [beatData.pose, hasPose, currentMode]);

    const renderSeqContent = () => (
        <>
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
        if (hasPose) {
            return (
                <PoseContainer>
                    <ReactP5Wrapper sketch={thumbnailSketch} pose={beatData.pose} />
                </PoseContainer>
            );
        }
        return null;
    };

    const renderContent = () => {
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
    isCurrentStep: PropTypes.bool.isRequired,
    isSelectedForEdit: PropTypes.bool,
};

export default React.memo(BeatButton);
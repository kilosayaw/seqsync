import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ReactP5Wrapper } from 'react-p5-wrapper';

function thumbnailSketch(p5) {
    let pose = null;
    p5.setup = () => {
        p5.createCanvas(100, 100);
        p5.noLoop();
    };

    p5.updateWithProps = (props) => {
        if (props.pose) {
            pose = props.pose;
            p5.redraw();
        }
    };

    p5.draw = () => {
        p5.clear();
        p5.translate(p5.width / 2, p5.height / 2);
        p5.scale(0.4);

        // --- Layer 1: Draw the Static 3x3 Grid ---
        p5.stroke(255, 255, 255, 35); // Faint white lines
        p5.strokeWeight(1.5);
        const gridSize = 100;
        const third = gridSize / 3;
        p5.line(-third / 2, -gridSize / 2, -third / 2, gridSize / 2);
        p5.line(third / 2, -gridSize / 2, third / 2, gridSize / 2);
        p5.line(-gridSize / 2, -third / 2, gridSize / 2, -third / 2);
        p5.line(-gridSize / 2, third / 2, gridSize / 2, third / 2);
        
        if (!pose || !pose.jointInfo) return;
        
        // --- Layer 2: Draw the Stick Figure on top of the grid ---
        const jointInfo = pose.jointInfo;
        const connections = [
            ['N', 'LS'], ['N', 'RS'], ['LS', 'RS'],
            ['LS', 'LE'], ['LE', 'LW'], ['RS', 'RE'], ['RE', 'RW'],
            ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'],
            ['LH', 'LK'], ['LK', 'LA'], ['RH', 'RK'], ['RK', 'RA']
        ];
        
        // Draw bones
        p5.stroke(255); // Solid white
        p5.strokeWeight(4);
        connections.forEach(([startKey, endKey]) => {
            const startJoint = jointInfo[startKey];
            const endJoint = jointInfo[endKey];
            if (startJoint?.vector && endJoint?.vector) {
                p5.line(
                    startJoint.vector.x * 100, -startJoint.vector.y * 100,
                    endJoint.vector.x * 100, -endJoint.vector.y * 100
                );
            }
        });

        // Draw joints
        p5.stroke(255, 255, 0); // Bright yellow
        p5.strokeWeight(8);
        for (const key in jointInfo) {
            if (jointInfo[key]?.vector) {
                p5.point(jointInfo[key].vector.x * 100, -jointInfo[key].vector.y * 100);
            }
        }
    };
}

const ButtonWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-small, 4px);
  overflow: hidden;
  border: 2px solid ${({ $isActive, $isCurrentStep }) => 
    ($isCurrentStep ? 'var(--color-highlight-strong, #00FFFF)' : 
    ($isActive ? 'var(--color-accent, #00AACC)' : 'var(--color-border, #444)'))};
  box-shadow: ${({ $isCurrentStep }) => $isCurrentStep ? '0 0 8px 2px var(--color-highlight-strong, #00FFFF)' : 'none'};
  background-color: var(--color-background-lighter, #333);
  transition: all 0.1s ease-in-out;
  cursor: pointer;
  &:hover {
    border-color: var(--color-accent-light, #7FFFD4);
  }
`;

const BeatNumber = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-muted, #999);
  font-size: 1.5em;
  font-weight: bold;
  visibility: ${({ $hasPose }) => $hasPose ? 'hidden' : 'visible'};
  pointer-events: none;
`;

const ThumbnailContainer = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    opacity: ${({ $hasPose }) => ($hasPose ? 1 : 0)};
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.2s ease-in-out;
`;

const BeatButton = ({ beatData, onClick, isActive, isCurrentStep }) => {
  const hasPose = beatData?.pose?.jointInfo && Object.keys(beatData.pose.jointInfo).length > 0;

  return (
    <ButtonWrapper onClick={onClick} $isActive={isActive} $isCurrentStep={isCurrentStep}>
        <BeatNumber $hasPose={hasPose}>{beatData.beatIndex + 1}</BeatNumber>
        <ThumbnailContainer $hasPose={hasPose}>
            {hasPose && <ReactP5Wrapper sketch={thumbnailSketch} pose={beatData.pose} />}
        </ThumbnailContainer>
    </ButtonWrapper>
  );
};

BeatButton.propTypes = {
  beatData: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  isCurrentStep: PropTypes.bool.isRequired,
};

export default React.memo(BeatButton);
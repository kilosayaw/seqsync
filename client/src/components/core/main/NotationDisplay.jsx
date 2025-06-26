import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext.jsx';
import { usePlayback } from '../../../contexts/PlaybackContext.jsx';
import { useSequence } from '../../../contexts/SequenceContext.jsx';
import { useMotionAnalysisContext } from '../../../contexts/MotionAnalysisContext.jsx';
import { generateNotationForBeat } from '../../../utils/notationUtils.js';

const DisplaySection = styled.section`
  width: 100%;
  max-width: 640px;
  background-color: #18181b;
  border-radius: 8px;
  border: 1px solid #27272a;
  padding: 0.75rem 1rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
`;

const PanelTitle = styled.h4`
  font-weight: bold;
  color: #a1a1aa;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
`;

const TitleMeta = styled.span`
  font-size: 0.65rem;
  color: #71717a;
  font-weight: normal;
  text-transform: none;
  margin-left: 0.5rem;
`;

const ContentBox = styled.pre`
  color: #e4e4e7;
  font-family: 'Share Tech Mono', monospace;
  background-color: rgba(15, 23, 42, 0.5);
  padding: 0.5rem;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-all;
  height: 80px;
  font-size: 8pt;
  line-height: 1.5;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1e293b;
`;


const NotationDisplay = () => {
    const { selectedBar, selectedBeat, isLiveCamActive } = useUIState();
    const { isPlaying, currentStep, currentBar } = usePlayback();
    const { getBeatData } = useSequence();
    const { livePoseData } = useMotionAnalysisContext();

    const [notationText, setNotationText] = useState({ shorthand: "...", plainEnglish: "...", analysis: "..." });

    useEffect(() => {
        let barToNotate, beatToNotate, dataToNotate;
        
        if (isLiveCamActive) {
            barToNotate = isPlaying ? currentBar : selectedBar;
            beatToNotate = isPlaying ? currentStep : selectedBeat ?? 0; // Default to beat 0 if none selected
            dataToNotate = { pose: livePoseData }; 
        } else {
            barToNotate = selectedBar;
            beatToNotate = selectedBeat;
            if (beatToNotate === null) {
                setNotationText({ shorthand: "Select a beat.", plainEnglish: "", analysis: "" });
                return;
            }
            dataToNotate = getBeatData(barToNotate, beatToNotate);
        }
        
        setNotationText(generateNotationForBeat(barToNotate, beatToNotate, dataToNotate, null));

    }, [isLiveCamActive, livePoseData, isPlaying, currentStep, currentBar, selectedBar, selectedBeat, getBeatData]);

    const displayBar = isLiveCamActive && isPlaying ? currentBar + 1 : selectedBar + 1;
    const displayBeat = isLiveCamActive && isPlaying ? currentStep + 1 : (selectedBeat !== null ? selectedBeat + 1 : 1);

    return (
        <DisplaySection aria-label="Notation Display">
            <GridContainer>
                <Panel>
                    <PanelTitle>
                        Shorthand:
                        <TitleMeta>
                           (B{String(displayBar).padStart(2,'0')}:S{String(displayBeat).padStart(2,'0')})
                        </TitleMeta>
                    </PanelTitle>
                    <ContentBox>{notationText.shorthand}</ContentBox>
                </Panel>
                <Panel>
                    <PanelTitle>Plain English:</PanelTitle>
                    <ContentBox as="p">{notationText.plainEnglish}</ContentBox>
                </Panel>
                <Panel>
                    <PanelTitle>Analysis:</PanelTitle>
                    <ContentBox as="p">{notationText.analysis}</ContentBox>
                </Panel>
            </GridContainer>
        </DisplaySection>
    );
};

export default NotationDisplay;
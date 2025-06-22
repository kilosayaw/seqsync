import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useUIState } from '../../../contexts/UIStateContext';
import { usePlayback } from '../../../contexts/PlaybackContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { useAnalysis } from '../../../contexts/AnalysisContext';
import { generateNotationForBeat } from '../../../utils/notationUtils';
import { UI_PADS_PER_BAR, DEFAULT_TIME_SIGNATURE } from '../../../utils/constants';

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
    const { selectedBar, selectedBeat } = useUIState();
    const { isPlaying, currentStep, bpm, totalBeatsElapsed } = usePlayback();
    const { songData, timeSignature } = useSequence();
    const { analysisData } = useAnalysis();

    const [notationText, setNotationText] = useState({ shorthand: "...", plainEnglish: "...", analysis: "..." });

    // <<< This is the fully implemented useEffect hook >>>
    useEffect(() => {
        const barToNotate = isPlaying ? Math.floor(totalBeatsElapsed / 16) : selectedBar;
        const beatToNotate = isPlaying ? currentStep : selectedBeat;

        if (beatToNotate === null || barToNotate === null) {
            setNotationText({ shorthand: "Select a beat to see its notation.", plainEnglish: "", analysis: "" });
            return;
        }
        
        const dataToNotate = songData[barToNotate]?.[beatToNotate] || {};
        const sig = timeSignature || DEFAULT_TIME_SIGNATURE;
        const timePerStep = (60 / bpm) / (UI_PADS_PER_BAR / sig.beatsPerBar);
        const timeInSeconds = ((barToNotate * UI_PADS_PER_BAR) + beatToNotate) * timePerStep;
        
        const timecode = {
            mm: Math.floor(timeInSeconds / 60),
            ss: Math.floor(timeInSeconds % 60),
            cs: Math.floor((timeInSeconds * 1000) % 1000)
        };
        
        const key = `${barToNotate}:${beatToNotate}`;
        const beatAnalysis = analysisData[key];
        const dataWithAnalysis = { ...dataToNotate, analysis: beatAnalysis };
        
        setNotationText(generateNotationForBeat(barToNotate, beatToNotate, dataWithAnalysis, timecode));

    }, [isPlaying, currentStep, totalBeatsElapsed, selectedBar, selectedBeat, songData, bpm, timeSignature, analysisData]);


    const displayBar = isPlaying ? Math.floor(totalBeatsElapsed / 16) + 1 : selectedBar + 1;
    const displayBeat = isPlaying ? currentStep + 1 : (selectedBeat !== null ? selectedBeat + 1 : 0);

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
// src/components/layout/RightDeck.jsx
import React from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import './Deck.css';

const RightDeck = () => {
    const { selectedBar, setSelectedBar, setActivePad, noteDivision } = useUIState();
    const { barStartTimes, STEPS_PER_BAR, totalBars } = useSequence();
    const { isPlaying, currentBar, currentBeat, seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();

    const handlePadClick = (localPadIndex) => {
        const globalPadIndex = localPadIndex + 8;
        if (!isMediaReady && (!barStartTimes || barStartTimes.length === 0)) {
             console.log(`[RightDeck] Pad ${globalPadIndex + 1} clicked (No Media). Setting active pad.`);
             setActivePad(globalPadIndex);
             return;
        }

        if (noteDivision === 16) {
            console.log(`[RightDeck] 1/16 Mode: Pad ${globalPadIndex + 1} clicked.`);
            setActivePad(globalPadIndex);
            if (!isPlaying) {
                const barStartTime = barStartTimes[selectedBar - 1] || 0;
                const timePerSixteenth = (60 / (bpm || 120)) / 4;
                const padTimeOffset = globalPadIndex * timePerSixteenth;
                const targetTime = barStartTime + padTimeOffset;
                seekToTime(targetTime);
            }
        } else {
            const targetBar = selectedBar + 1;
            if(targetBar > totalBars) return;
            setSelectedBar(targetBar); 
            const targetBarIndex = targetBar - 1;
            const targetBarStartTime = barStartTimes[targetBarIndex] || 0;
            const timePerEighth = (60 / (bpm || 120)) / 2;
            const targetTime = targetBarStartTime + (localPadIndex * timePerEighth);
            console.log(`[RightDeck] 1/8 Cue Mode: Pad ${localPadIndex + 9} clicked. Seeking to Bar ${targetBar}, Time ${targetTime.toFixed(3)}s`);
            seekToTime(targetTime);
            setActivePad(null);
        }
    };

    return (
        <div className="deck-container" data-side="right">
            <div className="deck-top-row">
                <DeckJointList side="right" />
                <div className="turntable-group">
                    <RotaryButtons />
                    <RotaryController deckId="deck2" />
                </div>
                <MovementFader />
            </div>
            <div className="pads-group">
                <OptionButtons />
                {/* DEFINITIVE FIX: The pads are now wrapped in the .pads-container div again */}
                <div className="pads-container">
                    {Array.from({ length: 8 }).map((_, i) => {
                        const globalPadIndex = i + 8;
                        const displayNumber = i + 9;
                        const isPulsing = isPlaying && selectedBar === currentBar && globalPadIndex === currentBeat;
                        return (
                            <PerformancePad
                                key={`right-${i}`}
                                padIndex={globalPadIndex} 
                                beatNum={displayNumber}
                                isPulsing={isPulsing}
                                onMouseDown={() => handlePadClick(i)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default RightDeck;
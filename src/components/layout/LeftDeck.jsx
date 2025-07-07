// src/components/layout/LeftDeck.jsx
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

const LeftDeck = () => {
    const { selectedBar, setSelectedBar, setActivePad, noteDivision } = useUIState();
    const { barStartTimes, STEPS_PER_BAR, totalBars } = useSequence();
    const { isPlaying, currentBar, currentBeat, seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();

    const handlePadClick = (localPadIndex) => {
        if (!isMediaReady && (!barStartTimes || barStartTimes.length === 0)) {
             console.log(`[LeftDeck] Pad ${localPadIndex + 1} clicked (No Media). Setting active pad.`);
             setActivePad(localPadIndex);
             return;
        }

        if (noteDivision === 16) {
            const globalPadIndex = localPadIndex;
            console.log(`[LeftDeck] 1/16 Mode: Pad ${globalPadIndex + 1} clicked.`);
            setActivePad(globalPadIndex);
            if (!isPlaying) {
                const barStartTime = barStartTimes[selectedBar - 1] || 0;
                const timePerSixteenth = (60 / (bpm || 120)) / 4;
                const padTimeOffset = globalPadIndex * timePerSixteenth;
                const targetTime = barStartTime + padTimeOffset;
                seekToTime(targetTime);
            }
        } else {
            const targetBarIndex = selectedBar - 1;
            const targetBarStartTime = barStartTimes[targetBarIndex] || 0;
            const timePerEighth = (60 / (bpm || 120)) / 2;
            const targetTime = targetBarStartTime + (localPadIndex * timePerEighth);
            console.log(`[LeftDeck] 1/8 Cue Mode: Pad ${localPadIndex + 1} clicked. Seeking to Bar ${targetBarIndex + 1}, Time ${targetTime.toFixed(3)}s`);
            seekToTime(targetTime);
            setActivePad(null);
        }
    };

    return (
        <div className="deck-container" data-side="left">
            <div className="deck-top-row">
                <MovementFader />
                <div className="turntable-group">
                    <RotaryButtons />
                    <RotaryController deckId="deck1" />
                </div>
                <DeckJointList side="left" />
            </div>
            <div className="pads-group">
                <OptionButtons />
                {/* DEFINITIVE FIX: The pads are now wrapped in the .pads-container div again */}
                <div className="pads-container">
                    {Array.from({ length: 8 }).map((_, i) => {
                        const globalPadIndex = i;
                        const displayNumber = i + 1;
                        const isPulsing = isPlaying && selectedBar === currentBar && globalPadIndex === currentBeat;
                        return (
                            <PerformancePad
                                key={`left-${i}`}
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
export default LeftDeck;
// src/components/layout/RightDeck.jsx

import React from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
import RotaryController from '../ui/RotaryController/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import Pads from '../ui/Pads';
import OptionButtons from '../ui/OptionButtons';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import './Deck.css';

const RightDeck = () => {
    // --- DIAGNOSTIC: Logic moved here ---
    const { selectedBar, setActivePad } = useUIState();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const { isPlaying, seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();

    const handlePadClick = (padIndexInBar) => {
        if (!isMediaReady) return;

        console.log(`[RightDeck] Pad ${padIndexInBar + 1} click received. Setting active pad.`);
        setActivePad(padIndexInBar);

        if (!isPlaying) {
            const barStartTime = barStartTimes[selectedBar - 1] || 0;
            const timePerSixteenth = (60 / bpm) / 4;
            const padTimeOffset = padIndexInBar * timePerSixteenth;
            const targetTime = barStartTime + padTimeOffset;
            seekToTime(targetTime);
        }
    };
    // --- END DIAGNOSTIC ---

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
                {/* Pass the handler down to the Pads component */}
                <Pads side="right" onPadClick={handlePadClick} />
            </div>
        </div>
    );
};

export default RightDeck;
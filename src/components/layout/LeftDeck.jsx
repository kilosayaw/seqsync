// src/components/layout/LeftDeck.jsx

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

const LeftDeck = () => {
    // --- Logic is now centralized here, same as RightDeck ---
    const { selectedBar, setActivePad } = useUIState();
    const { barStartTimes, STEPS_PER_BAR } = useSequence();
    const { isPlaying, seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();

    const handlePadClick = (padIndexInBar) => {
        if (!isMediaReady) return;

        console.log(`[LeftDeck] Pad ${padIndexInBar + 1} click received. Setting active pad.`);
        setActivePad(padIndexInBar);

        if (!isPlaying) {
            const barStartTime = barStartTimes[selectedBar - 1] || 0;
            const timePerSixteenth = (60 / bpm) / 4;
            const padTimeOffset = padIndexInBar * timePerSixteenth;
            const targetTime = barStartTime + padTimeOffset;
            seekToTime(targetTime);
        }
    };
    // --- END LOGIC ---

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
                {/* Pass the handler down to the Pads component */}
                <Pads side="left" onPadClick={handlePadClick} />
            </div>
        </div>
    );
};

export default LeftDeck;
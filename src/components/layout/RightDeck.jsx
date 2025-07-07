// src/components/layout/RightDeck.jsx
import React, { useEffect } from 'react';
import MovementFader from '../ui/MovementFader';
import DeckJointList from '../ui/DeckJointList';
// ... other imports
import PerformancePad from '../ui/PerformancePad';
import OptionButtons from '../ui/OptionButtons';
import RotaryController from '../ui/RotaryController/RotaryController';
import RotaryButtons from '../ui/RotaryButtons';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { usePlayback } from '../../context/PlaybackContext';
import { useMedia } from '../../context/MediaContext';
import { useSound, PAD_TO_NOTE_MAP } from '../../context/SoundContext'; // Import sound context
import './Deck.css';

const RightDeck = ({ setPadClickHandler }) => {
    const { playSound } = useSound(); // Get the playSound function
    // ... other hooks are the same
    const { selectedBar, setSelectedBar, setActivePad, noteDivision } = useUIState();
    const { barStartTimes, STEPS_PER_BAR, totalBars } = useSequence();
    const { isPlaying, currentBar, currentBeat, seekToTime, bpm } = usePlayback();
    const { isMediaReady } = useMedia();

    const handlePadClick = (localPadIndex) => {
        const globalPadIndex = localPadIndex + 8;
        const note = PAD_TO_NOTE_MAP[globalPadIndex];
        playSound(note); // Play the corresponding sound

        // ... rest of the click logic remains the same ...
        if (!isMediaReady && (!barStartTimes || barStartTimes.length === 0)) {
            console.log(`[RightDeck] Pad ${globalPadIndex + 1} clicked (No Media).`);
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
            if (targetBar > totalBars) return;
            setSelectedBar(targetBar);
            const targetBarIndex = targetBar - 1;
            const targetBarStartTime = barStartTimes[targetBarIndex] || 0;
            const timePerEighth = (60 / (bpm || 120)) / 2;
            const targetTime = targetBarStartTime + (localPadIndex * timePerEighth);
            console.log(`[RightDeck] 1/8 Cue Mode: Pad ${localPadIndex + 9} clicked.`);
            seekToTime(targetTime);
            setActivePad(null);
        }
    };

    // Report this component's handler to the parent ProLayout
    useEffect(() => {
        setPadClickHandler(() => handlePadClick);
    }, [handlePadClick, setPadClickHandler]);

    return (
        <div className="deck-container" data-side="right">
            {/* JSX is identical to previous version */}
            <div className="deck-top-row">
                <DeckJointList side="right" />
                <div className="turntable-group">
                    <RotaryButtons />
                    <RotaryController deckId="deck2" />
                </div>
                <MovementFader />
            </div>
            <div className="pads-group">
                <OptionButtons side="right" />
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
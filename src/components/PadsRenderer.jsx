import React, { useContext } from 'react';
import PerformancePad from './PerformancePad';
import { usePadMapping } from '../hooks/usePadMapping';
import { usePlayback } from '../context/PlaybackContext';
import { useSequence } from '../context/SequenceContext'; // CORRECTED
import { MediaContext } from '../context/MediaContext';
import './PadsRenderer.css';

const PadsRenderer = ({ deckId }) => {
    const { pads, activePadIndex } = usePadMapping();
    const { seekToTime } = usePlayback();
    const { songData } = useSequence(); // CORRECTED
    const { detectedBpm, duration } = useContext(MediaContext);
    
    const handlePadClick = (pad) => {
        if (!detectedBpm || !duration || !pad.isVisible) return;
        
        const stepDuration = 60 / detectedBpm / 4;
        const targetTime = pad.globalStepIndex * stepDuration;
        seekToTime(targetTime);
    };

    const padStart = deckId === 'deck1' ? 0 : 8;
    const padEnd = deckId === 'deck1' ? 8 : 16;
    const visiblePads = pads.slice(padStart, padEnd);

    const activePadInDeck = activePadIndex >= padStart && activePadIndex < padEnd;

    return (
        <div className="pads-renderer">
            <div className="pads-grid">
                {visiblePads.map((pad) => (
                    <PerformancePad
                        key={`${deckId}-${pad.index}`}
                        beatNum={pad.index % 8 + 1}
                        isActive={activePadInDeck && pad.index === activePadIndex}
                        onClick={() => handlePadClick(pad)}
                        isVisible={pad.isVisible}
                    />
                ))}
            </div>
        </div>
    );
};

export default PadsRenderer;
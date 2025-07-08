// src/components/ui/SoundBankPanel.jsx

import React from 'react';
import { useSequence } from '../../context/SequenceContext';
import { useSound, PAD_TO_NOTE_MAP } from '../../context/SoundContext';
import classNames from 'classnames';
import './SoundBankPanel.css';

// Hardcode the kit info for now. This could come from a file/API later.
const KITS = { "TR-808": PAD_TO_NOTE_MAP };
const SOUND_CATEGORIES = {
    "Kicks": ["C1", "C#1"],
    "Snares": ["D1", "D#1"],
    "Toms": ["F#1", "G1", "G#1"],
    "Hats & Cymbals": ["E1", "F1", "B1", "C2", "C#2"],
    "Percussion": ["A1", "A#1", "D2", "D#2"]
};

const SoundBankPanel = () => {
    // All state now comes from useSequence
    const { activePanel, setActivePanel, selectedBeat, showNotification, songData, assignSoundToPad, clearSoundsFromPad } = useSequence();
    const isVisible = activePanel === 'sound';
    
    // Logic remains the same but uses new state management
    const activeBeatData = selectedBeat !== null ? songData.bars[Math.floor(selectedBeat/16)]?.beats[selectedBeat%16] : null;
    const activePadSounds = activeBeatData?.sounds || [];

    // This logic correctly gets the sounds for the active pad, regardless of the current bar.
    const activePadData = activePad !== null ? songData[activePad] : null;

    const handleAssignKit = (kitName) => {
        const kitSounds = KITS[kitName];
        if (!kitSounds) return;

        console.log(`[Sound Bank] Assigning kit: ${kitName}`);
        setSongData(currentData => {
            return currentData.map((beat, index) => {
                const note = kitSounds[index % 16];
                return { ...beat, sounds: [note] };
            });
        });
        showNotification(`${kitName} kit loaded onto all pads.`);
        setActivePanel('none');
    };

    const handleSoundClick = (note) => {
        if (activePad === null) {
            showNotification("Select a pad before assigning a sound.");
            return;
        }

        const currentSounds = new Set(activePadSounds);
        if (currentSounds.has(note)) {
            currentSounds.delete(note);
            console.log(`[Sound Bank] Removed sound ${note} from Pad ${activePad + 1}`);
        } else if (currentSounds.size < 4) {
            currentSounds.add(note);
            console.log(`[Sound Bank] Added sound ${note} to Pad ${activePad + 1}`);
        } else {
            showNotification("Maximum 4 sounds per pad.");
            return;
        }

        // The index to update is simply the activePad index
        const indexToUpdate = activePad;
        setSongData(currentData => {
             const newData = [...currentData];
             newData[indexToUpdate].sounds = Array.from(currentSounds);
             return newData;
        });
    };

    const handleClearSounds = () => {
        if (activePad === null) return;
        clearSoundsFromPad(activePad);
        showNotification(`Sounds cleared from Pad ${activePad + 1}.`);
    };

    return (
        <div className={classNames('sound-bank-panel', { 'visible': isVisible })}>
            <div className="panel-header">
                <h3>SOUND BANK</h3>
                <button className="close-btn" onClick={() => setActivePanel('none')}>×</button>
            </div>
            <div className="panel-content">
                <div className="sound-section kits-section">
                    <h4>Load Full Kit</h4>
                    <p>This will assign a sound to all 16 pads, clearing previous sounds.</p>
                    {Object.keys(KITS).map(kitName => (
                        <button key={kitName} className="sound-item kit-btn" onClick={() => handleAssignKit(kitName)}>
                            Load {kitName}
                        </button>
                    ))}
                </div>
                <div className="sound-section sounds-section">
                    <h4>Assign Individual Sounds (TR-808)</h4>
                    <p>Click a sound to add/remove it from the selected pad (Max 4).</p>
                    {Object.entries(SOUND_CATEGORIES).map(([category, notes]) => (
                        <div key={category} className="category-group">
                            <h5>{category}</h5>
                            <div className="sound-grid">
                                {notes.map(note => (
                                    <button 
                                        key={note} 
                                        className={classNames('sound-item', { 
                                            'assigned': activePadSounds.includes(note) 
                                        })} 
                                        onClick={() => handleSoundClick(note)}
                                    >
                                        {note}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {activePad !== null && (
                        <button className="clear-sounds-btn" onClick={handleClearSounds}>
                            Clear Sounds from Pad {activePad + 1}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SoundBankPanel;
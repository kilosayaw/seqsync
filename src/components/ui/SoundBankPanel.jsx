// src/components/ui/SoundBankPanel.jsx
import React from 'react';
import { useUIState } from '../../context/UIStateContext';
import { useSequence } from '../../context/SequenceContext';
import { PAD_TO_NOTE_MAP } from '../../context/SoundContext';
import classNames from 'classnames';
import './SoundBankPanel.css';

// Hardcode the kit info for now. This could come from a file/API later.
const KITS = {
    "TR-808": PAD_TO_NOTE_MAP
};
const SOUND_CATEGORIES = {
    "Kicks": ["C1", "C#1"],
    "Snares": ["D1", "D#1"],
    "Toms": ["F#1", "G1", "G#1"], // Using placeholders as per your kit list
    "Hats & Cymbals": ["E1", "F1", "B1", "C2", "C#2"],
    "Percussion": ["A1", "A#1", "D2", "D#2"]
};

const SoundBankPanel = () => {
    const { activePanel, setActivePanel, activePad, showNotification } = useUIState();
    const { assignSoundToPad, setSongData, STEPS_PER_BAR, songData } = useSequence();

    const isVisible = activePanel === 'sound';

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
        setActivePanel('none'); // Close panel after loading
    };

    const handleAssignSound = (note) => {
        const currentBar = Math.floor((activePad || 0) / STEPS_PER_BAR) + 1;
        if (activePad === null) {
            showNotification("Select a pad before assigning a sound.");
            return;
        }
        showNotification(`Be sure you are in the intended bar (Currently Bar ${currentBar})`);
        assignSoundToPad(activePad, note);
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
                    <h4>Assign Individual Sound</h4>
                    <p>Click a sound below to assign it to the currently selected pad.</p>
                    {Object.entries(SOUND_CATEGORIES).map(([category, notes]) => (
                        <div key={category} className="category-group">
                            <h5>{category}</h5>
                            <div className="sound-grid">
                                {notes.map(note => (
                                    <button key={note} className="sound-item" onClick={() => handleAssignSound(note)}>
                                        {note}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default SoundBankPanel;
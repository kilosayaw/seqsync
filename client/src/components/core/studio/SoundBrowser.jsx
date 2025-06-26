import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { X } from 'react-feather';

// --- UTILS & LIBRARIES ---
import { tr808SoundsArray, getSoundNameFromPath } from '../../../utils/soundLibrary';
import { playSound, unlockAudioContext } from '../../../utils/audioManager';

// --- STYLED COMPONENTS ---
const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; padding: 1rem;
`;

const ModalContainer = styled.div`
  width: 90%; max-width: 800px;
  background-color: #1e293b; border: 1px solid #334155; border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  max-height: 80vh;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.5rem; border-bottom: 1px solid #334155;
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem; font-weight: bold; color: #e2e8f0;
`;

const CloseButton = styled.button`
  background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  &:hover { background-color: #334155; color: white; }
`;

const SoundList = styled.div`
  padding: 1rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: #475569 #1e293b;
`;

const SoundButton = styled.button`
  padding: 10px;
  background-color: #273142;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  text-align: center;
  transition: all 0.2s;
  &:hover {
    background-color: #334155;
    border-color: var(--color-accent);
  }
`;

// --- THE FUNCTIONAL COMPONENT ---
const SoundBrowser = ({ onSelectSound, onClose }) => {
    const handleSoundClick = (soundUrl) => {
        unlockAudioContext(); // Ensure audio is ready on the first user click
        playSound(soundUrl);    // Preview the sound when clicked
        onSelectSound(soundUrl); // Pass the selected sound URL back to the parent
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>TR-808 Sound Bank</ModalTitle>
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>
                </ModalHeader>
                <SoundList>
                    {/* Map over the imported sound array and create a button for each */}
                    {tr808SoundsArray.map(sound => (
                        <SoundButton key={sound.key} onClick={() => handleSoundClick(sound.url)}>
                            {getSoundNameFromPath(sound.name)}
                        </SoundButton>
                    ))}
                </SoundList>
            </ModalContainer>
        </ModalBackdrop>
    );
};

SoundBrowser.propTypes = {
    onSelectSound: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SoundBrowser;
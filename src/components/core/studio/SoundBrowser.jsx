import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { X, ChevronDown, ChevronUp } from 'react-feather';
import { categorizedTr808Sounds, getSoundNameFromPath } from '../../../utils/soundLibrary';
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
const SoundKitContainer = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #475569 #1e293b;
`;
const KitHeader = styled.div`
  padding: 12px 16px;
  background-color: #273142;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0.25rem;
  &:hover { background-color: #334155; }
`;
const KitTitle = styled.h3`
  font-weight: bold;
  font-size: 1rem;
  color: #cbd5e1;
`;
const SoundGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  padding: 1rem;
  background-color: rgba(0,0,0,0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
`;
const SoundButton = styled.button`
  padding: 8px;
  background-color: #334155;
  border: 1px solid #475569;
  color: #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  &:hover {
    border-color: var(--color-accent);
    color: white;
  }
`;

// --- The Accordion-Style Kit Component ---
const KitCategory = ({ category, onSelectSound }) => {
    const [isOpen, setIsOpen] = useState(category.name === 'Kicks');

    const handleSoundClick = (soundUrl) => {
        unlockAudioContext();
        playSound(soundUrl);
        onSelectSound(soundUrl);
    };

    return (
        <div>
            <KitHeader onClick={() => setIsOpen(!isOpen)}>
                <KitTitle>{category.name}</KitTitle>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </KitHeader>
            {isOpen && (
                <SoundGrid>
                    {category.sounds.map(sound => (
                        <SoundButton key={sound.key} onClick={() => handleSoundClick(sound.url)}>
                            {getSoundNameFromPath(sound.name)}
                        </SoundButton>
                    ))}
                </SoundGrid>
            )}
        </div>
    );
};

KitCategory.propTypes = {
    category: PropTypes.object.isRequired,
    onSelectSound: PropTypes.func.isRequired,
};

// --- The Main Sound Browser ---
const SoundBrowser = ({ onSelectSound, onClose }) => {
    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>TR-808 Sound Bank</ModalTitle>
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>
                </ModalHeader>
                <SoundKitContainer>
                    {/* FIX: This now correctly maps over the categorized array */}
                    {categorizedTr808Sounds.map(category => (
                        <KitCategory 
                            key={category.name}
                            category={category}
                            onSelectSound={onSelectSound}
                        />
                    ))}
                </SoundKitContainer>
            </ModalContainer>
        </ModalBackdrop>
    );
};

SoundBrowser.propTypes = {
    onSelectSound: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SoundBrowser;
// src/components/studio/sequencer/SoundBank.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useUIState } from '../../../contexts/UIStateContext';
import { useSequence } from '../../../contexts/SequenceContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxArchive, faMusic, faChevronDown, faChevronUp, faUpload, faInfoCircle, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import { AVAILABLE_KITS } from '../../../utils/constants'; // Assuming this is now our single source of truth

const SoundBank = ({ isAdmin, onUploadKitClick, isCompact = false }) => {
    // --- CONTEXT INTEGRATION ---
    const { currentSoundInBank, setCurrentSoundInBank } = useUIState();
    const { selectedKitName, setSelectedKitName } = useSequence();

    // --- INTERNAL UI STATE ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showKitList, setShowKitList] = useState(true); // Default to showing kit list when opened
    const [filter, setFilter] = useState('');
    const dropdownRef = useRef(null);

    // --- DERIVED DATA & MEMOS ---
    const currentKit = useMemo(() => {
        return AVAILABLE_KITS.find(k => k.name === selectedKitName) || AVAILABLE_KITS[0];
    }, [selectedKitName]);

    const filteredSounds = useMemo(() => {
        if (!currentKit) return [];
        if (!filter) return currentKit.sounds;
        return currentKit.sounds.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
    }, [currentKit, filter]);

    const mainButtonText = useMemo(() => {
        if (currentKit && currentSoundInBank) {
          const text = `${currentKit.name}: ${currentSoundInBank}`;
          return isCompact && text.length > 15 ? text.substring(0, 13) + "…" : text;
        }
        if (currentKit) {
          return isCompact && currentKit.name.length > 12 ? currentKit.name.substring(0, 10) + "…" : currentKit.name;
        }
        return "Sound Bank";
    }, [selectedKitName, currentSoundInBank, currentKit, isCompact]);

    // --- HANDLERS ---
    const handleKitSelectInternal = useCallback((kitName) => {
        setSelectedKitName(kitName);
        setShowKitList(false); // After selecting a kit, show its sounds
    }, [setSelectedKitName]);

    const handleSoundSelectInternal = useCallback((soundKey) => {
        setCurrentSoundInBank(soundKey);
        setIsDropdownOpen(false); // Close dropdown after sound selection
    }, [setCurrentSoundInBank]);
    
    const toggleDropdown = useCallback(() => {
        const nextIsOpen = !isDropdownOpen;
        if (nextIsOpen) {
            // When opening, always default to showing the kit list if there's more than one kit
            setShowKitList(AVAILABLE_KITS.length > 1);
        }
        setIsDropdownOpen(nextIsOpen);
    }, [isDropdownOpen]);
    
    // --- EFFECTS ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);
    
    // --- RENDER LOGIC ---
    const renderKitSelection = () => (
        <div className="py-1">
            {AVAILABLE_KITS.map((kit) => (
                <button
                    key={kit.name}
                    onClick={() => handleKitSelectInternal(kit.name)}
                    className="flex items-center justify-between w-full text-left px-3 py-1.5 text-xs rounded-md text-gray-200 hover:bg-gray-600/70"
                >
                    <span>{kit.name}</span>
                    <FontAwesomeIcon icon={faCaretRight} className="text-xs opacity-70" />
                </button>
            ))}
            {isAdmin && (
                <div className="border-t border-gray-700/50 p-2 mt-1">
                    <Button onClick={() => { if(onUploadKitClick) onUploadKitClick(); setIsDropdownOpen(false); }} variant="secondary" size="sm" className="w-full text-xs !py-1.5" iconLeft={faUpload}>Upload New Kit</Button>
                </div>
            )}
        </div>
    );

    const renderSoundSelection = () => (
        <div className="p-1">
            <input type="text" placeholder="Filter sounds..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full p-1.5 bg-gray-900 rounded text-xs mb-2 border border-gray-600"/>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700/50">
                {filteredSounds.map((sound) => (
                    <button
                        key={sound.key}
                        onClick={() => handleSoundSelectInternal(sound.key)}
                        className={`block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors duration-150 ease-in-out truncate ${currentSoundInBank === sound.key ? 'bg-brand-seq text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
                        title={sound.name}
                    >
                        {sound.name}
                    </button>
                ))}
            </div>
            {AVAILABLE_KITS.length > 1 && (
                <Button variant="tertiary" size="xs" onClick={() => setShowKitList(true)} className="w-full mt-2">
                    ← Back to Kits
                </Button>
            )}
        </div>
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <Button onClick={toggleDropdown} variant="secondary" size="custom" className={`flex items-center justify-between !h-9 !px-3 ${isDropdownOpen ? 'ring-2 ring-brand-accent' : 'border border-gray-600'}`}>
                <FontAwesomeIcon icon={faMusic} className="mr-2" />
                <span className="truncate max-w-[150px]">{mainButtonText}</span>
                <FontAwesomeIcon icon={isDropdownOpen ? faChevronUp : faChevronDown} className="ml-auto pl-2" />
            </Button>

            {isDropdownOpen && (
                <div className="absolute z-50 right-0 mt-1 w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-95">
                    {showKitList ? renderKitSelection() : renderSoundSelection()}
                </div>
            )}
        </div>
    );
};

SoundBank.propTypes = {
    isAdmin: PropTypes.bool,
    onUploadKitClick: PropTypes.func,
    isCompact: PropTypes.bool,
};

export default React.memo(SoundBank);
// src/components/core/sequencer/SoundBank.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxArchive, faMusic, faChevronDown, faChevronUp, faCaretRight } from '@fortawesome/free-solid-svg-icons'; // Added faBoxArchive, faCaretRight
import { getSoundNameFromPath } from '../../../utils/sounds'; // Assuming tr808SoundKeys and tr808SoundFiles are not needed directly here anymore
import Tooltip from '../../common/Tooltip';
import Button from '../../common/Button';

const SoundBank = ({
  // Kit related props
  availableKits,       // Array of kit names: ['TR-808', 'DRUMBRUTE']
  selectedKit,         // String: name of the currently selected kit
  onKitSelect,         // Function: (kitName) => void

  // Sound related props (relative to the selected kit)
  currentSoundInKit,   // String: key of the current sound within the selectedKit
  onSoundInKitSelect,  // Function: (soundKey) => void
  soundsForSelectedKit,// Array: sound keys for the selectedKit
  fileMapForSelectedKit,// Object: file map for the selectedKit

  isCompact = false,
  logToConsole,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleKitSelectInternal = useCallback((kitName) => {
    logToConsole?.(`[SoundBank] Kit selected: ${kitName}`);
    if (onKitSelect) {
      onKitSelect(kitName);
    }
    // Keep dropdown open to select a sound, or close if that's preferred UX
    // For now, let's assume selecting a kit populates sounds and keeps dropdown open.
    // If a sound should be auto-selected, parent component would handle that.
  }, [onKitSelect, logToConsole]);

  const handleSoundSelectInternal = useCallback((soundKey) => {
    logToConsole?.(`[SoundBank] Sound selected in kit '${selectedKit}': ${soundKey}`);
    if (onSoundInKitSelect) {
      onSoundInKitSelect(soundKey);
    }
    setIsDropdownOpen(false); // Close dropdown after sound selection
  }, [onSoundInKitSelect, selectedKit, logToConsole]);

  const toggleDropdown = useCallback(() => {
    logToConsole?.(`[SoundBank] Toggling dropdown. Was open: ${isDropdownOpen}`);
    setIsDropdownOpen(prev => !prev);
  }, [isDropdownOpen, logToConsole]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const mainButtonText = useMemo(() => {
    if (selectedKit && currentSoundInKit) {
      const soundName = getSoundNameFromPath(fileMapForSelectedKit?.[currentSoundInKit] || currentSoundInKit);
      return isCompact ? soundName.substring(0, 4) : `${selectedKit}: ${soundName}`;
    }
    if (selectedKit) {
      return isCompact ? selectedKit.substring(0,6) : `${selectedKit}: Select Sound`;
    }
    return "Sound Kits";
  }, [selectedKit, currentSoundInKit, fileMapForSelectedKit, isCompact]);

  const mainButtonIcon = useMemo(() => {
    return selectedKit ? faMusic : faBoxArchive;
  }, [selectedKit]);

  const renderKitSelection = () => (
    <div className="py-1">
      {availableKits.map((kitName) => (
        <button
          key={kitName}
          onClick={() => handleKitSelectInternal(kitName)}
          className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors
                      ${selectedKit === kitName ? 'bg-brand-primary-dark text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
          title={`Select kit: ${kitName}`}
        >
          <span>{kitName}</span>
          {selectedKit === kitName && <FontAwesomeIcon icon={faCaretRight} className="text-xs" />}
        </button>
      ))}
    </div>
  );

  const renderSoundSelection = () => {
    if (!soundsForSelectedKit || soundsForSelectedKit.length === 0) {
      return <p className="text-xs text-gray-400 p-3 text-center">No sounds in {selectedKit || 'this kit'}.</p>;
    }
    return (
      <div className={`py-1 ${isCompact ? 'max-h-36' : 'max-h-60'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700`}>
        {soundsForSelectedKit.map((soundKey) => {
          const displayName = getSoundNameFromPath(fileMapForSelectedKit?.[soundKey] || soundKey);
          const isSelected = currentSoundInKit === soundKey;
          return (
            <button
              key={soundKey}
              onClick={() => handleSoundSelectInternal(soundKey)}
              className={`block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors
                          ${isSelected ? 'bg-brand-seq text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
              title={`Select ${displayName}`}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        variant="secondary" // Or a custom variant for dropdown triggers
        size={isCompact ? "sm" : "sm"}
        className={`flex items-center justify-between w-full ${isCompact ? 'px-2 !h-8' : 'px-3 !h-9 sm:!h-10'}`}
        title={isDropdownOpen ? "Close selection" : `Current: ${mainButtonText}. Click to change.`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox" // Accessibility
      >
        <FontAwesomeIcon icon={mainButtonIcon} className={`mr-1.5 ${isCompact ? 'text-xs' : 'text-sm'}`} />
        <span className={`truncate ${isCompact ? 'max-w-[50px] sm:max-w-[70px]' : 'max-w-[90px] sm:max-w-[110px]'}`}>
          {mainButtonText}
        </span>
        <FontAwesomeIcon icon={isDropdownOpen ? faChevronUp : faChevronDown} className={`ml-1.5 ${isCompact ? 'text-xs' : 'text-sm'}`} />
      </Button>

      {isDropdownOpen && (
        <div className={`absolute z-50 right-0 mt-1 w-44 sm:w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl`}>
          {!selectedKit || availableKits.length === 0 ? renderKitSelection() : renderSoundSelection()}
          {/* Optionally, add a "Back to Kits" button if a kit is selected */}
          {selectedKit && availableKits.length > 1 && (
            <div className="border-t border-gray-700/50 p-1">
              <Button
                onClick={() => { onKitSelect(null); logToConsole?.("[SoundBank] Returned to kit selection.");}} // Clear selected kit to show kit list
                variant="link"
                size="sm"
                className="text-xs text-gray-400 hover:text-brand-accent w-full"
              >
                « Change Kit
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SoundBank.propTypes = {
  availableKits: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedKit: PropTypes.string, // Can be null if no kit is selected yet
  onKitSelect: PropTypes.func.isRequired,

  currentSoundInKit: PropTypes.string, // Key of the sound within the selected kit
  onSoundInKitSelect: PropTypes.func.isRequired,
  soundsForSelectedKit: PropTypes.arrayOf(PropTypes.string), // Sounds for the currently selected kit
  fileMapForSelectedKit: PropTypes.object,                  // File map for the currently selected kit

  isCompact: PropTypes.bool,
  logToConsole: PropTypes.func,
};

export default React.memo(SoundBank);
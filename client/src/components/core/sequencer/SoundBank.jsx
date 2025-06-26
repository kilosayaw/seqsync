// src/components/core/sequencer/SoundBank.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBoxArchive, faMusic, faChevronDown, faChevronUp, 
    faCaretRight, faUpload, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import { getSoundNameFromPath } from '../../../utils/sounds'; // Utility to get clean name
import Tooltip from '../../common/Tooltip'; // Assuming you have a Tooltip component
import Button from '../../common/Button';   // Assuming you have a common Button component
// Toast import would be in the parent component (StepSequencerControls) that calls onUploadKitClick
// import { toast } from 'react-toastify'; 

const SoundBank = ({
  soundKits, // Object: { KIT_NAME: { displayName, sounds: [{name, key, url}], fileMap: {name:url} } }
  selectedKitName,
  onKitSelect,
  currentSoundInKit, // This is the sound NAME/KEY (e.g., 'BD0000')
  onSoundInKitSelect, // Callback: (soundNameOrKey) => void
  // soundsForSelectedKit prop is removed, derived internally
  // fileMapForSelectedKit prop is removed, derived internally
  isCompact = false,
  logToConsole,
  isAdmin = false,
  onUploadKitClick, // Callback: () => void
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // showKitList determines if the dropdown shows the list of kits or the list of sounds in the selected kit
  const [showKitList, setShowKitList] = useState(!selectedKitName || Object.keys(soundKits || {}).length <= 1 ? false : true);
  const dropdownRef = useRef(null);

  const currentSelectedKitData = useMemo(() => {
    return soundKits?.[selectedKitName] || null;
  }, [soundKits, selectedKitName]);

  const soundsForDisplayInSelectedKit = useMemo(() => {
    return currentSelectedKitData?.sounds || []; // Array of sound objects {name, key, url}
  }, [currentSelectedKitData]);

  const fileMapForInternalUse = useMemo(() => {
    return currentSelectedKitData?.fileMap || {};
  }, [currentSelectedKitData]);


  useEffect(() => {
    // If a kit is selected, and we were showing the kit list (perhaps after clicking "Change Kit"),
    // automatically switch to showing its sounds, but only if the dropdown is open.
    if (selectedKitName && currentSelectedKitData && showKitList && isDropdownOpen) {
      logToConsole?.(`[SoundBank] Kit '${selectedKitName}' selected, auto-switching to show its sounds.`);
      setShowKitList(false);
    }
    // If no kit is selected (e.g., initial state or after an error), ensure kit list is shown when dropdown opens.
    if (!selectedKitName && !showKitList && isDropdownOpen) {
      logToConsole?.(`[SoundBank] No kit selected, ensuring kit list is shown on dropdown open.`);
      setShowKitList(true);
    }
  }, [selectedKitName, currentSelectedKitData, showKitList, isDropdownOpen, logToConsole]);


  const handleKitSelectInternal = useCallback((kitName) => {
    logToConsole?.(`[SoundBank] Kit selected via UI: ${kitName}`);
    if (onKitSelect) {
      onKitSelect(kitName); // Parent updates selectedKitName, which then triggers internal state update for sounds
    }
    // setShowKitList(false); // Now handled by useEffect to show sounds of the newly selected kit
    // setIsDropdownOpen(false); // User might want to see the sounds immediately, so keep open
  }, [onKitSelect, logToConsole]);

  const handleSoundSelectInternal = useCallback((soundNameOrKey) => {
    logToConsole?.(`[SoundBank] Sound selected in kit '${selectedKitName}': ${soundNameOrKey}`);
    if (onSoundInKitSelect) {
      onSoundInKitSelect(soundNameOrKey); // This is the 'name' property from the sound object
    }
    setIsDropdownOpen(false); // Close dropdown after sound selection
  }, [onSoundInKitSelect, selectedKitName, logToConsole]);

  const toggleDropdown = useCallback(() => {
    const nextIsOpen = !isDropdownOpen;
    logToConsole?.(`[SoundBank] Toggling dropdown. Current open: ${isDropdownOpen}, Next open: ${nextIsOpen}`);
    if (nextIsOpen) { // If opening
      if (!selectedKitName || Object.keys(soundKits || {}).length > 1) {
        // If no kit is selected OR there are multiple kits, default to showing kit list
        // unless a kit is already selected and there's only one kit (then show sounds)
        if (selectedKitName && Object.keys(soundKits || {}).length === 1) {
            setShowKitList(false); // Only one kit, show its sounds
        } else {
            setShowKitList(true); // No kit or multiple kits, show kit list
        }
      } else { // A kit is selected, and it's the only one, or user wants to see its sounds
        setShowKitList(false);
      }
    }
    setIsDropdownOpen(nextIsOpen);
  }, [isDropdownOpen, selectedKitName, soundKits, logToConsole]);

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
    if (currentSelectedKitData && currentSoundInKit) {
      // currentSoundInKit is the sound's 'name' (e.g., 'BD0000')
      const soundObj = soundsForDisplayInSelectedKit.find(s => s.name === currentSoundInKit);
      const soundDisplayName = soundObj ? (getSoundNameFromPath(soundObj.url) || soundObj.name) : currentSoundInKit;
      const kitDisplayName = currentSelectedKitData.displayName || selectedKitName;
      return isCompact ? soundDisplayName.substring(0, 8) : `${kitDisplayName}: ${soundDisplayName}`;
    }
    if (currentSelectedKitData) {
      const kitDisplayName = currentSelectedKitData.displayName || selectedKitName;
      return isCompact ? kitDisplayName.substring(0, 8) : kitDisplayName;
    }
    return "Sound Bank";
  }, [selectedKitName, currentSoundInKit, currentSelectedKitData, soundsForDisplayInSelectedKit, isCompact]);

  const mainButtonIcon = useMemo(() => {
    return (selectedKitName && currentSoundInKit) ? faMusic : faBoxArchive;
  }, [selectedKitName, currentSoundInKit]);
  
  const buttonTextMaxWidthClass = isCompact ? 'max-w-[80px] sm:max-w-[100px]' : 'max-w-[180px] sm:max-w-[220px]';

  const renderKitSelection = () => {
    const availableKitNames = Object.keys(soundKits || {});
    if (availableKitNames.length === 0) {
      return <p className="text-xs text-gray-400 p-3 text-center">No sound kits available.</p>;
    }
    return (
      <div className="py-1">
        {availableKitNames.map((kitNameKey) => {
          const kitData = soundKits[kitNameKey];
          if (!kitData) return null;
          return (
            <button
              key={kitNameKey}
              onClick={() => handleKitSelectInternal(kitNameKey)}
              className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors
                          ${selectedKitName === kitNameKey ? 'bg-brand-primary-dark text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
              title={`Select kit: ${kitData.displayName || kitNameKey}`}
            >
              <span>{kitData.displayName || kitNameKey}</span>
              {selectedKitName === kitNameKey && <FontAwesomeIcon icon={faCaretRight} className="text-xs opacity-70" />}
            </button>
          );
        })}
         {isAdmin && (
            <div className="border-t border-gray-700/50 p-2 mt-1">
                 <Button
                    onClick={() => {
                        logToConsole?.("[SoundBank] Admin: Upload Kit button clicked.");
                        if(onUploadKitClick) onUploadKitClick();
                        // Actual upload modal/logic would be triggered by the parent
                    }}
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs !py-1.5" // Adjusted padding
                    iconLeft={faUpload}
                >
                    Upload New Kit
                </Button>
                <Tooltip content="Kit should be a ZIP file containing WAV audio files and a manifest.json detailing sound names, keys, and optional metadata.">
                    <p className="text-xxs text-gray-500 mt-1.5 italic text-center flex items-center justify-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                        ZIP w/ WAVs & manifest.
                    </p>
                </Tooltip>
            </div>
        )}
      </div>
    );
  };

  const renderSoundSelection = () => {
    if (!currentSelectedKitData) {
        return <p className="text-xs text-gray-400 p-3 text-center">Error: No kit data found for {selectedKitName}.</p>;
    }
    if (soundsForDisplayInSelectedKit.length === 0) {
      return <p className="text-xs text-gray-400 p-3 text-center">No sounds in {currentSelectedKitData.displayName || selectedKitName}.</p>;
    }
    return (
      <div className={`py-1 ${isCompact ? 'max-h-40' : 'max-h-60'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700/50`}>
        {soundsForDisplayInSelectedKit.map((soundObj) => {
          // soundObj is { name, key (optional), url }
          // The 'name' (e.g., BD0000) is used as the identifier/key for selection
          const displayName = getSoundNameFromPath(soundObj.url) || soundObj.name;
          const isSelected = currentSoundInKit === soundObj.name;
          return (
            <button
              key={soundObj.name} // Use soundObj.name as key as it should be unique within a kit
              onClick={() => handleSoundSelectInternal(soundObj.name)}
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
        variant="secondary"
        size={isCompact ? "custom" : "custom"} // Use custom to control padding via className
        className={`flex items-center justify-between 
                    ${isCompact 
                        ? 'px-2 !h-8 min-w-[100px] text-xs' 
                        : 'px-3 !h-9 sm:!h-10 min-w-[150px] text-sm sm:text-base'}`}
        title={isDropdownOpen ? "Close selection" : `Current: ${mainButtonText}. Click to change.`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
      >
        <FontAwesomeIcon icon={mainButtonIcon} className={`mr-1.5 ${isCompact ? 'text-xs' : 'text-sm'}`} />
        <span className={`truncate ${buttonTextMaxWidthClass}`}>
          {mainButtonText}
        </span>
        <FontAwesomeIcon icon={isDropdownOpen ? faChevronUp : faChevronDown} className={`ml-auto pl-1.5 ${isCompact ? 'text-xs' : 'text-sm'}`} />
      </Button>

      {isDropdownOpen && (
        <div className={`absolute z-50 right-0 mt-1 w-48 sm:w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-90`}>
          {showKitList ? renderKitSelection() : renderSoundSelection()}
          {currentSelectedKitData && Object.keys(soundKits || {}).length > 1 && !showKitList && (
            <div className="border-t border-gray-700/50 p-1">
              <Button
                onClick={() => { 
                    logToConsole?.("[SoundBank] User clicked 'Change Kit'. Showing kit list.");
                    setShowKitList(true); // Switch view within dropdown to show kits
                }}
                variant="link" // Assuming link variant styles it appropriately
                size="sm"
                className="text-xs text-gray-400 hover:text-brand-accent w-full !justify-start !px-3 !py-1"
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
  soundKits: PropTypes.objectOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    sounds: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired, // e.g., 'BD0000', used as key
        key: PropTypes.string, // Optional keyboard trigger key for this sound
        url: PropTypes.string.isRequired,
    })).isRequired,
    fileMap: PropTypes.objectOf(PropTypes.string).isRequired, // { 'BD0000': '/path/to/sound.wav' }
  })).isRequired,
  selectedKitName: PropTypes.string, // Name/key of the currently selected kit
  onKitSelect: PropTypes.func.isRequired, // (kitName: string) => void
  currentSoundInKit: PropTypes.string, // Name/key of the currently selected sound within the kit (e.g., 'BD0000')
  onSoundInKitSelect: PropTypes.func.isRequired, // (soundNameOrKey: string) => void
  isCompact: PropTypes.bool,
  logToConsole: PropTypes.func,
  isAdmin: PropTypes.bool,
  onUploadKitClick: PropTypes.func,
};

export default React.memo(SoundBank);
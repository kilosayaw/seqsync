// src/components/core/sequencer/SoundBank.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBoxArchive, faMusic, faChevronDown, faChevronUp, 
    faCaretRight, faUpload, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import { getSoundNameFromPath } from '../../../utils/sounds';
import Tooltip from '../../common/Tooltip';
import Button from '../../common/Button';
// import { toast } from 'react-toastify'; // Toasts are typically handled by the parent via onUploadKitClick

const SoundBank = ({
  soundKits,
  selectedKitName,
  onKitSelect, // CORRECTED: Only one instance
  currentSoundInKit,
  onSoundInKitSelect,
  isCompact = false,
  logToConsole,
  isAdmin = false,
  onUploadKitClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showKitList, setShowKitList] = useState(() => {
    const kitCount = Object.keys(soundKits || {}).length;
    return !selectedKitName || kitCount > 1;
  });
  const dropdownRef = useRef(null);

  const currentSelectedKitData = useMemo(() => {
    if (!selectedKitName || !soundKits || !soundKits[selectedKitName]) {
      logToConsole?.('warn', `[SoundBank] Memo: No data for selectedKitName: '${selectedKitName}'. SoundKits available:`, Object.keys(soundKits || {}));
      return null;
    }
    logToConsole?.('debug', `[SoundBank] Memo: currentSelectedKitData updated for '${selectedKitName}'.`);
    return soundKits[selectedKitName];
  }, [soundKits, selectedKitName, logToConsole]);

  const soundsForDisplayInSelectedKit = useMemo(() => {
    const sounds = currentSelectedKitData?.sounds || [];
    logToConsole?.('debug', `[SoundBank] Memo: soundsForDisplayInSelectedKit updated for '${selectedKitName}'. Count: ${sounds.length}. First few:`, sounds.slice(0,5).map(s=>s.name));
    return sounds; // This should be the full array of sound objects for the kit
  }, [currentSelectedKitData, selectedKitName, logToConsole]);

  useEffect(() => {
    logToConsole?.('effect', `[SoundBank] Dropdown/Kit Sync Effect. IsOpen: ${isDropdownOpen}, Kit: ${selectedKitName}, ShowKitList: ${showKitList}, HasKitData: !!${currentSelectedKitData}`);
    if (isDropdownOpen) {
      if (selectedKitName && currentSelectedKitData) {
        // If a kit is selected and dropdown is open:
        // If showKitList is true (e.g., user clicked "Change Kit"), keep showing kit list.
        // If showKitList is false, it means we should be showing sounds for the selected kit.
        if (showKitList) {
             logToConsole?.('debug', `[SoundBank] Effect: Dropdown open, showing kit list as requested.`);
        } else {
             logToConsole?.('debug', `[SoundBank] Effect: Dropdown open, showing sounds for kit '${selectedKitName}'.`);
        }
      } else { // No kit selected, or invalid kit data
        if (!showKitList) { // If it was trying to show sounds for a non-existent/unselected kit
          logToConsole?.('warn', `[SoundBank] Effect: No valid kit ('${selectedKitName}'), forcing kit list view.`);
          setShowKitList(true);
        } else {
            logToConsole?.('debug', `[SoundBank] Effect: Dropdown open, no kit selected, showing kit list.`);
        }
      }
    }
  }, [isDropdownOpen, selectedKitName, currentSelectedKitData, showKitList, logToConsole]);


  const handleKitSelectInternal = useCallback((kitNameKey) => {
    logToConsole?.('info', `[SoundBank] UI: Kit selected via dropdown: '${kitNameKey}'`);
    if (onKitSelect) {
      onKitSelect(kitNameKey); // Parent updates selectedKitName & potentially resets currentSoundInKit
    }
    setShowKitList(false); // After selecting a kit, automatically switch to show its sounds
  }, [onKitSelect, logToConsole]);

  const handleSoundSelectInternal = useCallback((soundName) => {
    logToConsole?.('info', `[SoundBank] UI: Sound selected: '${soundName}' from kit '${selectedKitName}'`);
    if (onSoundInKitSelect) {
      onSoundInKitSelect(soundName); // Parent updates currentSoundInKit
    }
    setIsDropdownOpen(false); // Close dropdown after sound selection
  }, [onSoundInKitSelect, selectedKitName, logToConsole]);

  const toggleDropdown = useCallback(() => {
    const nextIsOpenState = !isDropdownOpen;
    logToConsole?.('info', `[SoundBank] UI: Toggling dropdown. Was open: ${isDropdownOpen}, Next open: ${nextIsOpenState}`);
    if (nextIsOpenState) { // If dropdown is about to open
      const kitCount = Object.keys(soundKits || {}).length;
      if (!selectedKitName || kitCount > 1) { // If no kit or multiple kits, default to showing kit list
        setShowKitList(true);
      } else { // A kit is selected (and it's likely the only one)
        setShowKitList(false); // Show sounds for the single selected kit
      }
    }
    setIsDropdownOpen(nextIsOpenState);
  }, [isDropdownOpen, selectedKitName, soundKits, logToConsole]);

  useEffect(() => { // Effect for closing dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isDropdownOpen) {
            logToConsole?.('debug', '[SoundBank] Clicked outside, closing dropdown.');
            setIsDropdownOpen(false);
        }
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, logToConsole]);

  const mainButtonText = useMemo(() => {
    if (currentSelectedKitData && currentSoundInKit) {
      const soundObj = soundsForDisplayInSelectedKit.find(s => s.name === currentSoundInKit);
      const soundDisplayName = soundObj ? (getSoundNameFromPath(soundObj.url) || soundObj.name) : currentSoundInKit;
      const kitDisplayName = currentSelectedKitData.displayName || selectedKitName;
      const text = `${kitDisplayName}: ${soundDisplayName}`;
      return isCompact && text.length > 12 ? text.substring(0,10)+"…" : text;
    }
    if (currentSelectedKitData) {
      const kitDisplayName = currentSelectedKitData.displayName || selectedKitName;
      return isCompact && kitDisplayName.length > 10 ? kitDisplayName.substring(0,8)+"…" : kitDisplayName;
    }
    return "Sound Bank";
  }, [selectedKitName, currentSoundInKit, currentSelectedKitData, soundsForDisplayInSelectedKit, isCompact]);

  const mainButtonIcon = useMemo(() => (selectedKitName && currentSoundInKit) ? faMusic : faBoxArchive, [selectedKitName, currentSoundInKit]);
  const buttonTextMaxWidthClass = isCompact ? 'max-w-[70px] sm:max-w-[80px]' : 'max-w-[160px] sm:max-w-[200px]';

  const renderKitSelection = () => {
    const availableKitNames = Object.keys(soundKits || {});
    if (availableKitNames.length === 0) return <p className="text-xs text-gray-400 p-3 text-center">No sound kits available.</p>;
    
    return (
      <div className="py-1">
        {availableKitNames.map((kitNameKey) => {
          const kitData = soundKits[kitNameKey];
          if (!kitData) { logToConsole?.('error', `[SoundBank] renderKitSelection: No data for kit key '${kitNameKey}'.`); return null; }
          return (
            <button
              key={kitNameKey}
              onClick={() => handleKitSelectInternal(kitNameKey)}
              className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors duration-150 ease-in-out ${selectedKitName === kitNameKey ? 'bg-brand-primary-dark text-white font-semibold ring-1 ring-blue-300' : 'text-gray-200 hover:bg-gray-600/70'}`}
              title={`Select kit: ${kitData.displayName || kitNameKey}`}
            >
              <span>{kitData.displayName || kitNameKey}</span>
              {selectedKitName === kitNameKey && !showKitList && <FontAwesomeIcon icon={faCaretRight} className="text-xs opacity-70" />}
            </button>
          );
        })}
         {isAdmin && (
            <div className="border-t border-gray-700/50 p-2 mt-1">
                 <Button onClick={() => { logToConsole?.("[SoundBank] Admin: Upload New Kit button clicked."); if(onUploadKitClick) onUploadKitClick(); setIsDropdownOpen(false); }} variant="secondary" size="sm" className="w-full text-xs !py-1.5" iconLeft={faUpload} >
                    Upload New Kit
                </Button>
                <Tooltip content="Kit requires a ZIP: audio files (e.g., WAV) + manifest.json (sound names, filenames, optional metadata).">
                    <p className="text-xxs text-gray-500 mt-1.5 italic text-center flex items-center justify-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> ZIP (WAVs & manifest.json)
                    </p>
                </Tooltip>
            </div>
        )}
      </div>
    );
  };

  const renderSoundSelection = () => {
    if (!currentSelectedKitData) return <p className="text-xs text-gray-400 p-3 text-center">No kit selected or kit data is invalid.</p>;
    if (soundsForDisplayInSelectedKit.length === 0) return <p className="text-xs text-gray-400 p-3 text-center">Kit '{currentSelectedKitData.displayName || selectedKitName}' has no sounds.</p>;
    
    return (
      <div className={`py-1 ${isCompact ? 'max-h-40' : 'max-h-60'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700/50`}>
        {soundsForDisplayInSelectedKit.map((soundObj) => {
          const displayName = getSoundNameFromPath(soundObj.url) || soundObj.name;
          const isSelected = currentSoundInKit === soundObj.name;
          return (
            <button
              key={soundObj.name}
              onClick={() => handleSoundSelectInternal(soundObj.name)}
              className={`block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors duration-150 ease-in-out ${isSelected ? 'bg-brand-seq text-white font-semibold ring-1 ring-blue-300' : 'text-gray-200 hover:bg-gray-600/70'}`}
              title={`Select sound: ${displayName}`}
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
        variant="secondary" // Base variant, dynamic classes will override if needed
        size={isCompact ? "custom" : "custom"}
        className={`flex items-center justify-between 
                    ${isCompact 
                        ? 'px-2 !h-8 min-w-[90px] text-xs' 
                        : 'px-3 !h-9 sm:!h-10 min-w-[180px] text-sm sm:text-base'}
                    ${isDropdownOpen ? 'ring-2 ring-brand-accent' : ''} 
                    border border-gray-600 hover:border-gray-500`} // Added border
        title={isDropdownOpen ? "Close sound/kit selection" : `Current: ${mainButtonText}. Click to change.`}
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
        <div className={`absolute z-50 right-0 mt-1 w-52 sm:w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-95`}> {/* Increased width slightly */}
          {showKitList ? renderKitSelection() : renderSoundSelection()}
          {((currentSelectedKitData && Object.keys(soundKits || {}).length > 1) || (isAdmin && !showKitList) ) && !showKitList && (
            <div className="border-t border-gray-700/50 p-1">
              <Button
                onClick={() => { 
                    logToConsole?.("[SoundBank] User clicked 'Change Kit / View Kits' link.");
                    setShowKitList(true);
                }}
                variant="link"
                size="sm"
                className="text-xs text-gray-400 hover:text-brand-accent w-full !justify-start !px-3 !py-1"
              >
                « View Kits {isAdmin && "/ Upload"}
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
        name: PropTypes.string.isRequired,
        key: PropTypes.string, 
        url: PropTypes.string.isRequired,
    })).isRequired,
    fileMap: PropTypes.objectOf(PropTypes.string).isRequired,
  })).isRequired,
  selectedKitName: PropTypes.string,
  onKitSelect: PropTypes.func.isRequired,
  currentSoundInKit: PropTypes.string,
  onSoundInKitSelect: PropTypes.func.isRequired,
  isCompact: PropTypes.bool,
  logToConsole: PropTypes.func,
  isAdmin: PropTypes.bool,
  onUploadKitClick: PropTypes.func,
};

export default React.memo(SoundBank);
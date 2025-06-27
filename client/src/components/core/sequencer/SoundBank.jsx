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

const SoundBank = ({
  soundKits,
  selectedKitName,
  onKitSelect,
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
    logToConsole?.('debug', `[SoundBank] Memo: soundsForDisplayInSelectedKit updated for '${selectedKitName}'. Count: ${sounds.length}.`);
    return sounds;
  }, [currentSelectedKitData, logToConsole]);

  useEffect(() => {
    logToConsole?.('effect', `[SoundBank] Dropdown/Kit Sync Effect. IsOpen: ${isDropdownOpen}, Kit: ${selectedKitName}, ShowKitList: ${showKitList}, HasKitData: !!${currentSelectedKitData}`);
    if (isDropdownOpen) {
      if (selectedKitName && currentSelectedKitData) {
        if (!showKitList) {
             logToConsole?.('debug', `[SoundBank] Effect: Dropdown open, showing sounds for kit '${selectedKitName}'.`);
        }
      } else {
        if (!showKitList) {
          logToConsole?.('warn', `[SoundBank] Effect: No valid kit ('${selectedKitName}'), forcing kit list view.`);
          setShowKitList(true);
        }
      }
    }
  }, [isDropdownOpen, selectedKitName, currentSelectedKitData, showKitList, logToConsole]);


  const handleKitSelectInternal = useCallback((kitNameKey) => {
    logToConsole?.('info', `[SoundBank] UI: Kit selected via dropdown: '${kitNameKey}'`);
    if (onKitSelect) {
      onKitSelect(kitNameKey);
    }
    setShowKitList(false);
  }, [onKitSelect, logToConsole]);

  const handleSoundSelectInternal = useCallback((soundName) => {
    logToConsole?.('info', `[SoundBank] UI: Sound selected: '${soundName}' from kit '${selectedKitName}'`);
    if (onSoundInKitSelect) {
      onSoundInKitSelect(soundName);
    }
    setIsDropdownOpen(false);
  }, [onSoundInKitSelect, selectedKitName, logToConsole]);

  const toggleDropdown = useCallback(() => {
    const nextIsOpenState = !isDropdownOpen;
    logToConsole?.('info', `[SoundBank] UI: Toggling dropdown. Next open: ${nextIsOpenState}`);
    if (nextIsOpenState) {
      const kitCount = Object.keys(soundKits || {}).length;
      if (!selectedKitName || kitCount > 1) {
        setShowKitList(true);
      } else {
        setShowKitList(false);
      }
    }
    setIsDropdownOpen(nextIsOpenState);
  }, [isDropdownOpen, selectedKitName, soundKits, logToConsole]);

  useEffect(() => {
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
          if (!kitData) { return null; }
          return (
            <button
              key={kitNameKey}
              onClick={() => handleKitSelectInternal(kitNameKey)}
              className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors duration-150 ease-in-out ${selectedKitName === kitNameKey ? 'bg-blue-600 text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
              title={`Select kit: ${kitData.displayName || kitNameKey}`}
            >
              <span>{kitData.displayName || kitNameKey}</span>
              {selectedKitName === kitNameKey && !showKitList && <FontAwesomeIcon icon={faCaretRight} className="text-xs opacity-70" />}
            </button>
          );
        })}
         {isAdmin && (
            <div className="border-t border-gray-700/50 p-2 mt-1">
                 <Button onClick={() => { if(onUploadKitClick) onUploadKitClick(); setIsDropdownOpen(false); }} variant="secondary" size="sm" className="w-full text-xs !py-1.5" iconLeft={faUpload}>Upload New Kit</Button>
                <Tooltip content="Kit requires a ZIP: audio files (e.g., WAV) + manifest.json.">
                    <p className="text-xs text-gray-500 mt-1.5 italic text-center flex items-center justify-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> ZIP (WAVs & manifest.json)
                    </p>
                </Tooltip>
            </div>
        )}
      </div>
    );
  };

  const renderSoundSelection = () => {
    if (!currentSelectedKitData) return <p className="text-xs text-gray-400 p-3 text-center">No kit selected.</p>;
    if (soundsForDisplayInSelectedKit.length === 0) return <p className="text-xs text-gray-400 p-3 text-center">Kit has no sounds.</p>;
    
    return (
      <div className={`py-1 ${isCompact ? 'max-h-40' : 'max-h-60'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700/50`}>
        {soundsForDisplayInSelectedKit.map((soundObj) => {
          const displayName = getSoundNameFromPath(soundObj.url) || soundObj.name;
          const isSelected = currentSoundInKit === soundObj.name;
          return (
            <button
              key={soundObj.name}
              onClick={() => handleSoundSelectInternal(soundObj.name)}
              className={`block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors duration-150 ease-in-out ${isSelected ? 'bg-brand-seq text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
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
        variant="custom" // Using 'custom' to apply all styles via className
        className={`flex items-center justify-between 
                    ${isCompact 
                        ? 'px-2 h-8 min-w-[90px] text-xs' 
                        : 'px-3 h-9 sm:h-10 min-w-[180px] text-sm sm:text-base'}
                    ${isDropdownOpen ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-600'} 
                    bg-gray-700 hover:ring-gray-500 text-gray-100`}
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
        <div className={`absolute z-50 right-0 mt-1 w-52 sm:w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-95`}>
          {showKitList ? renderKitSelection() : renderSoundSelection()}
          {currentSelectedKitData && Object.keys(soundKits || {}).length > 1 && !showKitList && (
            <div className="border-t border-gray-700/50 p-1">
              <Button
                onClick={() => setShowKitList(true)}
                variant="custom"
                className="text-xs text-gray-400 hover:text-blue-400 w-full justify-start px-3 py-1"
              >
                « View Kits
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
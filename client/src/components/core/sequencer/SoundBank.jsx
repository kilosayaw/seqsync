import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxArchive, faMusic, faChevronDown, faChevronUp, faUpload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

// ============================================================================
// FIX: The import path is now corrected to go up two directories.
// From: .../core/sequencer/ -> ../ -> .../core/ -> ../ -> .../components/ -> common/
// ============================================================================
import Button from '../../common/Button';

const SoundBank = ({
  soundKits,
  selectedKitName,
  onKitSelect,
  currentSoundInKit,
  onSoundInKitSelect,
  isCompact = false,
  isAdmin = false,
  onUploadKitClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showKitList, setShowKitList] = useState(false);
  const dropdownRef = useRef(null);

  const currentSelectedKitData = useMemo(() => {
    if (!selectedKitName || !soundKits || !soundKits[selectedKitName]) {
      return null;
    }
    return soundKits[selectedKitName];
  }, [soundKits, selectedKitName]);

  const soundsForDisplayInSelectedKit = useMemo(() => {
    if (!currentSelectedKitData || !currentSelectedKitData.sounds || !currentSelectedKitData.orderedKeys) {
      return [];
    }
    const soundMap = currentSelectedKitData.sounds.reduce((acc, sound) => {
      acc[sound.name] = sound;
      return acc;
    }, {});
    
    return currentSelectedKitData.orderedKeys
      .map(key => soundMap[key])
      .filter(Boolean);
  }, [currentSelectedKitData]);

  useEffect(() => {
    if (isDropdownOpen) {
      const kitCount = Object.keys(soundKits || {}).length;
      if (kitCount > 1) {
        setShowKitList(true);
      } else {
        setShowKitList(false);
      }
    }
  }, [isDropdownOpen, soundKits]);

  const handleKitSelectInternal = useCallback((kitNameKey) => {
    if (onKitSelect) {
      onKitSelect(kitNameKey);
    }
    setShowKitList(false);
  }, [onKitSelect]);

  const handleSoundSelectInternal = useCallback((soundName) => {
    if (onSoundInKitSelect) {
      onSoundInKitSelect(soundName);
    }
    setIsDropdownOpen(false);
  }, [onSoundInKitSelect]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const mainButtonText = useMemo(() => {
    if (currentSoundInKit) {
      return currentSoundInKit;
    }
    if (currentSelectedKitData) {
      return currentSelectedKitData.displayName || selectedKitName;
    }
    return "Sound Bank";
  }, [currentSoundInKit, currentSelectedKitData, selectedKitName]);

  const mainButtonIcon = useMemo(() => currentSoundInKit ? faMusic : faBoxArchive, [currentSoundInKit]);
  const buttonTextMaxWidthClass = isCompact ? 'max-w-[70px] sm:max-w-[80px]' : 'max-w-[160px] sm:max-w-[200px]';

  const renderKitSelection = () => (
    <div className="py-1">
      {Object.values(soundKits).map((kit) => (
        <button
          key={kit.name}
          onClick={() => handleKitSelectInternal(kit.name)}
          className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${selectedKitName === kit.name ? 'bg-blue-600 text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
          title={`Select kit: ${kit.displayName}`}
        >
          <span>{kit.displayName}</span>
        </button>
      ))}
    </div>
  );
  
  const renderSoundSelection = () => (
    <div className={`py-1 ${isCompact ? 'max-h-40' : 'max-h-80'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700/50`}>
      {soundsForDisplayInSelectedKit.map((sound) => {
        const isSelected = currentSoundInKit === sound.name;
        return (
          <button
            key={sound.name}
            onClick={() => handleSoundSelectInternal(sound.name)}
            className={`block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${isSelected ? 'bg-blue-500 text-white font-semibold' : 'text-gray-200 hover:bg-gray-600/70'}`}
            title={`Select sound: ${sound.name}`}
          >
            {sound.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        variant="custom"
        className={`flex items-center justify-between ${isCompact ? 'px-2 h-8 min-w-[90px] text-xs' : 'px-3 h-9 sm:h-10 min-w-[180px] text-sm'} ${isDropdownOpen ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-600'} bg-gray-700 hover:ring-gray-500 text-gray-100`}
        title={isDropdownOpen ? "Close selection" : `Current: ${mainButtonText}`}
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
              <Button onClick={() => setShowKitList(true)} variant="custom" className="text-xs text-gray-400 hover:text-blue-400 w-full justify-start px-3 py-1">
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
    name: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    sounds: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    })).isRequired,
    orderedKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  selectedKitName: PropTypes.string,
  onKitSelect: PropTypes.func.isRequired,
  currentSoundInKit: PropTypes.string,
  onSoundInKitSelect: PropTypes.func.isRequired,
  isCompact: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onUploadKitClick: PropTypes.func,
};

export default React.memo(SoundBank);
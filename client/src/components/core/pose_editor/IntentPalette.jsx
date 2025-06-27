import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faShieldAlt, faRunning, faHandPaper, faFistRaised } from '@fortawesome/free-solid-svg-icons';
import { INTENT_OPTIONS } from '../../../utils/constants';

const IntentCard = ({ intent, onSelect }) => {
  const ICONS = {
    StrikeRelease: faFistRaised,
    BlockImpact: faShieldAlt,
    Evasion: faRunning,
    Default: faHandPaper,
  };
  const icon = ICONS[intent.value] || ICONS.Default;

  return (
    <div
      onClick={() => onSelect(intent.value)}
      className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-800 rounded-lg cursor-pointer transition-all duration-150 hover:bg-yellow-400 hover:text-black hover:scale-105"
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData("application/intent-id", intent.value);
        e.dataTransfer.effectAllowed = "copy";
      }}
    >
      <FontAwesomeIcon icon={icon} className="text-2xl" />
      <span className="text-xs font-semibold tracking-wide">{intent.label}</span>
    </div>
  );
};

const IntentPalette = ({ onIntentSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      <Button 
        onClick={() => setIsOpen(prev => !prev)} 
        variant="secondary" 
        className="w-full"
      >
        {isOpen ? 'Close' : 'Open'} Intent Palette
      </Button>
      {isOpen && (
        <div className="w-full mt-2 p-4 bg-gray-900/70 backdrop-blur-sm rounded-lg border border-gray-700">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {INTENT_OPTIONS.map(intent => (
              <IntentCard key={intent.value} intent={intent} onSelect={onIntentSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

IntentPalette.propTypes = {
  onIntentSelect: PropTypes.func.isRequired,
};

export default IntentPalette;
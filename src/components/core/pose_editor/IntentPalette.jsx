import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFistRaised, faShieldAlt, faRunning, faCompressArrowsAlt, 
    faExpandArrowsAlt, faRandom, faDotCircle, faHandSparkles
} from '@fortawesome/free-solid-svg-icons';
import { INTENT_OPTIONS } from '../../../utils/constants';
import Tooltip from '../../common/Tooltip';

// A single clickable card for an intent.
const IntentCard = ({ intent, onSelect, isActive }) => {
  const ICONS = {
    StrikeRelease: faFistRaised,
    BlockImpact: faShieldAlt,
    Evasion: faRunning,
    Coil: faCompressArrowsAlt,
    ReleasePwr: faExpandArrowsAlt,
    PassThrough: faRandom,
    Stabilize: faDotCircle,
    Recover: faHandSparkles,
  };
  const icon = ICONS[intent.value] || faDotCircle;

  return (
    <Tooltip content={intent.label} placement="top">
        <div
            onClick={() => onSelect(intent.value)}
            className={`
                flex flex-col items-center justify-center gap-1 p-2 rounded-lg cursor-pointer 
                transition-all duration-150 shadow-md aspect-square
                ${isActive 
                    ? 'bg-pos-yellow text-black scale-105 ring-2 ring-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }
            `}
        >
            <FontAwesomeIcon icon={icon} className="text-lg" />
            <span className="text-[0.6rem] font-semibold tracking-wide uppercase">{intent.label}</span>
        </div>
    </Tooltip>
  );
};
IntentCard.propTypes = { 
    intent: PropTypes.object.isRequired, 
    onSelect: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
};

// The main palette component that displays all the intent cards.
const IntentPalette = ({ onIntentSelect, activeIntent }) => {
  return (
    <div className="w-full mt-4 p-3 bg-gray-900/70 backdrop-blur-sm rounded-lg border border-gray-700">
      <h3 className="text-sm font-bold text-center mb-3 text-pos-yellow uppercase tracking-wider">Joint Intent</h3>
      <div className="grid grid-cols-4 gap-2">
        {INTENT_OPTIONS.map(intent => (
          <IntentCard 
            key={intent.value} 
            intent={intent} 
            onSelect={onIntentSelect}
            isActive={activeIntent === intent.value}
          />
        ))}
      </div>
    </div>
  );
};

IntentPalette.propTypes = {
  onIntentSelect: PropTypes.func.isRequired,
  activeIntent: PropTypes.string,
};

export default IntentPalette;
// client/src/components/SoundBank/SoundBank.jsx
import React, { useState } from 'react';
import { tr808SoundFiles } from '../../utils/sounds';

const SoundBank = ({ onSoundSelect, currentSelectedSoundName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (soundName) => {
    onSoundSelect(soundName);
    // setIsOpen(false); // Optional: close after selection
  };

  return (
    <div className="relative inline-block text-left my-2">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          SOUND BANK {currentSelectedSoundName && `(${currentSelectedSoundName.substring(0,10)}${currentSelectedSoundName.length > 10 ? '...' : ''})`}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-center absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto z-20"
          role="menu" aria-orientation="vertical" aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {tr808SoundFiles.map((soundName) => (
              <button
                key={soundName}
                onClick={() => handleSelect(soundName)}
                className={`${
                  currentSelectedSoundName === soundName ? 'bg-indigo-500 text-white' : 'text-gray-200'
                } block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 hover:text-white`}
                role="menuitem"
              >
                {soundName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
             <button
                onClick={() => handleSelect(null)} // Option to clear selected sound
                className="text-gray-300 block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 hover:text-white border-t border-gray-600"
                role="menuitem"
              >
                Clear Selected Sound
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundBank;
// This file is the single source of truth for sound definitions.
// The actual audio playback is handled by audioManager.js.

/**
 * Extracts a clean sound name from a full file path.
 * @param {string} soundPath - The full path to the sound file.
 * @returns {string} The cleaned sound name.
 */
export const getSoundNameFromPath = (soundPath) => {
    if (!soundPath || typeof soundPath !== 'string') {
        return 'unknown';
    }
    try {
        const filename = soundPath.substring(soundPath.lastIndexOf('/') + 1);
        const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
        const cleanName = nameWithoutExtension.replace(/[-_]\d*$/, '').trim();
        return cleanName;
    } catch (error) {
        console.error("Error parsing sound name from path:", soundPath, error);
        return 'parse_error';
    }
};

// ===================================================================================
// TR-808 SOUND KIT DEFINITION
// ===================================================================================
export const DEFAULT_SOUND_PATH_PREFIX = '/assets/sounds/fixed-sounds/tr808/';

export const tr808SoundFilePaths = {
  'BD0000': { key: 'BD0000', name: 'BD0000', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0000.wav` },
  'BD0025': { key: 'BD0025', name: 'BD0025', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0025.wav` },
  // ... All your other 130+ sound definitions go here ...
  'CY1010': { key: 'CY1010', name: 'CY1010', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1010.wav` },
};

// Exporting the array of sound objects for easy mapping in the UI
export const tr808SoundsArray = Object.values(tr808SoundFilePaths);
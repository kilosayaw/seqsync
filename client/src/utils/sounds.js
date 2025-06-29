// src/utils/sounds.js

export const DEFAULT_SOUND_PATH_PREFIX = '/assets/sounds/kits/tr808/';

export const tr808SoundFilePaths = {
  // Bass Drum (BD) - Example: First 5 and last 5 of 25 variations
  'BD0000': { key: 'BD0000', name: 'BD0000', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0000.wav` },
  'BD0025': { key: 'BD0025', name: 'BD0025', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0025.wav` },
  'BD0050': { key: 'BD0050', name: 'BD0050', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0050.wav` },
  'BD0075': { key: 'BD0075', name: 'BD0075', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0075.wav` },
  'BD0010': { key: 'BD0010', name: 'BD0010', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0010.wav` },
  // ... (ensure all 25 BD variations are listed here based on your files)
  'BD2500': { key: 'BD2500', name: 'BD2500', url: `${DEFAULT_SOUND_PATH_PREFIX}BD2500.wav` },
  'BD2575': { key: 'BD2575', name: 'BD2575', url: `${DEFAULT_SOUND_PATH_PREFIX}BD2575.wav` },
  'BD5050': { key: 'BD5050', name: 'BD5050', url: `${DEFAULT_SOUND_PATH_PREFIX}BD5050.wav` },
  'BD7525': { key: 'BD7525', name: 'BD7525', url: `${DEFAULT_SOUND_PATH_PREFIX}BD7525.wav` },
  'BD1075': { key: 'BD1075', name: 'BD1075', url: `${DEFAULT_SOUND_PATH_PREFIX}BD1075.wav` },

  // Snare Drum (SD) - Example: First 5 and last 5 of 25 variations
  'SD0000': { key: 'SD0000', name: 'SD0000', url: `${DEFAULT_SOUND_PATH_PREFIX}SD0000.wav` },
  'SD0025': { key: 'SD0025', name: 'SD0025', url: `${DEFAULT_SOUND_PATH_PREFIX}SD0025.wav` },
  // ... (ensure all 25 SD variations are listed here)
  'SD2575': { key: 'SD2575', name: 'SD2575', url: `${DEFAULT_SOUND_PATH_PREFIX}SD2575.wav` },
  'SD7575': { key: 'SD7575', name: 'SD7575', url: `${DEFAULT_SOUND_PATH_PREFIX}SD7575.wav` },
  'SD1010': { key: 'SD1010', name: 'SD1010', url: `${DEFAULT_SOUND_PATH_PREFIX}SD1010.wav` },

  // Toms, Congas (5 variations each)
  'LT00': { key: 'LT00', name: 'LT00', url: `${DEFAULT_SOUND_PATH_PREFIX}LT00.wav` },
  'LT25': { key: 'LT25', name: 'LT25', url: `${DEFAULT_SOUND_PATH_PREFIX}LT25.wav` },
  'LT50': { key: 'LT50', name: 'LT50', url: `${DEFAULT_SOUND_PATH_PREFIX}LT50.wav` },
  'LT75': { key: 'LT75', name: 'LT75', url: `${DEFAULT_SOUND_PATH_PREFIX}LT75.wav` },
  'LT10': { key: 'LT10', name: 'LT10', url: `${DEFAULT_SOUND_PATH_PREFIX}LT10.wav` },

  'MT00': { key: 'MT00', name: 'MT00', url: `${DEFAULT_SOUND_PATH_PREFIX}MT00.wav` },
  'MT25': { key: 'MT25', name: 'MT25', url: `${DEFAULT_SOUND_PATH_PREFIX}MT25.wav` },
  'MT50': { key: 'MT50', name: 'MT50', url: `${DEFAULT_SOUND_PATH_PREFIX}MT50.wav` },
  'MT75': { key: 'MT75', name: 'MT75', url: `${DEFAULT_SOUND_PATH_PREFIX}MT75.wav` },
  'MT10': { key: 'MT10', name: 'MT10', url: `${DEFAULT_SOUND_PATH_PREFIX}MT10.wav` },

  'HT00': { key: 'HT00', name: 'HT00', url: `${DEFAULT_SOUND_PATH_PREFIX}HT00.wav` },
  'HT25': { key: 'HT25', name: 'HT25', url: `${DEFAULT_SOUND_PATH_PREFIX}HT25.wav` },
  'HT50': { key: 'HT50', name: 'HT50', url: `${DEFAULT_SOUND_PATH_PREFIX}HT50.wav` },
  'HT75': { key: 'HT75', name: 'HT75', url: `${DEFAULT_SOUND_PATH_PREFIX}HT75.wav` },
  'HT10': { key: 'HT10', name: 'HT10', url: `${DEFAULT_SOUND_PATH_PREFIX}HT10.wav` },
  
  'LC00': { key: 'LC00', name: 'LC00', url: `${DEFAULT_SOUND_PATH_PREFIX}LC00.wav` },
  'LC25': { key: 'LC25', name: 'LC25', url: `${DEFAULT_SOUND_PATH_PREFIX}LC25.wav` },
  'LC50': { key: 'LC50', name: 'LC50', url: `${DEFAULT_SOUND_PATH_PREFIX}LC50.wav` },
  'LC75': { key: 'LC75', name: 'LC75', url: `${DEFAULT_SOUND_PATH_PREFIX}LC75.wav` },
  'LC10': { key: 'LC10', name: 'LC10', url: `${DEFAULT_SOUND_PATH_PREFIX}LC10.wav` },

  'MC00': { key: 'MC00', name: 'MC00', url: `${DEFAULT_SOUND_PATH_PREFIX}MC00.wav` },
  'MC25': { key: 'MC25', name: 'MC25', url: `${DEFAULT_SOUND_PATH_PREFIX}MC25.wav` },
  'MC50': { key: 'MC50', name: 'MC50', url: `${DEFAULT_SOUND_PATH_PREFIX}MC50.wav` },
  'MC75': { key: 'MC75', name: 'MC75', url: `${DEFAULT_SOUND_PATH_PREFIX}MC75.wav` },
  'MC10': { key: 'MC10', name: 'MC10', url: `${DEFAULT_SOUND_PATH_PREFIX}MC10.wav` },

  'HC00': { key: 'HC00', name: 'HC00', url: `${DEFAULT_SOUND_PATH_PREFIX}HC00.wav` },
  'HC25': { key: 'HC25', name: 'HC25', url: `${DEFAULT_SOUND_PATH_PREFIX}HC25.wav` },
  'HC50': { key: 'HC50', name: 'HC50', url: `${DEFAULT_SOUND_PATH_PREFIX}HC50.wav` },
  'HC75': { key: 'HC75', name: 'HC75', url: `${DEFAULT_SOUND_PATH_PREFIX}HC75.wav` },
  'HC10': { key: 'HC10', name: 'HC10', url: `${DEFAULT_SOUND_PATH_PREFIX}HC10.wav` },

  // Single Variation Sounds
  'RS':   { key: 'RS',   name: 'RS',   url: `${DEFAULT_SOUND_PATH_PREFIX}RS.wav` },
  'CL':   { key: 'CL',   name: 'CL',   url: `${DEFAULT_SOUND_PATH_PREFIX}CL.wav` },
  'CP':   { key: 'CP',   name: 'CP',   url: `${DEFAULT_SOUND_PATH_PREFIX}CP.wav` },
  'MA':   { key: 'MA',   name: 'MA',   url: `${DEFAULT_SOUND_PATH_PREFIX}MA.wav` },
  'CB':   { key: 'CB',   name: 'CB',   url: `${DEFAULT_SOUND_PATH_PREFIX}CB.wav` },
  'CH':   { key: 'CH',   name: 'CH',   url: `${DEFAULT_SOUND_PATH_PREFIX}CH.wav` },

  // Open Hi Hat (OH) - 5 sounds
  'OH00': { key: 'OH00', name: 'OH00', url: `${DEFAULT_SOUND_PATH_PREFIX}OH00.wav` },
  'OH25': { key: 'OH25', name: 'OH25', url: `${DEFAULT_SOUND_PATH_PREFIX}OH25.wav` },
  'OH50': { key: 'OH50', name: 'OH50', url: `${DEFAULT_SOUND_PATH_PREFIX}OH50.wav` },
  'OH75': { key: 'OH75', name: 'OH75', url: `${DEFAULT_SOUND_PATH_PREFIX}OH75.wav` },
  'OH10': { key: 'OH10', name: 'OH10', url: `${DEFAULT_SOUND_PATH_PREFIX}OH10.wav` },

  // Cymbal (CY) - Example: First 5 and last 5 of 25 variations
  'CY0000': { key: 'CY0000', name: 'CY0000', url: `${DEFAULT_SOUND_PATH_PREFIX}CY0000.wav` },
  'CY0025': { key: 'CY0025', name: 'CY0025', url: `${DEFAULT_SOUND_PATH_PREFIX}CY0025.wav` },
  // ... (ensure all 25 CY variations are listed here)
  'CY2575': { key: 'CY2575', name: 'CY2575', url: `${DEFAULT_SOUND_PATH_PREFIX}CY2575.wav` },
  'CY7575': { key: 'CY7575', name: 'CY7575', url: `${DEFAULT_SOUND_PATH_PREFIX}CY7575.wav` },
  'CY1010': { key: 'CY1010', name: 'CY1010', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1010.wav` },
};

export const tr808SoundsArray = Object.entries(tr808SoundFilePaths).map(([key, value]) => ({
  key: key,    // The filename base e.g. "BD0000"
  name: key,   // Display name is also the filename base
  url: value.url,  // The actual URL string
}));

// Full ordered list of keys for SoundBank display.
// YOU MUST POPULATE THIS WITH ALL 116 KEYS IN YOUR DESIRED ORDER
// This is an example structure, not the full 116 keys.
export const tr808SoundKeysOrdered = [
  // Bass Drums
  'BD0000', 'BD0025', 'BD0050', 'BD0075', 'BD0010',
  'BD2500', /* ..., */ 'BD2575', /* ..., */
  'BD1075', // Ensure all 25 BD keys are here
  // Snare Drums
  'SD0000', 'SD0025', /* ..., */ 'SD2575', /* ..., */ 'SD1010', // All 25 SD keys
  // Single Hits
  'RS', 'CP', 'MA', 'CB', 'CL',
  // Hats
  'CH', 
  'OH00', 'OH25', 'OH50', 'OH75', 'OH10',
  // Toms
  'LT00', 'LT25', 'LT50', 'LT75', 'LT10',
  'MT00', 'MT25', 'MT50', 'MT75', 'MT10',
  'HT00', 'HT25', 'HT50', 'HT75', 'HT10',
  // Congas
  'LC00', 'LC25', 'LC50', 'LC75', 'LC10',
  'MC00', 'MC25', 'MC50', 'MC75', 'MC10',
  'HC00', 'HC25', 'HC50', 'HC75', 'HC10',
  // Cymbals
  'CY0000', 'CY0025', /* ..., */ 'CY2575', /* ..., */ 'CY1010', // All 25 CY keys
];
/**
 * Gets a display name for a sound.
 * If soundInput is an object with a 'name' property, that's used.
 * If soundInput is a string (key), it returns the key itself (which is the filename base).
 * @param {string | {name: string}} soundInput - The sound key or object.
 * @returns {string} The display name (filename base).
 */
export const getSoundNameFromPath = (soundInput) => {
  if (!soundInput) return 'N/A';
  if (typeof soundInput === 'object' && soundInput.name) {
    return soundInput.name; 
  }
  if (typeof soundInput === 'string') {
    // Check if it's a key in our defined sound files (which holds the object)
    if (tr808SoundFilePaths[soundInput] && tr808SoundFilePaths[soundInput].name) {
      return tr808SoundFilePaths[soundInput].name; // This will be the key itself, e.g., "BD0000"
    }
    // Fallback if somehow a full path is passed and not found as a key
    const parts = soundInput.split('/');
    const fileNameWithExt = parts.pop();
    if (!fileNameWithExt) return 'Unknown Sound';
    const fileNameParts = fileNameWithExt.split('.');
    if (fileNameParts.length > 1) fileNameParts.pop();
    return fileNameParts.join('.');
  }
  return 'Invalid Sound Input';
};

// --- ALL_JOINTS_MAP and UI_..._ABBREVS_NEW remain the same as provided in the previous "Definitive Version" ---
export const ALL_JOINTS_MAP = { /* ... */ };
export const UI_LEFT_JOINTS_ABBREVS_NEW = [ /* ... */ ];
export const UI_RIGHT_JOINTS_ABBREVS_NEW = [ /* ... */ ];
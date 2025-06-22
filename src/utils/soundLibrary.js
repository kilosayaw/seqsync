// This file is the single source of truth for sound definitions and organization.
// The actual audio playback is handled by audioManager.js.

/**
 * Extracts a clean sound name from a full file path.
 * It removes the path, the extension, and any trailing numbers or dashes.
 * Examples:
 * - '/assets/sounds/kick.wav' -> 'kick'
 * - '/assets/sounds/snare-01.mp3' -> 'snare'
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
        // This regex is slightly different from the original to correctly handle names like 'RS'
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
  'BD0050': { key: 'BD0050', name: 'BD0050', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0050.wav` },
  'BD0075': { key: 'BD0075', name: 'BD0075', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0075.wav` },
  'BD0010': { key: 'BD0010', name: 'BD0010', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0010.wav` },
  'BD2500': { key: 'BD2500', name: 'BD2500', url: `${DEFAULT_SOUND_PATH_PREFIX}BD2500.wav` },
  'BD2525': { key: 'BD2525', name: 'BD2525', url: `${DEFAULT_SOUND_PATH_PREFIX}BD2525.wav` },
  'BD2550': { key: 'BD2550', name: 'BD2550', url: `${DEFAULT_SOUND_PATH_PREFIX}BD2550.wav` },
  'BD2575': { key: 'BD2575', name: 'BD2575', url: `${DEFAULT_SOUND_PATH_PREFIX}BD2575.wav` },
  'BD2510': { key: 'BD2510', name: 'BD2510', url: `${DEFAULT_SOUND_PATH_PREFIX}BD2510.wav` },
  'BD5000': { key: 'BD5000', name: 'BD5000', url: `${DEFAULT_SOUND_PATH_PREFIX}BD5000.wav` },
  'BD5025': { key: 'BD5025', name: 'BD5025', url: `${DEFAULT_SOUND_PATH_PREFIX}BD5025.wav` },
  'BD5050': { key: 'BD5050', name: 'BD5050', url: `${DEFAULT_SOUND_PATH_PREFIX}BD5050.wav` },
  'BD5075': { key: 'BD5075', name: 'BD5075', url: `${DEFAULT_SOUND_PATH_PREFIX}BD5075.wav` },
  'BD5010': { key: 'BD5010', name: 'BD5010', url: `${DEFAULT_SOUND_PATH_PREFIX}BD5010.wav` },
  'BD7500': { key: 'BD7500', name: 'BD7500', url: `${DEFAULT_SOUND_PATH_PREFIX}BD7500.wav` },
  'BD7525': { key: 'BD7525', name: 'BD7525', url: `${DEFAULT_SOUND_PATH_PREFIX}BD7525.wav` },
  'BD7550': { key: 'BD7550', name: 'BD7550', url: `${DEFAULT_SOUND_PATH_PREFIX}BD7550.wav` },
  'BD7575': { key: 'BD7575', name: 'BD7575', url: `${DEFAULT_SOUND_PATH_PREFIX}BD7575.wav` },
  'BD7510': { key: 'BD7510', name: 'BD7510', url: `${DEFAULT_SOUND_PATH_PREFIX}BD7510.wav` },
  'BD1000': { key: 'BD1000', name: 'BD1000', url: `${DEFAULT_SOUND_PATH_PREFIX}BD1000.wav` },
  'BD1025': { key: 'BD1025', name: 'BD1025', url: `${DEFAULT_SOUND_PATH_PREFIX}BD1025.wav` },
  'BD1050': { key: 'BD1050', name: 'BD1050', url: `${DEFAULT_SOUND_PATH_PREFIX}BD1050.wav` },
  'BD1075': { key: 'BD1075', name: 'BD1075', url: `${DEFAULT_SOUND_PATH_PREFIX}BD1075.wav` },
  'BD1010': { key: 'BD1010', name: 'BD1010', url: `${DEFAULT_SOUND_PATH_PREFIX}BD1010.wav` },
  'SD0000': { key: 'SD0000', name: 'SD0000', url: `${DEFAULT_SOUND_PATH_PREFIX}SD0000.wav` },
  'SD0025': { key: 'SD0025', name: 'SD0025', url: `${DEFAULT_SOUND_PATH_PREFIX}SD0025.wav` },
  'SD0050': { key: 'SD0050', name: 'SD0050', url: `${DEFAULT_SOUND_PATH_PREFIX}SD0050.wav` },
  'SD0075': { key: 'SD0075', name: 'SD0075', url: `${DEFAULT_SOUND_PATH_PREFIX}SD0075.wav` },
  'SD0010': { key: 'SD0010', name: 'SD0010', url: `${DEFAULT_SOUND_PATH_PREFIX}SD0010.wav` },
  'SD2500': { key: 'SD2500', name: 'SD2500', url: `${DEFAULT_SOUND_PATH_PREFIX}SD2500.wav` },
  'SD2525': { key: 'SD2525', name: 'SD2525', url: `${DEFAULT_SOUND_PATH_PREFIX}SD2525.wav` },
  'SD2550': { key: 'SD2550', name: 'SD2550', url: `${DEFAULT_SOUND_PATH_PREFIX}SD2550.wav` },
  'SD2575': { key: 'SD2575', name: 'SD2575', url: `${DEFAULT_SOUND_PATH_PREFIX}SD2575.wav` },
  'SD2510': { key: 'SD2510', name: 'SD2510', url: `${DEFAULT_SOUND_PATH_PREFIX}SD2510.wav` },
  'SD5000': { key: 'SD5000', name: 'SD5000', url: `${DEFAULT_SOUND_PATH_PREFIX}SD5000.wav` },
  'SD5025': { key: 'SD5025', name: 'SD5025', url: `${DEFAULT_SOUND_PATH_PREFIX}SD5025.wav` },
  'SD5050': { key: 'SD5050', name: 'SD5050', url: `${DEFAULT_SOUND_PATH_PREFIX}SD5050.wav` },
  'SD5075': { key: 'SD5075', name: 'SD5075', url: `${DEFAULT_SOUND_PATH_PREFIX}SD5075.wav` },
  'SD5010': { key: 'SD5010', name: 'SD5010', url: `${DEFAULT_SOUND_PATH_PREFIX}SD5010.wav` },
  'SD7500': { key: 'SD7500', name: 'SD7500', url: `${DEFAULT_SOUND_PATH_PREFIX}SD7500.wav` },
  'SD7525': { key: 'SD7525', name: 'SD7525', url: `${DEFAULT_SOUND_PATH_PREFIX}SD7525.wav` },
  'SD7550': { key: 'SD7550', name: 'SD7550', url: `${DEFAULT_SOUND_PATH_PREFIX}SD7550.wav` },
  'SD7575': { key: 'SD7575', name: 'SD7575', url: `${DEFAULT_SOUND_PATH_PREFIX}SD7575.wav` },
  'SD7510': { key: 'SD7510', name: 'SD7510', url: `${DEFAULT_SOUND_PATH_PREFIX}SD7510.wav` },
  'SD1000': { key: 'SD1000', name: 'SD1000', url: `${DEFAULT_SOUND_PATH_PREFIX}SD1000.wav` },
  'SD1025': { key: 'SD1025', name: 'SD1025', url: `${DEFAULT_SOUND_PATH_PREFIX}SD1025.wav` },
  'SD1050': { key: 'SD1050', name: 'SD1050', url: `${DEFAULT_SOUND_PATH_PREFIX}SD1050.wav` },
  'SD1075': { key: 'SD1075', name: 'SD1075', url: `${DEFAULT_SOUND_PATH_PREFIX}SD1075.wav` },
  'SD1010': { key: 'SD1010', name: 'SD1010', url: `${DEFAULT_SOUND_PATH_PREFIX}SD1010.wav` },
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
  'RS':   { key: 'RS',   name: 'RS',   url: `${DEFAULT_SOUND_PATH_PREFIX}RS.wav` },
  'CL':   { key: 'CL',   name: 'CL',   url: `${DEFAULT_SOUND_PATH_PREFIX}CL.wav` },
  'CP':   { key: 'CP',   name: 'CP',   url: `${DEFAULT_SOUND_PATH_PREFIX}CP.wav` },
  'MA':   { key: 'MA',   name: 'MA',   url: `${DEFAULT_SOUND_PATH_PREFIX}MA.wav` },
  'CB':   { key: 'CB',   name: 'CB',   url: `${DEFAULT_SOUND_PATH_PREFIX}CB.wav` },
  'CH':   { key: 'CH',   name: 'CH',   url: `${DEFAULT_SOUND_PATH_PREFIX}CH.wav` },
  'OH00': { key: 'OH00', name: 'OH00', url: `${DEFAULT_SOUND_PATH_PREFIX}OH00.wav` },
  'OH25': { key: 'OH25', name: 'OH25', url: `${DEFAULT_SOUND_PATH_PREFIX}OH25.wav` },
  'OH50': { key: 'OH50', name: 'OH50', url: `${DEFAULT_SOUND_PATH_PREFIX}OH50.wav` },
  'OH75': { key: 'OH75', name: 'OH75', url: `${DEFAULT_SOUND_PATH_PREFIX}OH75.wav` },
  'OH10': { key: 'OH10', name: 'OH10', url: `${DEFAULT_SOUND_PATH_PREFIX}OH10.wav` },
  'CY0000': { key: 'CY0000', name: 'CY0000', url: `${DEFAULT_SOUND_PATH_PREFIX}CY0000.wav` },
  'CY0025': { key: 'CY0025', name: 'CY0025', url: `${DEFAULT_SOUND_PATH_PREFIX}CY0025.wav` },
  'CY0050': { key: 'CY0050', name: 'CY0050', url: `${DEFAULT_SOUND_PATH_PREFIX}CY0050.wav` },
  'CY0075': { key: 'CY0075', name: 'CY0075', url: `${DEFAULT_SOUND_PATH_PREFIX}CY0075.wav` },
  'CY0010': { key: 'CY0010', name: 'CY0010', url: `${DEFAULT_SOUND_PATH_PREFIX}CY0010.wav` },
  'CY2500': { key: 'CY2500', name: 'CY2500', url: `${DEFAULT_SOUND_PATH_PREFIX}CY2500.wav` },
  'CY2525': { key: 'CY2525', name: 'CY2525', url: `${DEFAULT_SOUND_PATH_PREFIX}CY2525.wav` },
  'CY2550': { key: 'CY2550', name: 'CY2550', url: `${DEFAULT_SOUND_PATH_PREFIX}CY2550.wav` },
  'CY2575': { key: 'CY2575', name: 'CY2575', url: `${DEFAULT_SOUND_PATH_PREFIX}CY2575.wav` },
  'CY2510': { key: 'CY2510', name: 'CY2510', url: `${DEFAULT_SOUND_PATH_PREFIX}CY2510.wav` },
  'CY5000': { key: 'CY5000', name: 'CY5000', url: `${DEFAULT_SOUND_PATH_PREFIX}CY5000.wav` },
  'CY5025': { key: 'CY5025', name: 'CY5025', url: `${DEFAULT_SOUND_PATH_PREFIX}CY5025.wav` },
  'CY5050': { key: 'CY5050', name: 'CY5050', url: `${DEFAULT_SOUND_PATH_PREFIX}CY5050.wav` },
  'CY5075': { key: 'CY5075', name: 'CY5075', url: `${DEFAULT_SOUND_PATH_PREFIX}CY5075.wav` },
  'CY5010': { key: 'CY5010', name: 'CY5010', url: `${DEFAULT_SOUND_PATH_PREFIX}CY5010.wav` },
  'CY7500': { key: 'CY7500', name: 'CY7500', url: `${DEFAULT_SOUND_PATH_PREFIX}CY7500.wav` },
  'CY7525': { key: 'CY7525', name: 'CY7525', url: `${DEFAULT_SOUND_PATH_PREFIX}CY7525.wav` },
  'CY7550': { key: 'CY7550', name: 'CY7550', url: `${DEFAULT_SOUND_PATH_PREFIX}CY7550.wav` },
  'CY7575': { key: 'CY7575', name: 'CY7575', url: `${DEFAULT_SOUND_PATH_PREFIX}CY7575.wav` },
  'CY7510': { key: 'CY7510', name: 'CY7510', url: `${DEFAULT_SOUND_PATH_PREFIX}CY7510.wav` },
  'CY1000': { key: 'CY1000', name: 'CY1000', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1000.wav` },
  'CY1025': { key: 'CY1025', name: 'CY1025', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1025.wav` },
  'CY1050': { key: 'CY1050', name: 'CY1050', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1050.wav` },
  'CY1075': { key: 'CY1075', name: 'CY1075', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1075.wav` },
  'CY1010': { key: 'CY1010', name: 'CY1010', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1010.wav` },
};

export const tr808SoundsArray = Object.values(tr808SoundFilePaths);

// --- SOUND CATEGORIZATION LOGIC ---
const soundCategories = {
    'BD': 'Kicks',
    'SD': 'Snares',
    'LT': 'Toms (Low)',
    'MT': 'Toms (Mid)',
    'HT': 'Toms (High)',
    'LC': 'Congas (Low)',
    'MC': 'Congas (Mid)',
    'HC': 'Congas (High)',
    'RS': 'Rimshot',
    'CL': 'Clave',
    'CP': 'Clap',
    'MA': 'Maracas',
    'CB': 'Cowbell',
    'CH': 'Hi-Hat (Closed)',
    'OH': 'Hi-Hat (Open)',
    'CY': 'Cymbal',
};

const groupSoundsByCategory = () => {
    const grouped = {};
    Object.values(soundCategories).forEach(name => {
        grouped[name] = [];
    });

    tr808SoundsArray.forEach(sound => {
        const prefix = sound.key.substring(0, 2);
        const categoryName = soundCategories[prefix];
        if (categoryName) {
            grouped[categoryName].push(sound);
        } else if (soundCategories[sound.key]) { // Handle single-key sounds like 'RS'
            grouped[soundCategories[sound.key]].push(sound);
        }
    });
    return grouped;
};

export const categorizedTr808Sounds = groupSoundsByCategory();
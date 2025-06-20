// =================================================================================================
// SĒQsync Sound Kit Definitions
// This file contains the data structures for all available sound kits.
// =================================================================================================

const DEFAULT_SOUND_PATH_PREFIX = '/assets/sounds/fixed-sounds/tr808/';

const tr808SoundFilePaths = {
  'BD0000': { key: 'BD0000', name: 'BD0000', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0000.wav` },
  'BD0010': { key: 'BD0010', name: 'BD0010', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0010.wav` },
  'BD0025': { key: 'BD0025', name: 'BD0025', url: `${DEFAULT_SOUND_PATH_PREFIX}BD0025.wav` },
  // ... (include all other sound definitions from your file)
  'CY7575': { key: 'CY7575', name: 'CY7575', url: `${DEFAULT_SOUND_PATH_PREFIX}CY7575.wav` },
  'CY1010': { key: 'CY1010', name: 'CY1010', url: `${DEFAULT_SOUND_PATH_PREFIX}CY1010.wav` },
};

const tr808SoundsArray = Object.values(tr808SoundFilePaths);
const tr808SoundKeysOrdered = ['BD0000','BD0010','BD0025','BD0050','BD0075','BD1000','BD1010','BD1025','BD1050','BD1075','BD2500','BD2510','BD2525','BD2550','BD2575','BD5000','BD5010','BD5025','BD5050','BD5075','BD7500','BD7510','BD7525','BD7550','BD7575','SD0000','SD0010','SD0025','SD0050','SD0075','SD1000','SD1010','SD1025','SD1050','SD1075','SD2500','SD2510','SD2525','SD2550','SD2575','SD5000','SD5010','SD5025','SD5050','SD5075','SD7500','SD7510','SD7525','SD7550','SD7575','RS','CP','MA','CB','CL','CH','OH00','OH10','OH25','OH50','OH75','HT00','HT10','HT25','HT50','HT75','MT00','MT10','MT25','MT50','MT75','LT00','LT10','LT25','LT50','LT75','HC00','HC10','HC25','HC50','HC75','MC00','MC10','MC25','MC50','MC75','LC00','LC10','LC25','LC50','LC75','CY0000','CY0010','CY0025','CY0050','CY0075','CY1000','CY1010','CY1025','CY1050','CY1075','CY2500','CY2510','CY2525','CY2550','CY2575','CY5000','CY5010','CY5025','CY5050','CY5075','CY7500','CY7510','CY7525','CY7550','CY7575'];

export const SOUND_KITS = {
    'TR-808': {
        name: "TR-808",
        displayName: "TR-808 (Technopolis)",
        sounds: tr808SoundsArray,
        orderedKeys: tr808SoundKeysOrdered,
    },
    // Future kits can be added here
};
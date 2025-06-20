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
        // 1. Get the filename from the path (e.g., 'kick.wav')
        const filename = soundPath.substring(soundPath.lastIndexOf('/') + 1);

        // 2. Remove the file extension (e.g., 'kick')
        const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));

        // 3. Remove common suffixes like numbers or dashes for cleaner names
        // (e.g., 'snare-01' becomes 'snare')
        const cleanName = nameWithoutExtension.replace(/[-_]\d*$/, '').trim();

        return cleanName;
    } catch (error) {
        console.error("Error parsing sound name from path:", soundPath, error);
        return 'parse_error';
    }
};
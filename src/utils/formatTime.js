/**
 * Formats a given time in seconds into a MM:SS:ms string.
 * @param {number} seconds - The time in seconds.
 * @returns {string} The formatted time string.
 */
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(Math.floor(remainingSeconds)).padStart(2, '0');
    // CORRECTED: Calculate for 2 digits (centiseconds)
    const milliseconds = Math.floor((remainingSeconds - Math.floor(remainingSeconds)) * 100);
    // CORRECTED: Pad to 2 digits
    const paddedMilliseconds = String(milliseconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}:${paddedMilliseconds}`;
};
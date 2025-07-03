/**
 * A pure utility function to seek the WaveSurfer instance to a specific pad.
 * It has no dependencies on React contexts.
 * 
 * @param {object} params - The parameters required for seeking.
 * @param {object} params.wavesurfer - The WaveSurfer instance.
 * @param {number} params.duration - The total duration of the track in seconds.
 * @param {number} params.bpm - The current BPM.
 * @param {number} params.padIndex - The index of the pad to seek to (0-15).
 * @param {number} params.bar - The bar number to seek within.
 * @param {number[]} params.barStartTimes - An array of start times for each bar.
 * @param {number} params.noteDivision - The current note division (16, 8, 4).
 */
export const seekToPad = (params) => {
    const { wavesurfer, duration, bpm, padIndex, bar, barStartTimes, noteDivision } = params;

    if (!wavesurfer || padIndex === null || bar === null || !barStartTimes || !barStartTimes.length || bpm <= 0) {
        return;
    }

    const barStartTime = barStartTimes[bar - 1] || 0;
    const stepMultiplier = 16 / noteDivision;
    const padOffsetInSixteenths = (padIndex % noteDivision) * stepMultiplier;
    const padOffsetTime = padOffsetInSixteenths / ((bpm / 60) * 4);
    const finalTime = barStartTime + padOffsetTime;

    if (duration > 0) {
        wavesurfer.seekTo(finalTime / duration);
    }
};
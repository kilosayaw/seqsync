// src/utils/timeUtils.js
export const formatTime = (timeInSeconds) => {
  if (typeof timeInSeconds !== 'number' || isNaN(timeInSeconds) || timeInSeconds < 0) {
    return "00:00:00";
  }
  const totalCentiseconds = Math.floor(timeInSeconds * 100);
  const cs = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const cc = String(cs).padStart(2, '0');
  return `${mm}:${ss}:${cc}`;
};

export const formatTimeWithMillis = (timeInSeconds) => {
    if (typeof timeInSeconds !== 'number' || isNaN(timeInSeconds) || timeInSeconds < 0) {
      return "00:00:000";
    }
    const totalMilliseconds = Math.floor(timeInSeconds * 1000);
    const ms = totalMilliseconds % 1000;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    const mmm = String(ms).padStart(3, '0');
    return `${mm}:${ss}:${mmm}`;
};
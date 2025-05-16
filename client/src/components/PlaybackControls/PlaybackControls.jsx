// client/src/components/PlaybackControls/PlaybackControls.jsx
import React from 'react';

const PlaybackControls = ({
  bpm,
  onBpmChange,
  bar,
  beat,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onForward,
  onTapTempo,
  stepResolution, // NEW: Current step resolution (e.g., 4 for 16ths)
  onStepResolutionChange, // NEW: Callback to change resolution
}) => {
  const inputStyle = "bg-gray-700 text-lime-400 border border-gray-600 w-16 px-1 py-1 text-sm text-center rounded-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500";
  const selectStyle = `${inputStyle} w-auto`; // For dropdowns
  const buttonStyle = "px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-sm text-lg leading-none focus:outline-none focus:ring-1 focus:ring-sky-500";
  const tapButtonStyle = "px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-xs font-semibold rounded-sm focus:outline-none focus:ring-1 focus:ring-sky-500";
  const labelStyle = "text-xs text-gray-400 whitespace-nowrap";

  return (
    <div className="flex flex-wrap justify-between items-center bg-gray-800 p-2 md:p-3 rounded-md font-mono text-sm text-gray-300 gap-y-2 gap-x-3 md:gap-x-4">
      <div className="flex items-center gap-2">
        <label htmlFor="bpmInput" className={labelStyle}>BPM:</label>
        <input id="bpmInput" type="number" value={bpm} onChange={(e) => onBpmChange(parseInt(e.target.value, 10))} className={inputStyle} min="30" max="300" />
        <button onClick={onTapTempo} className={tapButtonStyle}>TAP</button>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button onClick={onRewind} className={buttonStyle} title="Previous Step">⏪</button>
        {isPlaying ? (
          <button onClick={onPause} className={`${buttonStyle} bg-red-600 hover:bg-red-500`} title="Pause">❚❚</button>
        ) : (
          <button onClick={onPlay} className={`${buttonStyle} bg-green-600 hover:bg-green-500`} title="Play">▶</button>
        )}
        <button onClick={onStop} className={buttonStyle} title="Stop">⏹️</button>
        <button onClick={onForward} className={buttonStyle} title="Next Step">⏩</button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="barInput" className={labelStyle}>BAR:</label>
        <input id="barInput" type="number" value={bar} readOnly className={`${inputStyle} w-12`} />
        <label htmlFor="beatInput" className={labelStyle}>BEAT:</label>
        <input id="beatInput" type="number" value={beat} readOnly className={`${inputStyle} w-12`} />
      </div>

      {/* Time Division Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="stepResolution" className={labelStyle}>Step Div:</label>
        <select
          id="stepResolution"
          value={stepResolution}
          onChange={(e) => onStepResolutionChange(Number(e.target.value))}
          className={selectStyle}
        >
          <option value={1}>1/4</option>
          <option value={2}>1/8</option>
          <option value={4}>1/16</option>
          <option value={8}>1/32</option> {/* Added 1/32 for more granularity */}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button className={buttonStyle} title="Settings">⚙️</button>
        <button className={buttonStyle} title="User/IP">👤</button>
      </div>
    </div>
  );
};

export default PlaybackControls;
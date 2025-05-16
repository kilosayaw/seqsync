// client/src/components/NotationBuilder/NotationTimelineControls.jsx
import React, { useMemo } from 'react'; // Removed useState, useEffect if props drive it

const NotationTimelineControls = ({
  bpm,
  onBpmChange, // Callback to parent to change BPM
  timeSignature, // e.g., 4 (for 4/4)
  onTimeSignatureChange, // Callback to parent
  currentGlobalSixteenth, // Current step in 16th notes (0-indexed, managed by parent)
  isPlaying, // To potentially stop internal calculations if not needed
}) => {
  const subdivision = 4; // 16th notes per beat in 4/4

  // Calculate bar, beat, sub-beat based on props
  const { bar, beat, subbeat } = useMemo(() => {
    if (typeof currentGlobalSixteenth !== 'number' || currentGlobalSixteenth < 0 || !bpm || !timeSignature) {
      return { bar: 1, beat: 1, subbeat: 1 };
    }
    const totalSixteenthsInBar = timeSignature * subdivision;
    const currentBar = Math.floor(currentGlobalSixteenth / totalSixteenthsInBar) + 1;
    const sixteenthsIntoCurrentBar = currentGlobalSixteenth % totalSixteenthsInBar;
    const currentBeat = Math.floor(sixteenthsIntoCurrentBar / subdivision) + 1;
    const currentSubBeat = (sixteenthsIntoCurrentBar % subdivision) + 1;

    return { bar: currentBar, beat: currentBeat, subbeat: currentSubBeat };
  }, [currentGlobalSixteenth, bpm, timeSignature, subdivision]);

  const inputStyle = "px-2 py-1 bg-gray-700 text-lime-400 border border-gray-600 rounded-sm text-sm w-20 focus:ring-1 focus:ring-sky-500 focus:border-sky-500";
  const labelStyle = "text-sm font-medium text-gray-300 whitespace-nowrap";

  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-md shadow space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="bpmCtrl" className={labelStyle}>BPM:</label>
          <input
            id="bpmCtrl"
            type="number"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className={inputStyle}
            min="30"
            max="300"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="timeSigCtrl" className={labelStyle}>Time Sig:</label>
          <select
            id="timeSigCtrl"
            value={timeSignature}
            onChange={(e) => onTimeSignatureChange(Number(e.target.value))}
            className={inputStyle}
          >
            {[2, 3, 4, 5, 6, 7].map((num) => ( // Common time signatures
              <option key={num} value={num}>{num}/4</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-1 text-sm font-mono text-gray-200">
        ⏱ Bar: <strong className="text-yellow-400">{bar}</strong> | Beat: <strong className="text-yellow-400">{beat}</strong> | Sub: <strong className="text-yellow-400">{subbeat}</strong>
      </div>
    </div>
  );
};

export default NotationTimelineControls;
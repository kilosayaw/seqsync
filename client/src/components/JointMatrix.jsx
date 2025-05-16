// src/components/JointMatrix.jsx
import React from 'react';

const joints = ['LS', 'RS', 'LE', 'RE', 'LW', 'RW', 'LH', 'RH', 'LK', 'RK', 'LA', 'RA'];

const JointMatrix = ({ setBeatData, activeBeat, beatData }) => {
  const updateCurrentBeat = (newData) => {
    const updatedBeat = {
      ...beatData[activeBeat],
      ...newData,
    };

    const updatedBeatData = [...beatData];
    updatedBeatData[activeBeat] = updatedBeat;
    setBeatData(updatedBeatData);
  };

  const handleClick = (joint) => {
    updateCurrentBeat({ joint });
  };

  return (
    <div className="grid grid-cols-3 gap-2 items-center justify-center">
      {joints.map(j => (
        <button
          key={j}
          onClick={() => handleClick(j)}
          className="bg-gray-700 hover:bg-gray-500 transition p-2 rounded text-white font-bold"
        >
          {j}
        </button>
      ))}
    </div>
  );
};

export default JointMatrix;

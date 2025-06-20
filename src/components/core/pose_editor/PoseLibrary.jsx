import React from 'react';
import PropTypes from 'prop-types';
import SkeletalPoseVisualizer2D from './SkeletalPoseVisualizer2D';

const PoseLibrary = ({ library, onLoadPose, onDeletePose }) => {
  return (
    <div className="p-2 bg-gray-900/50 rounded-lg">
      <h4 className="text-sm font-bold text-gray-300 mb-2">Pose Library</h4>
      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
        {library.map((pose, index) => (
          <div 
            key={index}
            onClick={() => onLoadPose(pose)}
            className="relative p-1 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 aspect-square"
            title={`Load Pose: ${pose.name}`}
          >
            <SkeletalPoseVisualizer2D jointInfoData={pose.jointInfo} />
            <span className="absolute bottom-1 left-1 text-xxs text-white bg-black/50 px-1 rounded">{pose.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeletePose(index); }}
              className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-xs rounded-full leading-none hover:bg-red-500"
            >×</button>
          </div>
        ))}
        {library.length === 0 && <p className="col-span-3 text-xs text-center text-gray-500 py-4">No poses saved.</p>}
      </div>
    </div>
  );
};

PoseLibrary.propTypes = {
  library: PropTypes.array.isRequired,
  onLoadPose: PropTypes.func.isRequired,
  onDeletePose: PropTypes.func.isRequired,
};

export default PoseLibrary;
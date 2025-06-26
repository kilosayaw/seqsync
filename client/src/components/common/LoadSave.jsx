import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import FileUploader from '../core/media/FileUploader';

const LoadSave = ({
  onSave,
  onLoad,
  onFileSelected,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <Button onClick={onSave} variant="secondary" size="sm">
        Save
      </Button>

      <FileUploader
        onFileSelect={onLoad}
        labelText="Load"
        accept=".seq,.json,.poseqr"
        buttonClassName="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      />

      {/* --- DEFINITIVE FIX: Added showFileName={false} to hide the text --- */}
      <FileUploader
        onFileSelect={onFileSelected}
        labelText="Media"
        accept="audio/*,video/*"
        showFileName={false} 
        buttonClassName="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      />
    </div>
  );
};

LoadSave.propTypes = {
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func.isRequired,
};

export default LoadSave;
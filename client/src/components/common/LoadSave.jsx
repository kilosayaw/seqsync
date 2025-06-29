import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faSave, faFilm } from '@fortawesome/free-solid-svg-icons';

const LoadSave = ({ onSave, onLoad, onFileSelected, currentFilename, onFilenameChange }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        onFileSelected(file); // Use the generic handler for media
      } else if (file.type === 'application/json') {
        onLoad(file); // Use the specific handler for sequences
      } else {
        alert('Unsupported file type.');
      }
    }
    // Reset file input to allow loading the same file again
    event.target.value = null; 
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="application/json,video/*,audio/*"
      />
      <Button onClick={triggerFileSelect} variant="secondary" size="sm" iconLeft={<FontAwesomeIcon icon={faFolderOpen} />}>
        Load
      </Button>
      <Button onClick={onSave} variant="secondary" size="sm" iconLeft={<FontAwesomeIcon icon={faSave} />}>
        Save
      </Button>
    </div>
  );
};

LoadSave.propTypes = {
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func.isRequired,
  currentFilename: PropTypes.string,
  onFilenameChange: PropTypes.func,
};

export default LoadSave;
// [UPGRADED] src/components/common/LoadSave.jsx

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faSave, faFilm } from '@fortawesome/free-solid-svg-icons';

const LoadSave = ({ onSave, onLoad, onFileSelected }) => {
  // We now have two separate file inputs for clarity
  const sequenceInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const handleSequenceFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      onLoad(file); // Call the specific onLoad handler for .json files
    } else if (file) {
      alert('Invalid file type. Please select a .json sequence file.');
    }
    // Reset file input to allow loading the same file again
    if(event.target) event.target.value = null; 
  };

  const handleMediaFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      onFileSelected(file); // Call the specific onFileSelected handler for media
    } else if (file) {
      alert('Invalid file type. Please select a video or audio file.');
    }
    if(event.target) event.target.value = null;
  };

  // Trigger functions for each button
  const triggerSequenceSelect = () => sequenceInputRef.current?.click();
  const triggerMediaSelect = () => mediaInputRef.current?.click();

  return (
    <div className="flex items-center gap-2">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={sequenceInputRef}
        className="hidden"
        onChange={handleSequenceFileChange}
        accept="application/json,.seq" // Accept .json and a future .seq extension
      />
      <input
        type="file"
        ref={mediaInputRef}
        className="hidden"
        onChange={handleMediaFileChange}
        accept="video/*,audio/*,.mp4,.mov,.mp3"
      />

      {/* Visible Buttons */}
      <div className="flex items-center bg-gray-700/50 rounded-md">
        <Button 
          onClick={triggerSequenceSelect} 
          variant="secondary" 
          size="sm" 
          className="!rounded-r-none !border-r-0"
          iconLeft={<FontAwesomeIcon icon={faFolderOpen} />}
          title="Load Sequence (.json)"
        >
          Load Seq
        </Button>
        <div className="w-px h-5 bg-gray-600"></div>
        <Button 
          onClick={triggerMediaSelect} 
          variant="secondary" 
          size="sm" 
          className="!rounded-l-none"
          iconLeft={<FontAwesomeIcon icon={faFilm} />}
          title="Load Media (Video/Audio)"
        >
          Load Media
        </Button>
      </div>
      
      <Button 
        onClick={onSave} 
        variant="primary" // Changed to primary for emphasis
        size="sm" 
        iconLeft={<FontAwesomeIcon icon={faSave} />}
        title="Save Sequence"
      >
        Save
      </Button>
    </div>
  );
};

LoadSave.propTypes = {
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func.isRequired,
  // currentFilename and onFilenameChange are removed as they are better managed in the parent component
};

export default LoadSave;
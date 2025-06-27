// [UPGRADED] src/components/common/LoadSave.jsx

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { faFolderOpen, faSave, faFilm } from '@fortawesome/free-solid-svg-icons';

const LoadSave = ({ onSave, onLoad, onFileSelected }) => {
  const sequenceInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const handleSequenceFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      onLoad(file);
    } else if (file) {
      toast.error('Invalid file type. Please select a .json sequence file.');
    }
    if(event.target) event.target.value = null; 
  };

  const handleMediaFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      onFileSelected(file);
    } else if (file) {
      toast.error('Invalid file type. Please select a video or audio file.');
    }
    if(event.target) event.target.value = null;
  };

  return (
    <div className="flex items-center gap-2">
      <input type="file" ref={sequenceInputRef} className="hidden" onChange={handleSequenceFileChange} accept=".json,.seq" />
      <input type="file" ref={mediaInputRef} className="hidden" onChange={handleMediaFileChange} accept="video/*,audio/*" />

      <div className="flex items-center bg-gray-700/50 rounded-md">
        <Button onClick={() => sequenceInputRef.current?.click()} variant="secondary" size="sm" className="!rounded-r-none !border-r-0" iconLeft={faFolderOpen} title="Load Sequence (.json)">Load Seq</Button>
        <div className="w-px h-5 bg-gray-600"></div>
        <Button onClick={() => mediaInputRef.current?.click()} variant="secondary" size="sm" className="!rounded-l-none" iconLeft={faFilm} title="Load Media (Video/Audio)">Load Media</Button>
      </div>
      
      <Button onClick={onSave} variant="primary" size="sm" iconLeft={faSave} title="Save Sequence">Save</Button>
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
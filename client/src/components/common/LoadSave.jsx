import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { faFolderOpen, faSave, faFilm, faVideo } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const LoadSave = ({ onSave, onLoad, onFileSelected, onActivateCamera }) => {
  const sequenceInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const handleSequenceFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.seq'))) {
      onLoad(file);
    } else if (file) {
      toast.error('Invalid file type. Please select a .json or .seq file.');
    }
    if (event.target) event.target.value = null; 
  };

  const handleMediaFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      onFileSelected(file);
    } else if (file) {
      toast.error('Invalid file type. Please select a video or audio file.');
    }
    if (event.target) event.target.value = null;
  };

  return (
    <div className="flex items-center gap-2">
      <input type="file" ref={sequenceInputRef} className="hidden" onChange={handleSequenceFileChange} accept=".json,.seq" />
      <input type="file" ref={mediaInputRef} className="hidden" onChange={handleMediaFileChange} accept="video/*,audio/*" />
      
      <Button onClick={() => sequenceInputRef.current?.click()} variant="secondary" size="sm" iconLeft={faFolderOpen} title="Load Sequence (.seq)">Load Seq</Button>
      {/* Task 3.1: Add button for Live Camera */}
      <Button onClick={() => mediaInputRef.current?.click()} variant="secondary" size="sm" iconLeft={faFilm} title="Load Media File">Load Media</Button>
      <Button onClick={onActivateCamera} variant="secondary" size="sm" iconLeft={faVideo} title="Activate Live Camera">Live Cam</Button>
      <Button onClick={onSave} variant="primary" size="sm" iconLeft={faSave} title="Save Sequence">Save</Button>
    </div>
  );
};

LoadSave.propTypes = {
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func.isRequired,
  onActivateCamera: PropTypes.func.isRequired,
};

export default LoadSave;
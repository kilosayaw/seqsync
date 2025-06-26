// src/components/common/LoadSave.jsx
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faFolderOpen,
  faFileCirclePlus,
  faFileCode
} from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import Input from './Input';
import Tooltip from './Tooltip';

const LoadSave = ({
  currentFilename,
  onFilenameChange,
  onSave,
  onLoad,
  onNewSequence,
  className = "",
  buttonClassName = "",
  inputClassName = "h-9 sm:h-10 !text-xs !py-1 !px-2"
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelectedForLoad = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(new Error(`Error reading file: ${error.message || error}`));
        reader.readAsText(file);
      });
      const data = JSON.parse(fileContent);

      const loadedFilenameFromFile = data.title || file.name;
      const baseFilename = String(loadedFilenameFromFile).replace(/\.(seqr|json|jsonc)$/i, '').trim();

      if (typeof onFilenameChange === 'function') {
        onFilenameChange(baseFilename || "untitled_loaded_sequence");
      }
      onLoad(data);
    } catch (err) {
      console.error('Error loading or parsing .seqr file:', err);
      alert(`Invalid sequence file: ${err.message}. Please ensure it's a valid .SĒQ (JSON) file.`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveAs = () => {
    const newName = window.prompt(
      "Enter new filename for 'Save As' (without .seqr extension):",
      currentFilename || "my_new_sequence"
    );
    if (newName && newName.trim() !== "") {
      if (typeof onFilenameChange === 'function') {
        onFilenameChange(newName.trim());
      }
      setTimeout(() => {
        if (typeof onSave === 'function') {
            onSave();
        }
      }, 50);
    } else if (newName !== null) {
        alert("Filename cannot be empty for 'Save As'.");
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 sm:gap-1.5 ${className}`}>
      <Tooltip content="New Sequence (Ctrl+Shift+N)" placement="bottom">
        <Button
          onClick={onNewSequence}
          variant="dangerOutline"
          size="sm"
          iconLeft={faFileCirclePlus}
          className={`${buttonClassName} h-9 sm:h-10 !px-2`}
          aria-label="Start a new sequence and clear current data"
        >
          <span className="hidden sm:inline">New</span>
        </Button>
      </Tooltip>

      <Tooltip content="Load Sequence (.seqr file)" placement="bottom">
        <Button
          onClick={triggerFileInput}
          variant="secondary"
          size="sm"
          iconLeft={faFolderOpen}
          className={`${buttonClassName} h-9 sm:h-10 !px-2`}
          aria-label="Load sequence from file"
        >
          <span className="hidden sm:inline">Load</span>
        </Button>
      </Tooltip>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelectedForLoad}
        className="hidden"
        accept=".seqr,application/json"
        aria-hidden="true"
      />

      <div className="flex-grow min-w-[100px] sm:min-w-[120px] max-w-[180px] sm:max-w-[200px]">
        <Input
          id="sequenceFilename"
          type="text"
          value={currentFilename}
          onChange={(e) => onFilenameChange(e.target.value)}
          placeholder="Sequence Name"
          inputClassName={`${inputClassName} !bg-gray-700/60 !border-gray-600/80 focus:!border-brand-accent placeholder:text-gray-500`}
          title="Current sequence filename (without .seqr extension)"
          aria-label="Sequence filename"
        />
      </div>
      
      <Tooltip content="Save Current Sequence (Ctrl+S)" placement="bottom">
        <Button
          onClick={onSave}
          variant="primary"
          size="sm"
          iconLeft={faSave}
          className={`${buttonClassName} h-9 sm:h-10 !px-2 !bg-green-600 hover:!bg-green-500 focus:!ring-green-500`}
          aria-label="Save current sequence with the displayed filename"
        >
           <span className="hidden sm:inline">Save</span>
        </Button>
      </Tooltip>

       <Tooltip content="Save As New Filename" placement="bottom">
        <Button
          onClick={handleSaveAs}
          variant="secondary"
          size="sm"
          iconLeft={faFileCode}
          className={`${buttonClassName} h-9 sm:h-10 !px-2`}
          aria-label="Save current sequence with a new filename"
        >
          <span className="hidden lg:inline">As...</span>
          <span className="lg:hidden">SaveAs</span>
        </Button>
      </Tooltip>
    </div>
  );
};

LoadSave.propTypes = {
  currentFilename: PropTypes.string.isRequired,
  onFilenameChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onNewSequence: PropTypes.func.isRequired,
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  inputClassName: PropTypes.string,
};

export default LoadSave;
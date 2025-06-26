// Enhanced FileUploader.jsx (modular, mobile-aware, consistent)
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const FileUploader = ({
  onFileSelect,
  labelText = "Media",
  accept = "audio/*,video/*,.json",
  showFileName = true,
  inputId,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file || null);
    onFileSelect(file || null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const effectiveInputId = inputId || `file-upload-${React.useId()}`;

  return (
    <div className="flex flex-col items-center" title={selectedFile ? `Selected: ${selectedFile.name}` : `Upload ${labelText}`}> 
      <button
        type="button"
        onClick={handleClick}
        className="h-9 sm:h-10 flex items-center justify-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all bg-gray-700 hover:bg-gray-600 text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-accent"
        aria-label={`Upload ${labelText}`}
      >
        <FontAwesomeIcon icon={faUpload} className="text-sm sm:text-base" />
        <span className="hidden sm:inline ml-1">{labelText}</span>
        <span className="sm:hidden">{labelText.substring(0,3)}</span>
      </button>
      <input
        type="file"
        id={effectiveInputId}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />
      {showFileName && selectedFile && (
        <span className="mt-1 text-[0.65rem] sm:text-xs text-gray-400/80 truncate max-w-[100px] sm:max-w-[120px] text-center" title={selectedFile.name}>
          {selectedFile.name}
        </span>
      )}
    </div>
  );
};

FileUploader.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  labelText: PropTypes.string,
  accept: PropTypes.string,
  showFileName: PropTypes.bool,
  inputId: PropTypes.string,
};

export default FileUploader;

// src/components/core/media/FileUploader.jsx
// (Assuming this is the correct path based on your previous list)

import React, { useRef, useMemo, useState } from 'react'; // Removed useEffect, useCallback if not strictly needed for this version
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
// import { toast } from 'react-toastify'; // Optional: if you want to show toasts from here, or let parent handle

const FileUploader = ({
  onFileSelect, // Required: (file: File | null) => void
  labelText = "Media",
  accept = "audio/*,video/*,.json,.seq,.poseqr", // Added .poseqr as another common extension
  showFileName = true,
  inputId, // Optional: for specific ID, else one is generated
  captureMode = undefined, // Optional: 'user' (front camera), 'environment' (back camera), or undefined
  buttonClassName = "h-9 sm:h-10 flex items-center justify-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all bg-gray-700 hover:bg-gray-600 text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-accent", // Default button style from your example
  containerClassName = "flex flex-col items-center",
  fileNameClassName = "mt-1 text-[0.65rem] sm:text-xs text-gray-400/80 truncate max-w-[100px] sm:max-w-[120px] text-center",
  // logToConsole, // Optional: if you want to pass a logger
}) => {
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState(null);

  // Generate a unique ID for the input if one isn't provided, for accessibility (aria-labelledby by button)
  // React 18+ has useId(), but for broader compatibility, a simpler approach:
  const effectiveInputId = useMemo(() => inputId || `file-upload-${Math.random().toString(36).slice(2, 11)}`, [inputId]);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    // logToConsole?.('debug', `[FileUploader-${labelText}] File input changed. File:`, file?.name);

    if (file) {
      setSelectedFileName(file.name);
      onFileSelect(file); // Pass the full File object to the parent
      // toast.info(`Selected: ${file.name}`, { autoClose: 2000 }); // Optional: direct feedback
    } else {
      setSelectedFileName(null);
      onFileSelect(null); // Notify parent that selection was cleared or no file chosen
    }

    // Reset the input's value. This allows selecting the same file again if the user
    // cancels and then re-selects, which would otherwise not fire the onChange event.
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleClick = () => {
    // logToConsole?.('debug', `[FileUploader-${labelText}] Button clicked, triggering native file input.`);
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Programmatically click the hidden file input
    }
  };

  return (
    <div className={containerClassName} title={selectedFileName ? `Selected file: ${selectedFileName}` : `Upload ${labelText}`}>
      <button
        type="button"
        onClick={handleClick}
        className={buttonClassName}
        aria-label={`Upload ${labelText}`}
        aria-controls={effectiveInputId} // For accessibility, links button to input
      >
        <FontAwesomeIcon icon={faUpload} className="text-sm sm:text-base" />
        <span className="hidden sm:inline ml-1">{labelText}</span>
        <span className="sm:hidden">{labelText.substring(0, 3)}</span> {/* Shorter label for very small screens */}
      </button>
      <input
        type="file"
        id={effectiveInputId}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" // Visually hide the actual file input
        accept={accept}
        capture={captureMode} // 'user' or 'environment' to hint at camera use on mobile
      />
      {showFileName && selectedFileName && (
        <span className={fileNameClassName} title={selectedFileName}>
          {selectedFileName}
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
  captureMode: PropTypes.oneOf(['user', 'environment', undefined]),
  buttonClassName: PropTypes.string,
  containerClassName: PropTypes.string,
  fileNameClassName: PropTypes.string,
  // logToConsole: PropTypes.func,
};

export default React.memo(FileUploader);
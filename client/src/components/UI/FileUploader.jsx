import React from 'react';

const FileUploader = ({ onFileSelect }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelect(file);
    }
  };

  return (
    <div className="text-center">
      <label className="block mb-2 font-bold">🎵 Upload MP3</label>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="bg-white text-black rounded p-1"
      />
    </div>
  );
};

export default FileUploader;

// src/pages/SequenceUploadPage.jsx
// (Content as provided in the previous "FRESH & COMPLETE - Batch 5 of 8" for Auth Components)
// This file should already be complete from that batch.
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sequenceService from '../services/sequenceService'; 
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faCheckCircle, faTimesCircle, faFileLines, faMusic, faVideo, faSignature, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const SequenceUploadPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seqFile, setSeqFile] = useState(null); 
  const [originalMediaAudioUrl, setOriginalMediaAudioUrl] = useState('');
  const [originalMediaVideoUrl, setOriginalMediaVideoUrl] = useState('');
  const [tempo, setTempo] = useState('');
  const [timeSignature, setTimeSignature] = useState('');
  const [poseqrNotationPreview, setPoseqrNotationPreview] = useState(''); 
  const [metadataCustom, setMetadataCustom] = useState(''); 
  const [royaltySplitInfo, setRoyaltySplitInfo] = useState(''); 
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null); // Page-level error for critical issues
  // Success messages are handled by toast now

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.type === "application/json" || file.name.toLowerCase().endsWith('.seqr')) {
            setSeqFile(file);
            setError(null); 
            // Optional: auto-fill title from file name
            if (!title) {
                setTitle(file.name.replace(/\.(seqr|json|jsonc)$/i, '').replace(/_/g, ' ').trim());
            }
        } else {
            setError('Invalid file type. Please upload a .SĒQ or .json file.');
            toast.error('Invalid file type. Please upload a .SĒQ or .json file.');
            setSeqFile(null);
            if(fileInputRef.current) fileInputRef.current.value = ""; 
        }
    } else {
        setSeqFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!seqFile) { setError('Please select a .SĒQ file to upload.'); toast.error('Please select a .SĒQ file.'); return; }
    if (!title.trim()) { setError('Please provide a title for your sequence.'); toast.error('Title is required.'); return; }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('seqFile', seqFile); 
    formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (originalMediaAudioUrl.trim()) formData.append('original_media_audio_url', originalMediaAudioUrl.trim());
    if (originalMediaVideoUrl.trim()) formData.append('original_media_video_url', originalMediaVideoUrl.trim());
    if (tempo.trim()) formData.append('tempo', tempo.trim());
    if (timeSignature.trim()) formData.append('time_signature', timeSignature.trim());
    if (poseqrNotationPreview.trim()) formData.append('poseqr_notation_preview', poseqrNotationPreview.trim());
    if (metadataCustom.trim()) formData.append('metadata_custom', metadataCustom.trim());
    if (royaltySplitInfo.trim()) formData.append('royalty_split_info', royaltySplitInfo.trim());

    try {
      const response = await sequenceService.uploadSequence(formData); 
      // Success toast is handled by the service
      // Reset form fields
      setTitle(''); setDescription(''); setSeqFile(null); 
      setOriginalMediaAudioUrl(''); setOriginalMediaVideoUrl('');
      setTempo(''); setTimeSignature('');
      setPoseqrNotationPreview(''); setMetadataCustom(''); setRoyaltySplitInfo('');
      if (fileInputRef.current) fileInputRef.current.value = null;
      
      // Optionally navigate after a brief delay to let user see success
      setTimeout(() => {
        if (response && response.id) {
            navigate(`/dashboard/sequence/${response.id}`); 
        } else {
            navigate('/dashboard'); // Fallback
        }
      }, 1500);
    } catch (err) {
      // Error toast is handled by the service
      setError(err.message || 'Upload failed. Please try again.'); // Set local error for display if needed
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-gray-800 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-orbitron text-brand-accent mb-6 sm:mb-8 text-center">
        <FontAwesomeIcon icon={faUpload} className="mr-3" />
        Upload New SĒQ Sequence
      </h1>
      
      {error && !toast.isActive('uploadError') && ( // Display local error if no toast is active with this ID
        <div className="mb-4 p-3 bg-red-800/30 text-red-300 border border-red-700/50 rounded-lg text-sm flex items-center shadow-md" role="alert">
            <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-lg" />
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="seqFile" className="label-text mb-1">.SĒQ File (JSON format)*</label>
          <input
            id="seqFile" type="file" ref={fileInputRef} onChange={handleFileChange}
            accept=".seqr,application/json" 
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-gray-900 hover:file:bg-opacity-80 file:cursor-pointer mt-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
            required disabled={isUploading}
          />
          {seqFile && <p className="mt-1.5 text-xs text-gray-400">Selected: {seqFile.name} ({ (seqFile.size / 1024).toFixed(2) } KB)</p>}
        </div>

        <Input
          label="Title*" id="title" type="text" value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., My Rhythmic Masterpiece" required
          disabled={isUploading} iconLeft={<FontAwesomeIcon icon={faSignature} className="text-gray-400"/>}
        />
        <Input
          label="Description" id="description" type="textarea" value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief summary of the movement sequence, its style, or purpose..."
          inputClassName="min-h-[70px]" disabled={isUploading}
          iconLeft={<FontAwesomeIcon icon={faFileLines} className="text-gray-400 mt-2.5 self-start"/>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Tempo (BPM)" id="tempo" type="number" value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            placeholder="e.g., 120" disabled={isUploading}
            iconLeft={<FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>}
          />
          <Input
            label="Time Signature" id="timeSignature" type="text" value={timeSignature}
            onChange={(e) => setTimeSignature(e.target.value)}
            placeholder="e.g., 4/4" disabled={isUploading}
            iconLeft={<FontAwesomeIcon icon={faMusic} className="text-gray-400"/>}
          />
        </div>
         <Input
          label="Original Audio URL (Optional)" id="audioUrl" type="url" value={originalMediaAudioUrl}
          onChange={(e) => setOriginalMediaAudioUrl(e.target.value)}
          placeholder="https://example.com/audio.mp3" disabled={isUploading}
          iconLeft={<FontAwesomeIcon icon={faMusic} className="text-gray-400"/>}
        />
        <Input
          label="Original Video URL (Optional)" id="videoUrl" type="url" value={originalMediaVideoUrl}
          onChange={(e) => setOriginalMediaVideoUrl(e.target.value)}
          placeholder="https://example.com/video.mp4" disabled={isUploading}
          iconLeft={<FontAwesomeIcon icon={faVideo} className="text-gray-400"/>}
        />
        
        <div className="pt-3">
          <Button 
            type="submit" className="w-full flex justify-center items-center" variant="primary" 
            disabled={isUploading || !seqFile || !title.trim()}
            iconLeft={isUploading ? faSpinner : faUpload}
            iconProps={isUploading ? {spin: true, className:"mr-2"} : {className:"mr-2"}}
          >
            {isUploading ? 'Uploading Sequence...' : 'Upload Sequence'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SequenceUploadPage;
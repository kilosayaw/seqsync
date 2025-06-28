// src/components/dashboard/SequenceUploadPage.jsx
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth'; // If needed for user context
import sequenceService from '../../services/sequenceService'; // API calls
import Input from '../common/Input';
import Button from '../common/Button';

const SequenceUploadPage = () => {
  // const { token } = useAuth(); // Get token for authenticated API calls
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seqFile, setSeqFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tempo, setTempo] = useState('');
  const [timeSignature, setTimeSignature] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setSeqFile(e.target.files[0]);
    setError(null); // Clear previous errors on new file selection
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!seqFile) {
      setError('Please select a .SĒQ file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for your sequence.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('seqFile', seqFile);
    formData.append('title', title);
    formData.append('description', description);
    if (audioUrl) formData.append('original_media_audio_url', audioUrl);
    if (videoUrl) formData.append('original_media_video_url', videoUrl);
    if (tempo) formData.append('tempo', tempo);
    if (timeSignature) formData.append('time_signature', timeSignature);
    // Add other metadata fields as needed (poseqr_notation_preview, metadata_custom, royalty_split_info)
    // These might be stringified JSON if they are complex objects
    // formData.append('poseqr_notation_preview', JSON.stringify({ snippet: "LS IN..." }));
    // formData.append('metadata_custom', JSON.stringify({ customKey: "customValue" }));
    // formData.append('royalty_split_info', JSON.stringify({ choreo: 100 }));


    try {
      // Replace with actual token logic when authService is fully implemented
      const mockToken = localStorage.getItem('seqsync_token') || 'dummy_token_for_upload';
      if (!mockToken) {
        setError('Authentication error. Please log in.');
        setIsUploading(false);
        return;
      }

      const response = await sequenceService.uploadSequence(formData, mockToken);
      setSuccessMessage(`Sequence "${response.title}" uploaded successfully! ID: ${response.id}`);
      // Optionally reset form or navigate
      setTitle(''); setDescription(''); setSeqFile(null); setAudioUrl(''); setVideoUrl('');
      setTempo(''); setTimeSignature('');
      if (fileInputRef.current) fileInputRef.current.value = null;
      // setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-gray-800 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-orbitron text-brand-accent mb-6 sm:mb-8 text-center">Upload New SĒQ Sequence</h1>
      
      {error && <p className="mb-4 p-3 bg-red-700/30 text-red-300 border border-red-600 rounded-md text-sm">{error}</p>}
      {successMessage && <p className="mb-4 p-3 bg-green-700/30 text-green-300 border border-green-600 rounded-md text-sm">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title*"
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., My Awesome Dance Routine"
          required
        />
        <div>
          <label htmlFor="seqFile" className="label-text">.SĒQ File (JSON format)*</label>
          <input
            id="seqFile"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".seqr,application/json" // Primarily expect .seqr (which is JSON)
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/20 file:text-brand-accent hover:file:bg-brand-accent/30 file:cursor-pointer mt-1"
            required
          />
          {seqFile && <p className="mt-1 text-xs text-gray-500">Selected: {seqFile.name}</p>}
        </div>
        <Input
          label="Description"
          id="description"
          type="textarea" // Assuming your Input component handles textarea or use a dedicated Textarea component
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief summary of the movement sequence..."
          inputClassName="min-h-[80px]" // For textarea
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Tempo (BPM)"
            id="tempo"
            type="number"
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            placeholder="e.g., 120"
          />
          <Input
            label="Time Signature"
            id="timeSignature"
            type="text"
            value={timeSignature}
            onChange={(e) => setTimeSignature(e.target.value)}
            placeholder="e.g., 4/4"
          />
        </div>
         <Input
          label="Original Audio URL (Optional)"
          id="audioUrl"
          type="url"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="https://example.com/audio.mp3"
        />
        <Input
          label="Original Video URL (Optional)"
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://example.com/video.mp4"
        />
        <div className="pt-2">
          <Button type="submit" className="w-full" variant="primary" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Sequence'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SequenceUploadPage;
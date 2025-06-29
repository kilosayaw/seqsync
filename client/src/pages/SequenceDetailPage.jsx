// SEGSYNC/client/src/pages/SequenceDetailPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import sequenceService from '../services/sequenceService'; // Assuming this path is correct
// import { useAuth } from '../hooks/useAuth'; // Token is handled by apiClient interceptor
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faEdit, faDownload, faExclamationTriangle, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/common/Button';
import Tooltip from '../components/common/Tooltip'; // Assuming you have a Tooltip component

// Placeholder for a potential SĒQ Player component - uncomment and implement later
// import SeqPlayer from '../components/core/media/SeqPlayer';

const SequenceDetailPage = () => {
  const { id: sequenceIdParam } = useParams(); // sequenceIdParam is a string from URL
  // const { token } = useAuth(); // Token is now implicitly handled by apiClient
  const navigate = useNavigate();

  const [sequence, setSequence] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSequence = useCallback(async () => {
    if (!sequenceIdParam) {
      setError("Sequence ID is missing from the URL.");
      setIsLoading(false);
      return;
    }
    // No explicit token check here; apiClient interceptor handles it.
    // If token is missing/invalid, sequenceService call will likely fail with 401,
    // which the apiClient response interceptor can handle (e.g., by redirecting to login).

    setIsLoading(true);
    setError(null);
    try {
      // sequenceService.getSequenceById expects the ID.
      // It should return the sequence data object directly or within a data property.
      // Let's assume it returns { status: 'success', data: { sequence: {...} } }
      const response = await sequenceService.getSequenceById(sequenceIdParam);
      if (response && response.data && response.data.sequence) {
        setSequence(response.data.sequence);
      } else {
        // This case might indicate a valid response but no sequence data (e.g., 200 OK but empty)
        // Or if the service returns the sequence directly:
        // setSequence(response); // If service returns sequence object directly
        console.warn("Fetched sequence data is not in the expected format or sequence is null:", response);
        setError(`Sequence with ID ${sequenceIdParam} not found or data is incomplete.`);
        setSequence(null);
      }
    } catch (err) {
      console.error(`Fetch sequence detail error (ID: ${sequenceIdParam}):`, err);
      const errorMessage = err.message || `Failed to fetch sequence details for ID: ${sequenceIdParam}.`;
      setError(errorMessage);
      if (err.response?.status === 404) {
        setError(`Sequence with ID ${sequenceIdParam} not found.`);
      } else if (err.response?.status === 401) {
        setError("You are not authorized to view this sequence. Please log in.");
        // Optionally, navigate to login: navigate('/login', { state: { from: location } });
      }
    } finally {
      setIsLoading(false);
    }
  }, [sequenceIdParam, navigate]); // Added navigate

  useEffect(() => {
    fetchSequence();
  }, [fetchSequence]);

  const handleDownloadSeqFile = () => {
    if (sequence?.seq_file_path) {
      // This logic assumes seq_file_path is a relative path served by your backend,
      // OR a full public URL from Supabase Storage.
      // If it's a relative path like 'uploads/seqr/user_id/file.seqr' and your backend
      // serves static files from 'uploads', this might work.
      // If it's just the path within a Supabase bucket, you need the full public URL.

      let downloadUrl = sequence.seq_file_path;

      // Heuristic: If it doesn't look like a full URL, prepend backend domain
      if (!sequence.seq_file_path.startsWith('http://') && !sequence.seq_file_path.startsWith('https://')) {
        const backendDomain = (import.meta.env.VITE_API_BASE_URL ?
                                new URL(import.meta.env.VITE_API_BASE_URL).origin :
                                'http://localhost:5001'); // Default if VITE_API_BASE_URL is not set
        let relativePath = sequence.seq_file_path;
        if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
        downloadUrl = `${backendDomain}/${relativePath}`;
        console.log("[Download] Constructed URL from relative path:", downloadUrl);
      } else {
        console.log("[Download] Using provided full URL:", downloadUrl);
      }
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = sequence.title ? `${sequence.title.replace(/\s+/g, '_')}.seqr` : `sequence_${sequence.id}.seqr`;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank'); // Good for direct Supabase URLs to open in new tab if browser blocks download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Attempting to download:", downloadUrl);
    } else {
      alert("Sequence file path not available for download.");
    }
  };

  const metadataDisplay = (obj, defaultText = "N/A") => {
    if (obj === null || obj === undefined || (typeof obj === 'object' && Object.keys(obj).length === 0)) {
      return <span className="text-gray-500 italic">{defaultText}</span>;
    }
    try {
      const jsonString = (typeof obj === 'string' && (obj.startsWith('{') || obj.startsWith('['))) 
                          ? JSON.stringify(JSON.parse(obj), null, 2) // Re-format if already a JSON string
                          : JSON.stringify(obj, null, 2);
      return <pre className="text-xs bg-gray-900/50 p-3 rounded overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/70 max-h-60"><code>{jsonString}</code></pre>;
    } catch (e) {
      // If it was a string but not valid JSON, display as is
      if (typeof obj === 'string') return <pre className="text-xs bg-gray-900/50 p-3 rounded whitespace-pre-wrap"><code>{obj}</code></pre>;
      return <span className="text-red-400 italic">Error displaying metadata.</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-gray-300">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-brand-accent mb-4" />
        <p className="text-xl">Loading SĒQ Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <div className="mb-6 p-4 bg-red-800/30 text-red-300 border border-red-700/50 rounded-lg flex flex-col items-center justify-center shadow-md max-w-lg mx-auto" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3 text-2xl text-red-400 mb-2" />
          <p className="font-semibold mb-1">Access Denied or Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="secondary" iconLeft={faArrowLeft}> Back to Dashboard</Button>
      </div>
    );
  }

  if (!sequence) {
    return (
      <div className="text-center py-10 px-4 text-xl text-gray-400">
        <FontAwesomeIcon icon={faEyeSlash} className="text-5xl text-gray-500 mb-4" />
        <p>Sequence data could not be loaded.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/dashboard')} variant="secondary" iconLeft={faArrowLeft}> Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 text-gray-200">
      <Button onClick={() => navigate(-1)} variant="secondary" size="sm" className="mb-6 group" iconLeft={faArrowLeft}>
        Back
      </Button>

      <div className="bg-gray-800 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-orbitron text-brand-accent mb-2 sm:mb-0 break-all" title={sequence.title}>
              {sequence.title || "Untitled Sequence"}
            </h1>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0 self-start sm:self-center">
              <Tooltip content="Download .SĒQ File" placement="top">
                <Button onClick={handleDownloadSeqFile} variant="primary" size="sm" disabled={!sequence.seq_file_path} iconLeft={faDownload}>
                  Download
                </Button>
              </Tooltip>
              <Tooltip content="Edit Sequence Metadata" placement="top">
                <Button
                  onClick={() => navigate(`/dashboard/edit-sequence/${sequence.id}`)} // Route for editing
                  variant="icon"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 focus:ring-blue-500"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
              </Tooltip>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">ID: <span className="font-mono text-gray-500 text-xs">{sequence.id}</span></p>
          <p className="text-sm text-gray-400">Registered: <span className="text-gray-300">{new Date(sequence.registration_timestamp).toLocaleString()}</span></p>
          {sequence.last_modified && new Date(sequence.last_modified).getTime() !== new Date(sequence.registration_timestamp).getTime() && (
            <p className="text-xs text-gray-500">Last Modified: <span className="text-gray-400">{new Date(sequence.last_modified).toLocaleString()}</span></p>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Description</h3>
            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{sequence.description || <span className="italic">No description provided.</span>}</p>
          </div>

          {/* Placeholder for SĒQ Player/Visualizer - Future Enhancement */}
          {/* <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Sequence Player (Placeholder)</h3>
            <p className="text-center text-gray-500 mt-2 text-sm">Interactive player/visualizer for .SĒQ data coming soon.</p>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Performance Details</h3>
              <ul className="space-y-1.5 text-sm">
                <li><strong className="text-gray-300 w-32 inline-block">Tempo:</strong> {sequence.tempo || <span className="text-gray-500 italic">N/A</span>} BPM</li>
                <li><strong className="text-gray-300 w-32 inline-block">Time Signature:</strong> {sequence.time_signature || <span className="text-gray-500 italic">N/A</span>}</li>
                <li><strong className="text-gray-300 w-32 inline-block">Audio URL:</strong> {sequence.original_media_audio_url ? <a href={sequence.original_media_audio_url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline truncate block max-w-xs">{sequence.original_media_audio_url}</a> : <span className="text-gray-500 italic">N/A</span>}</li>
                <li><strong className="text-gray-300 w-32 inline-block">Video URL:</strong> {sequence.original_media_video_url ? <a href={sequence.original_media_video_url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline truncate block max-w-xs">{sequence.original_media_video_url}</a> : <span className="text-gray-500 italic">N/A</span>}</li>
                 <li><strong className="text-gray-300 w-32 inline-block">Privacy:</strong> <span className="capitalize">{sequence.privacy_setting || 'private'}</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">File Hash (SHA256)</h3>
              <p className="font-mono text-xs text-gray-500 break-all">{sequence.seq_file_hash || "Not available"}</p>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Notation Data Preview</h3>
            {metadataDisplay(sequence.poseqr_notation_data, "No notation data preview available.")}
          </div>
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Custom Metadata</h3>
            {metadataDisplay(sequence.metadata_custom, "No custom metadata provided.")}
          </div>
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Royalty Split Information</h3>
            {metadataDisplay(sequence.royalty_split_info, "No royalty split information provided.")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceDetailPage;
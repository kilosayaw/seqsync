// src/components/dashboard/SequenceDetailPage.jsx
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import sequenceService from '../../services/sequenceService';
import { useAuth } from '../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faEdit, faDownload } from '@fortawesome/free-solid-svg-icons';
import Button from '../common/Button';
// Placeholder for a potential SĒQ Player component
// import SeqPlayer from '../core/media/SeqPlayer'; 

const SequenceDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSequence = useCallback(async () => {
    if (!token || !id) {
      setError("Invalid request or not authenticated.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await sequenceService.getSequenceById(id);
      setSequence(data);
    } catch (err) {
      setError(err.message || "Failed to fetch sequence details.");
      console.error("Fetch sequence detail error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchSequence();
  }, [fetchSequence]);

  const handleDownloadSeqFile = () => {
    if (sequence?.seq_file_path) {
        // The backend serves static files from /uploads
        // The seq_file_path is relative to the project root of the backend
        // e.g., "uploads/seq_files/user_1_timestamp_filename.seqr"
        // The API_BASE_URL is like 'http://localhost:5001/api'
        // So, we need to construct the URL relative to the backend's domain, not the /api path.
        const backendDomain = import.meta.env.VITE_API_BASE_URL ? 
                                new URL(import.meta.env.VITE_API_BASE_URL).origin : 
                                'http://localhost:5001';
        
        const downloadUrl = `${backendDomain}/${sequence.seq_file_path}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        // Extract filename from path, or use title
        const filename = sequence.seq_file_path.split('/').pop() || `${sequence.title.replace(/\s+/g, '_') || 'sequence'}.seqr`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("Attempting to download:", downloadUrl);
    } else {
        alert("Sequence file path not available.");
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-brand-accent" />
        <p className="ml-4 text-xl text-gray-300">Loading sequence details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="mb-4 p-3 bg-red-700/30 text-red-300 border border-red-600 rounded-md text-sm">{error}</p>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/> Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!sequence) {
    return (
      <div className="text-center p-8 text-xl text-gray-400">
        Sequence not found.
        <div className="mt-4">
            <Button onClick={() => navigate('/dashboard')} variant="secondary">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/> Back to Dashboard
            </Button>
        </div>
      </div>
    );
  }
  
  const metadataDisplay = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return <span className="text-gray-500 italic">N/A</span>;
    return <pre className="text-xs bg-gray-900/50 p-3 rounded overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600"><code>{JSON.stringify(obj, null, 2)}</code></pre>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 text-gray-200">
      <Button onClick={() => navigate('/dashboard')} variant="secondary" size="sm" className="mb-6">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Dashboard
      </Button>

      <div className="bg-gray-800 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-3xl sm:text-4xl font-orbitron text-brand-accent mb-2 sm:mb-0">{sequence.title}</h1>
            <div className="flex space-x-2">
                 <Button onClick={handleDownloadSeqFile} variant="primary" size="sm" title="Download .SĒQ File">
                    <FontAwesomeIcon icon={faDownload} className="mr-1.5"/> Download .SĒQ
                </Button>
                <Button onClick={() => navigate(`/dashboard/sequence/${id}/edit`)} variant="secondary" size="sm" className="text-blue-400 hover:bg-blue-700/30" title="Edit Metadata">
                    <FontAwesomeIcon icon={faEdit} className="mr-1.5"/> Edit
                </Button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">ID: <span className="font-mono text-gray-500">{sequence.id}</span></p>
          <p className="text-sm text-gray-400">Registered: <span className="text-gray-300">{new Date(sequence.registration_timestamp).toLocaleString()}</span></p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Description</h3>
            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{sequence.description || <span className="italic">No description provided.</span>}</p>
          </div>

          {/* Placeholder for SĒQ Player/Visualizer */}
          {/* <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Sequence Player (Placeholder)</h3>
            <SeqPlayer sequenceData={sequence.poseqr_notation_data} audioUrl={sequence.original_media_audio_url} />
            <p className="text-center text-gray-500 mt-2 text-sm">Interactive player/visualizer coming soon.</p>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Details</h3>
              <ul className="space-y-1 text-sm">
                <li><strong className="text-gray-300">Tempo:</strong> {sequence.tempo || 'N/A'} BPM</li>
                <li><strong className="text-gray-300">Time Signature:</strong> {sequence.time_signature || 'N/A'}</li>
                <li><strong className="text-gray-300">Audio URL:</strong> {sequence.original_media_audio_url ? <a href={sequence.original_media_audio_url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline truncate block">{sequence.original_media_audio_url}</a> : <span className="text-gray-500 italic">N/A</span>}</li>
                <li><strong className="text-gray-300">Video URL:</strong> {sequence.original_media_video_url ? <a href={sequence.original_media_video_url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline truncate block">{sequence.original_media_video_url}</a> : <span className="text-gray-500 italic">N/A</span>}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">File Hash (SHA256)</h3>
              <p className="font-mono text-xs text-gray-500 break-all">{sequence.seq_file_hash}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Notation Preview (JSON Snippet)</h3>
            {metadataDisplay(sequence.poseqr_notation_preview)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Custom Metadata</h3>
            {metadataDisplay(sequence.metadata_custom)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Royalty Split Info</h3>
            {metadataDisplay(sequence.royalty_split_info)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceDetailPage;
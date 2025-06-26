// src/pages/UserDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import sequenceService from '../services/sequenceService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import SequenceListItem from '../components/dashboard/SequenceListItem'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faExclamationTriangle, faListCheck, faUpload, faCubes } from '@fortawesome/free-solid-svg-icons'; 
import { toast } from 'react-toastify'; // For notifications

const UserDashboardPage = () => {
  const [sequences, setSequences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // For displaying critical fetch errors
  const { user, logout: authLogout } = useAuth(); 
  const navigate = useNavigate();

  const fetchUserSequences = useCallback(async () => {
    if (!localStorage.getItem('seqsync_token')) { 
      setError("Authentication required. Please log in.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await sequenceService.getUserSequences(); 
      // The service should return an object like { sequences: [], total: ..., page: ..., totalPages: ... }
      // For now, assuming it directly returns the array or an object with a sequences array
      setSequences(data?.sequences || (Array.isArray(data) ? data : [])); 
    } catch (err) {
      console.error("Error fetching user sequences:", err);
      const errorMessage = err.message || "Could not load your sequences.";
      setError(errorMessage); // Set error for display
      toast.error(errorMessage); // Also show toast
      if (err.response?.status === 401 || err.name === 'AuthError' && err.message.includes('401')) { 
          authLogout(); 
          navigate('/login', {state: {message: "Your session expired. Please log in again."}});
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, authLogout]); 

  useEffect(() => {
    fetchUserSequences();
  }, [fetchUserSequences]);

  const handleDeleteSequence = async (sequenceId, sequenceTitle) => {
    if (!window.confirm(`Are you sure you want to delete the sequence "${sequenceTitle || 'ID: ' + sequenceId}"? This action cannot be undone.`)) {
        return;
    }
    setError(null); 
    try {
        await sequenceService.deleteSequence(sequenceId);
        setSequences(prevSequences => prevSequences.filter(seq => seq.id !== sequenceId));
        toast.success(`Sequence "${sequenceTitle || 'ID: '+sequenceId}" deleted successfully.`);
    } catch (err) {
        console.error("Error deleting sequence:", err);
        const errorMessage = err.message || "Failed to delete sequence.";
        setError(errorMessage); // Display critical error
        toast.error(errorMessage);
    }
  };
  
  const handleSequenceUpdatedInList = useCallback((updatedSequence) => {
    setSequences(prevSequences => 
        prevSequences.map(seq => seq.id === updatedSequence.id ? updatedSequence : seq)
    );
    // Toast for update success is usually handled in EditSequenceModal or its service call
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-gray-300">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-brand-accent mb-4" />
        <p className="text-xl font-orbitron">Loading your SĒQ library...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-gray-700">
        <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron text-gray-100">
                <FontAwesomeIcon icon={faListCheck} className="mr-3 text-brand-accent"/>
                My SĒQ Library
            </h1>
            {user && <p className="text-sm text-gray-400 mt-1">Manage your poSĒQr™ creations, {user.username || user.email.split('@')[0]}.</p>}
        </div>
        <Button 
            onClick={() => navigate('/dashboard/upload')} 
            variant="primary" 
            size="md" 
            className="mt-4 sm:mt-0 whitespace-nowrap"
            iconLeft={faUpload} // Changed icon
        >
          Upload New SĒQ
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-800/30 text-red-300 border border-red-700/50 rounded-lg flex items-center shadow-lg" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3 text-xl text-red-400" />
          <div>
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && sequences.length === 0 && (
        <div className="text-center py-12 px-6 bg-gray-800 rounded-xl shadow-xl">
          <FontAwesomeIcon icon={faCubes} size="3x" className="text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-3">Your SĒQ Library is Empty</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start by uploading your first poSĒQr™ sequence file. Document, analyze, and share your unique movements.
          </p>
          <Button onClick={() => navigate('/dashboard/upload')} variant="primary" size="lg" iconLeft={faUpload}>
            Upload First SĒQ
          </Button>
        </div>
      )}

      {sequences.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {sequences.map(seq => (
            <SequenceListItem 
                key={seq.id} 
                sequence={seq} 
                onDelete={handleDeleteSequence} 
                onSequenceUpdatedInList={handleSequenceUpdatedInList} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
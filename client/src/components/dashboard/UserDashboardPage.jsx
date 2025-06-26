// src/pages/UserDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import sequenceService from '../services/sequenceService';
import { useAuth } from '../hooks/useAuth'; 
import Button from '../components/common/Button';
import SequenceListItem from '../components/dashboard/SequenceListItem'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faExclamationTriangle, faListCheck, faUpload, faCubes } from '@fortawesome/free-solid-svg-icons';

const UserDashboardPage = () => {
  const [sequences, setSequences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user, logout: authLogout } = useAuth(); // Get logout from auth context
  const navigate = useNavigate();

  const fetchUserSequences = useCallback(async () => {
    // Check if token is available from context first.
    // The localStorage check can be a fallback or for initial load before context is fully hydrated.
    if (!token && !localStorage.getItem('seqsync_token')) { 
      setError("Authentication required. Please log in to view your sequences.");
      setIsLoading(false);
      // navigate('/login'); // Consider redirecting if strictly required
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await sequenceService.getUserSequences(); 
      setSequences(Array.isArray(data) ? data : []); // Ensure sequences is always an array
    } catch (err) {
      console.error("Error fetching user sequences:", err);
      const errorMessage = err.response?.data?.message || err.message || "Could not load your sequences.";
      setError(errorMessage);
      if (err.response?.status === 401) { // Unauthorized
          authLogout(); // Log out user if token is invalid
          navigate('/login', {state: {message: "Your session expired. Please log in again."}});
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, authLogout]); // Added navigate and authLogout as dependencies

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
        alert(`Sequence "${sequenceTitle || 'ID: '+sequenceId}" deleted successfully.`);
    } catch (err) {
        console.error("Error deleting sequence:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to delete sequence.";
        setError(errorMessage);
    }
  };
  
  const handleSequenceUpdatedInList = useCallback((updatedSequence) => {
    setSequences(prevSequences => 
        prevSequences.map(seq => seq.id === updatedSequence.id ? updatedSequence : seq)
    );
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-gray-300">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-brand-accent mb-4" />
        <p className="text-xl">Loading your SĒQ sequences...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4"> {/* Simplified padding slightly */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-gray-700">
        <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron text-gray-100">
                <FontAwesomeIcon icon={faListCheck} className="mr-3 text-brand-accent"/>
                My SĒQ Library
            </h1>
            {user && <p className="text-sm text-gray-400 mt-1">Organize and manage your poSĒQr™ creations, {user.username || user.email.split('@')[0]}.</p>}
        </div>
        <Button 
            onClick={() => navigate('/dashboard/upload')} 
            variant="primary" 
            size="md" 
            className="mt-4 sm:mt-0 whitespace-nowrap" // Ensure button text doesn't wrap awkwardly
            iconLeft={faPlus}
        >
          New SĒQ
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
            It looks like you have not uploaded any sequences yet. 
            Start by creating or uploading your first poSĒQr™ file.
          </p>
          <Button onClick={() => navigate('/dashboard/upload')} variant="primary" size="lg" iconLeft={faUpload}>
            Upload First SĒQ
          </Button>
        </div>
      )}

      {sequences.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"> {/* Adjusted gap */}
          {sequences.map(seq => (
            <SequenceListItem 
                key={seq.id} 
                sequence={seq} 
                onDelete={handleDeleteSequence} // Pass the actual handler
                onSequenceUpdatedInList={handleSequenceUpdatedInList} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
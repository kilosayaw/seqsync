// src/components/dashboard/SequenceListItem.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button'; // Assuming Button component path
import Tooltip from '../common/Tooltip'; // Assuming Tooltip component path
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrashAlt, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import EditSequenceModal from './EditSequenceModal'; // Ensure this path is correct

const SequenceListItem = ({ sequence, onDelete, onSequenceUpdatedInList }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!sequence) {
    return null; // Should not happen if data is fetched correctly
  }

  const formattedDate = sequence.registration_timestamp
    ? new Date(sequence.registration_timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    : 'N/A';

  const lastModifiedDate = sequence.last_modified && sequence.last_modified !== sequence.registration_timestamp
    ? new Date(sequence.last_modified).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      })
    : null;

  const handleOpenEditModal = (e) => {
    e.stopPropagation(); 
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSequenceSuccessfullyUpdated = (updatedSequence) => {
    if (onSequenceUpdatedInList) {
        onSequenceUpdatedInList(updatedSequence); 
    }
    handleCloseEditModal();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    // onDelete expects (sequenceId, sequenceTitle)
    if (typeof onDelete === 'function') {
      onDelete(sequence.id, sequence.title); 
    }
  };
  
  const handleViewDetails = () => {
    navigate(`/dashboard/sequence/${sequence.id}`);
  };
  
  // Placeholder: Navigate to sequencer with this sequence loaded
  const handlePlaySequence = (e) => {
    e.stopPropagation();
    // TODO: Implement logic to load this sequence into the main sequencer
    // This might involve setting context, using URL params, or a global state manager
    alert(`Play sequence "${sequence.title}" - Feature to load in sequencer not yet implemented.`);
    // navigate(`/sequencer?load=${sequence.id}`); // Example of how it might work
  };

  return (
    <>
      <div 
        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-brand-accent/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-brand-accent focus-within:ring-offset-2 focus-within:ring-offset-gray-900"
        onClick={handleViewDetails} 
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleViewDetails(); }} 
        tabIndex={0} 
        role="article"
        aria-labelledby={`seq-title-${sequence.id}`}
      >
        <div className="p-4 sm:p-5 flex-grow">
          <h3 id={`seq-title-${sequence.id}`} className="text-lg sm:text-xl font-orbitron font-semibold text-brand-accent mb-1 sm:mb-2 truncate" title={sequence.title}>
            {sequence.title || "Untitled Sequence"}
          </h3>
          <p className="text-xs text-gray-500 mb-2 sm:mb-3">
            Registered: {formattedDate}
            {lastModifiedDate && (
                <span className="block text-xxs text-gray-600">(Modified: {lastModifiedDate})</span>
            )}
          </p>
          <p className="text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-3 leading-relaxed" title={sequence.description || "No description"}>
            {sequence.description || <span className="italic">No description provided.</span>}
          </p>
          
          {sequence.poseqr_notation_preview && typeof sequence.poseqr_notation_preview === 'object' && Object.keys(sequence.poseqr_notation_preview).length > 0 && (
            <div className="mb-3 p-2 bg-gray-900/50 rounded max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/70">
              <p className="text-xxs font-mono text-gray-500 whitespace-pre-wrap">
                {JSON.stringify(sequence.poseqr_notation_preview, null, 1).substring(0,150) + (JSON.stringify(sequence.poseqr_notation_preview, null, 1).length > 150 ? "..." : "")}
              </p>
            </div>
          )}
           {(sequence.tempo || sequence.time_signature) && (
            <div className="text-xs text-gray-500 mb-2">
              {sequence.tempo && <span className="mr-2">Tempo: {sequence.tempo} BPM</span>}
              {sequence.time_signature && <span>Time Sig: {sequence.time_signature}</span>}
            </div>
           )}
        </div>
        <div className="p-3 sm:p-4 bg-gray-800/60 border-t border-gray-700/60 flex items-center justify-end space-x-2">
          <Tooltip content="Play/Load in Sequencer (WIP)" placement="top">
            <Button onClick={handlePlaySequence} variant="icon" size="sm" aria-label={`Load sequence ${sequence.title} in sequencer`} className="text-green-400 hover:text-green-300">
              <FontAwesomeIcon icon={faPlayCircle} />
            </Button>
          </Tooltip>
          <Tooltip content="View Details" placement="top">
            <Button onClick={(e)=>{e.stopPropagation(); handleViewDetails();}} variant="icon" size="sm" aria-label={`View details for ${sequence.title}`}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
          </Tooltip>
          <Tooltip content="Edit Metadata" placement="top">
            <Button 
              onClick={handleOpenEditModal} variant="icon" size="sm"
              className="text-blue-400 hover:text-blue-300"
              aria-label={`Edit metadata for ${sequence.title}`}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </Tooltip>
          <Tooltip content="Delete Sequence" placement="top">
            <Button 
              onClick={handleDeleteClick} variant="icon" 
              className="text-red-500 hover:text-red-400" 
              size="sm" aria-label={`Delete sequence ${sequence.title}`}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </Tooltip>
        </div>
      </div>
      {/* EditSequenceModal is rendered conditionally here, scoped to this item */}
      {isEditModalOpen && (
        <EditSequenceModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          sequence={sequence}
          onSequenceUpdated={handleSequenceSuccessfullyUpdated}
        />
      )}
    </>
  );
};

SequenceListItem.propTypes = {
  sequence: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    registration_timestamp: PropTypes.string,
    last_modified: PropTypes.string,
    poseqr_notation_preview: PropTypes.any,
    tempo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    time_signature: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onSequenceUpdatedInList: PropTypes.func.isRequired,
};

export default SequenceListItem;
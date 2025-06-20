// SEGSYNC/client/src/components/dashboard/EditSequenceModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ModalBase from '../common/ModalBase';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import sequenceService from '../../services/sequenceService'; // Ensure this path is correct
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const PRIVACY_OPTIONS = [
    { value: 'private', label: 'Private (Only you can see)' },
    { value: 'unlisted', label: 'Unlisted (Anyone with the link)' },
    { value: 'public', label: 'Public (Visible to everyone)' },
];

const EditSequenceModal = ({ isOpen, onClose, sequence, onSequenceUpdated }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen && sequence) {
      setFormData({
        title: sequence.title || '',
        description: sequence.description || '',
        original_media_audio_url: sequence.original_media_audio_url || '',
        original_media_video_url: sequence.original_media_video_url || '',
        tempo: sequence.tempo?.toString() || '',
        time_signature: sequence.time_signature || '4/4',
        privacy_setting: sequence.privacy_setting || 'private',
        metadata_custom: sequence.metadata_custom ? JSON.stringify(sequence.metadata_custom, null, 2) : '',
        royalty_split_info: sequence.royalty_split_info ? JSON.stringify(sequence.royalty_split_info, null, 2) : '',
      });
      setFormError('');
    } else if (!isOpen) { // Reset form when modal closes
        setFormData({});
        setFormError('');
    }
  }, [isOpen, sequence]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const validateEditForm = () => {
    // ... (validation logic from your previous paste - ensure it's correct) ...
    if (!formData.title || formData.title.trim() === "") { setFormError("Title is required."); return false; }
    if (formData.title.trim().length > 255) { setFormError("Title cannot exceed 255 characters."); return false; }
    if (formData.description && formData.description.length > 2000) { setFormError("Description is too long (max 2000 chars)."); return false; }
    if (formData.tempo && formData.tempo.trim() !== '' && (isNaN(parseInt(formData.tempo)) || parseInt(formData.tempo) < 20 || parseInt(formData.tempo) > 400)) {
      setFormError('Tempo, if provided, must be a number between 20 and 400.'); return false;
    }
    if (formData.time_signature && formData.time_signature.trim() !== '' && !/^\d{1,2}\/\d{1,2}$/.test(formData.time_signature)) {
      setFormError('Time signature must be in format like "4/4" or empty.'); return false;
    }
    const jsonFieldsToValidate = { metadata_custom: formData.metadata_custom, royalty_split_info: formData.royalty_split_info };
    for (const [key, value] of Object.entries(jsonFieldsToValidate)) {
        if (value && typeof value === 'string' && value.trim()) {
            try { JSON.parse(value); }
            catch (jsonError) {
                setFormError(`Invalid JSON format in '${key.replace(/_/g, ' ')}'. Provide valid JSON or leave empty.`);
                return false;
            }
        }
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;
    if (!sequence || !sequence.id) { toast.error("Sequence ID is missing."); return; }

    setIsLoading(true);
    const dataToSubmit = { ...formData };
    const jsonFieldsToParse = ['metadata_custom', 'royalty_split_info'];
    for (const field of jsonFieldsToParse) {
      if (dataToSubmit[field] && typeof dataToSubmit[field] === 'string' && dataToSubmit[field].trim()) {
        try { dataToSubmit[field] = JSON.parse(dataToSubmit[field]); }
        catch (jsonError) { /* Should be caught by validateEditForm */ }
      } else { dataToSubmit[field] = null; }
    }
    dataToSubmit.tempo = dataToSubmit.tempo?.trim() ? parseInt(dataToSubmit.tempo, 10) : null;
    dataToSubmit.time_signature = dataToSubmit.time_signature?.trim() ? dataToSubmit.time_signature.trim() : null;

    try {
      const updatedSequenceData = await sequenceService.updateSequenceMetadata(sequence.id, dataToSubmit);
      onSequenceUpdated(updatedSequenceData);
      onClose();
      // toast.success is handled by the service
    } catch (err) {
      console.error('Update sequence metadata failed (component):', err);
      // toast.error is handled by service, but you can set a local error too if needed
      // setFormError(err.message || "Failed to update.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Edit Details: ${formData?.title || sequence?.title || 'Sequence'}`} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
    <div className="p-3 bg-red-700/30 text-red-300 border border-red-600 rounded-md text-sm flex items-center" role="alert">
        <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-lg" />
        {formError}
    </div>
)}
        <Input id={`edit-title-${sequence?.id}`} name="title" label="Title*" type="text" value={formData.title || ''} onChange={handleChange} required disabled={isLoading} />
        <Input id={`edit-description-${sequence?.id}`} name="description" label="Description" type="textarea" rows={3} value={formData.description || ''} onChange={handleChange} disabled={isLoading} inputClassName="min-h-[70px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id={`edit-tempo-${sequence?.id}`} name="tempo" label="Tempo (BPM)" type="number" value={formData.tempo || ''} onChange={handleChange} disabled={isLoading} placeholder="e.g., 120 (20-400)" min="20" max="400"/>
            <Input id={`edit-timeSignature-${sequence?.id}`} name="time_signature" label="Time Signature" type="text" value={formData.time_signature || ''} onChange={handleChange} disabled={isLoading} placeholder="e.g., 4/4" pattern="\d{1,2}\/\d{1,2}"/>
        </div>
         <Select
            id={`edit-privacy_setting-${sequence?.id}`} name="privacy_setting" label="Privacy Setting"
            value={formData.privacy_setting || 'private'} onChange={handleChange}
            options={PRIVACY_OPTIONS} disabled={isLoading}
        />
        <Input id={`edit-audioUrl-${sequence?.id}`} name="original_media_audio_url" label="Original Audio URL" type="url" value={formData.original_media_audio_url || ''} onChange={handleChange} disabled={isLoading} placeholder="https://..."/>
        <Input id={`edit-videoUrl-${sequence?.id}`} name="original_media_video_url" label="Original Video URL" type="url" value={formData.original_media_video_url || ''} onChange={handleChange} disabled={isLoading} placeholder="https://..."/>
        <Input id={`edit-metadataCustom-${sequence?.id}`} name="metadata_custom" label="Custom Metadata (JSON)" type="textarea" rows={2} value={formData.metadata_custom || ''} onChange={handleChange} disabled={isLoading} inputClassName="font-mono text-xs" placeholder='e.g., {"genre": "hip-hop"}'/>
        <Input id={`edit-royaltySplitInfo-${sequence?.id}`} name="royalty_split_info" label="Royalty Split Info (JSON)" type="textarea" rows={2} value={formData.royalty_split_info || ''} onChange={handleChange} disabled={isLoading} inputClassName="font-mono text-xs" placeholder='e.g., {"creatorA": 100}'/>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isLoading} iconLeft={isLoading ? faSpinner : faSave} iconProps={isLoading ? {spin: true, className:"mr-2"} : {className:"mr-2"}}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

EditSequenceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sequence: PropTypes.object,
  onSequenceUpdated: PropTypes.func.isRequired,
};

export default EditSequenceModal;
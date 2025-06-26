// SEGSYNC/client/src/services/sequenceService.js
import apiClient from './apiClient';
import { toast } from 'react-toastify';

const getUserSequences = async (params = { page: 1, limit: 10 }) => {
  try {
    const response = await apiClient.get('/sequences', { params });
    return response.data.data; // Expects { sequences: [], total: ..., page: ..., totalPages: ... }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch sequences.';
    toast.error(errorMsg);
    throw error.response?.data || new Error(errorMsg);
  }
};

const getSequenceById = async (sequenceId) => {
  try {
    const response = await apiClient.get(`/sequences/${sequenceId}`);
    return response.data.data.sequence; // Expects { sequence: {...} }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || `Failed to fetch sequence ${sequenceId}.`;
    toast.error(errorMsg);
    throw error.response?.data || new Error(errorMsg);
  }
};

const uploadSequence = async (formData) => {
  try {
    const response = await apiClient.post('/sequences', formData, {
      headers: { 'Content-Type': undefined } // Let Axios set for FormData
    });
    toast.success(`Sequence "${response.data.data.sequence?.title || 'New Sequence'}" uploaded!`);
    return response.data.data.sequence;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Sequence upload failed.';
    toast.error(errorMsg);
    throw error.response?.data || new Error(errorMsg);
  }
};

const updateSequenceMetadata = async (sequenceId, metadataUpdates) => {
  try {
    const response = await apiClient.put(`/sequences/${sequenceId}/metadata`, metadataUpdates);
    toast.success(`Sequence "${response.data.data.sequence?.title || 'Sequence'}" metadata updated!`);
    return response.data.data.sequence;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update sequence metadata.';
    toast.error(errorMsg);
    throw error.response?.data || new Error(errorMsg);
  }
};

const deleteSequence = async (sequenceId) => {
  try {
    await apiClient.delete(`/sequences/${sequenceId}`);
    toast.success(`Sequence (ID: ${sequenceId}) deleted successfully.`);
    // No specific data returned on 204, but can return a success object if needed
    return { message: 'Sequence deleted' };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to delete sequence.';
    toast.error(errorMsg);
    throw error.response?.data || new Error(errorMsg);
  }
};

const sequenceService = { /* ... exports ... */ getUserSequences, getSequenceById, uploadSequence, updateSequenceMetadata, deleteSequence };
export default sequenceService;
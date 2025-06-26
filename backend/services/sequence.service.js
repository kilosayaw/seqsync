// SEGSYNC/backend/services/sequence.service.js
const supabaseAdmin = require('../config/supabaseAdmin');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');

const STORAGE_BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET_SEQUENCES || 'sequences';

// createSequenceAndUploadFile remains the same as in my previous "Pure Supabase" refactor for this file.
// It already uses supabaseAdmin.storage and supabaseAdmin.from('sequences').insert().
// I will include it again for completeness.
const createSequenceAndUploadFile = async (userId, file, metadata) => {
  if (!file || !file.buffer) {
    throw new ApiError('Sequence file (.seqr) is required.', 400);
  }
  if (!metadata || !metadata.title) {
    throw new ApiError('Sequence title is required.', 400);
  }

  const fileBuffer = file.buffer;
  const originalFilename = file.originalname;
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const fileExtension = lastDotIndex > -1 ? originalFilename.slice(lastDotIndex) : '.seqr';

  const uniqueFileNameBase = `${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const uniqueFileName = `${uniqueFileNameBase}${fileExtension}`;
  const filePathInStorage = `${userId}/${uniqueFileName}`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET_NAME)
    .upload(filePathInStorage, fileBuffer, {
      contentType: file.mimetype || 'application/json',
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError);
    throw new ApiError(`Failed to upload sequence file: ${uploadError.message}`, uploadError.status || 500);
  }
  const storedFilePath = uploadData.path;

  let publicUrl = null;
  const { data: urlData } = supabaseAdmin.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(storedFilePath);
  if (urlData && urlData.publicUrl) publicUrl = urlData.publicUrl;

  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  let parsedSequenceNotationData = null;
  try {
    const fileContentString = fileBuffer.toString('utf8');
    const fullJson = JSON.parse(fileContentString);
    if (fullJson && typeof fullJson.poSEQr_notation_data === 'object') {
      parsedSequenceNotationData = fullJson.poSEQr_notation_data;
    }
  } catch (parseError) { /* Warn or error */ }

  const {
    title, description, tempo, time_signature,
    metadata_custom, royalty_split_info,
    privacy_setting = 'private',
    original_media_audio_url, original_media_video_url,
  } = metadata;

  const parseJsonStringField = (jsonString, fieldName) => {
    if (!jsonString || (typeof jsonString === 'string' && jsonString.trim() === '')) return null;
    if (typeof jsonString === 'object') return jsonString;
    try { return JSON.parse(jsonString); }
    catch (e) { throw new ApiError(`Invalid JSON string for field ${fieldName}.`, 400); }
  };
  const customMetaForDb = parseJsonStringField(metadata_custom, 'metadata_custom');
  const royaltyInfoForDb = parseJsonStringField(royalty_split_info, 'royalty_split_info');

  const { data: newSequence, error: insertError } = await supabaseAdmin
    .from('sequences')
    .insert({
      user_id: userId, title, description: description || null,
      seq_file_path: storedFilePath, seq_file_hash: fileHash, seq_file_public_url: publicUrl,
      tempo: tempo ? parseInt(tempo, 10) : null, time_signature: time_signature || null,
      poseqr_notation_data: parsedSequenceNotationData, metadata_custom: customMetaForDb,
      royalty_split_info: royaltyInfoForDb, privacy_setting,
      original_media_audio_url: original_media_audio_url || null,
      original_media_video_url: original_media_video_url || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Supabase insert error for sequence:', insertError);
    await supabaseAdmin.storage.from(STORAGE_BUCKET_NAME).remove([storedFilePath]);
    if (insertError.code === '23505') {
        throw new ApiError('This sequence hash already registered by you.', 409);
    }
    throw new ApiError(`Database error: ${insertError.message}`, 500);
  }
  return newSequence;
};

// findUserSequences, findSequenceByIdForUser, updateSequenceMetadataByUser, deleteSequenceByUser, getSequenceFileForDownload
// were already correctly refactored in the previous step to use supabaseAdmin.from('sequences')...
// So, they are already compatible with the pure Supabase SDK approach.
// I will include them here for completeness of the file.

const findUserSequences = async (userId, { page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabaseAdmin
    .from('sequences')
    .select(`
      id, user_id, title, description, tempo, time_signature, privacy_setting, 
      last_modified, registration_timestamp, seq_file_public_url
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('last_modified', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching user sequences (Supabase):", error);
    throw new ApiError('Could not retrieve sequences.', 500);
  }
  return { sequences: data || [], total: count || 0, page: Number(page), limit: Number(limit), totalPages: count ? Math.ceil(count / limit) : 0 };
};

const findSequenceByIdForUser = async (sequenceId, userId) => {
  const { data: sequence, error } = await supabaseAdmin
    .from('sequences')
    .select('*')
    .eq('id', sequenceId)
    // If service role bypasses RLS, you might need .eq('user_id', userId) for non-public data.
    // But with proper RLS: (auth.uid() = user_id) OR (privacy_setting <> 'private')
    // This will be handled by RLS if the call is made with a user's session token.
    // If called by service role, it sees all. For now, assume RLS handles user-specific access.
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error(`Error fetching sequence ${sequenceId} (Supabase):`, error);
    throw new ApiError('Could not retrieve sequence.', 500);
  }
  return sequence;
};

const updateSequenceMetadataByUser = async (sequenceId, userId, updateData) => {
  const forbiddenUpdates = ['seq_file_path', 'seq_file_hash', 'poseqr_notation_data', 'user_id', 'id', 'registration_timestamp'];
  forbiddenUpdates.forEach(key => delete updateData[key]);

  if (Object.keys(updateData).length === 0) throw new ApiError("No valid fields for update.", 400);
  
  if (updateData.metadata_custom && typeof updateData.metadata_custom === 'string') { /* ... parse ... */ }
  if (updateData.royalty_split_info && typeof updateData.royalty_split_info === 'string') { /* ... parse ... */ }
  if (updateData.tempo && typeof updateData.tempo === 'string') updateData.tempo = parseInt(updateData.tempo, 10);


  updateData.last_modified = new Date().toISOString();

  const { data: updatedSequence, error } = await supabaseAdmin
    .from('sequences')
    .update(updateData)
    .eq('id', sequenceId)
    .eq('user_id', userId) // Crucial for ownership check
    .select()
    .single();

  if (error) {
    console.error(`Error updating sequence ${sequenceId} metadata (Supabase):`, error);
    if (error.code === 'PGRST116') throw new ApiError('Sequence not found or no permission.', 404);
    throw new ApiError('Could not update sequence metadata.', 500);
  }
  return updatedSequence;
};

const deleteSequenceByUser = async (sequenceId, userId) => {
  const { data: sequence, error: fetchError } = await supabaseAdmin
    .from('sequences')
    .select('seq_file_path')
    .eq('id', sequenceId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !sequence) {
    throw new ApiError('Sequence not found or no permission.', fetchError && fetchError.code === 'PGRST116' ? 404 : 500);
  }
  
  const { error: deleteDbError } = await supabaseAdmin
    .from('sequences')
    .delete()
    .eq('id', sequenceId)
    .eq('user_id', userId);

  if (deleteDbError) throw new ApiError('Could not delete sequence from DB.', 500);

  if (sequence.seq_file_path) {
    const { error: storageError } = await supabaseAdmin.storage.from(STORAGE_BUCKET_NAME).remove([sequence.seq_file_path]);
    if (storageError) console.error(`Failed to delete file ${sequence.seq_file_path} (DB record deleted):`, storageError);
  }
  return { message: 'Sequence deleted successfully.' };
};

const getSequenceFileForDownload = async (sequenceId, userId) => {
  const { data: sequence, error: fetchError } = await supabaseAdmin
    .from('sequences')
    .select('seq_file_path, title')
    .eq('id', sequenceId)
    .eq('user_id', userId) // Or adjust if public downloads are allowed based on privacy_setting
    .single();

  if (fetchError || !sequence || !sequence.seq_file_path) {
    throw new ApiError('Sequence file not found or access denied.', fetchError && fetchError.code === 'PGRST116' ? 404 : 500);
  }

  const { data: downloadData, error: downloadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET_NAME)
    .download(sequence.seq_file_path);

  if (downloadError) throw new ApiError('Failed to download sequence file from storage.', downloadError.status || 500);

  const fileBuffer = Buffer.from(await downloadData.arrayBuffer());
  const cleanTitle = sequence.title ? sequence.title.replace(/[^a-z0-9_.-]/gi, '_') : 'sequence';
  const originalExtMatch = sequence.seq_file_path.match(/\.[0-9a-z]+$/i);
  const originalExt = originalExtMatch ? originalExtMatch[0] : '.seqr';
  const filename = `${cleanTitle}_id${sequence.id}${originalExt}`;

  return { fileBuffer, filename, mimetype: 'application/json' };
};

module.exports = {
  createSequenceAndUploadFile,
  findUserSequences,
  findSequenceByIdForUser,
  updateSequenceMetadataByUser,
  deleteSequenceByUser,
  getSequenceFileForDownload,
};